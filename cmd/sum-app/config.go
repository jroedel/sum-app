package main

import (
	"fmt"
	"net"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/BurntSushi/toml"
)

// config is the whole runtime configuration, read from a TOML file.
//
// A file rather than environment variables, because the server is a shared
// hosting account with no systemd: the process is started by a script from
// cron, and a file it reads is the only place a secret can live that is not
// the command line. Secrets reach that file from a person's machine
// (make secrets-install), never through GitHub (docs/13-ci-cd.md, "Secrets").
//
// Every field is tagged. The decoder matches keys case-insensitively, so
// `shutdown_grace` would not find `ShutdownGrace`, and because an unknown key
// is a startup error here, an untagged field would turn a correct file into a
// refusal to start. (From stewards.)
type config struct {
	Server struct {
		// Addr is where the process listens: the loopback port the
		// .htaccess on the server proxies to.
		Addr string `toml:"addr"`

		// BaseURL is the public address, https://app.sumatx.us in
		// production. Taken from here and never from the request, because
		// behind konsoleH's proxy the Host header is the loopback. The
		// deploy's pre-flight checks it, after a stale base URL once sent
		// mass-intentions' sign-in links to a dead host.
		BaseURL       string   `toml:"base_url"`
		ShutdownGrace duration `toml:"shutdown_grace"`
	} `toml:"server"`

	Log struct {
		Level string `toml:"level"`
		File  string `toml:"file"`
	} `toml:"log"`
}

// duration is a time.Duration that TOML can read as "15s".
type duration struct{ time.Duration }

func (d *duration) UnmarshalText(text []byte) error {
	parsed, err := time.ParseDuration(string(text))
	if err != nil {
		return fmt.Errorf("%q is not a duration; write it like 15s or 2m", text)
	}

	d.Duration = parsed

	return nil
}

// loadConfig reads and validates the file, or explains what is wrong with it.
//
// An unrecognised key is an error rather than a warning: a mistyped key that
// is silently accepted is a setting that looks configured and is not.
func loadConfig(path string) (config, error) {
	var cfg config

	md, err := toml.DecodeFile(path, &cfg)
	if err != nil {
		if os.IsNotExist(err) {
			return cfg, fmt.Errorf("there is no config file at %s; copy config.example.toml to %s and edit it", path, path)
		}

		return cfg, fmt.Errorf("reading %s: %w", path, err)
	}

	if keys := md.Undecoded(); len(keys) > 0 {
		names := make([]string, len(keys))
		for i, k := range keys {
			names[i] = k.String()
		}

		return cfg, fmt.Errorf("%s has settings this binary does not know: %s. Check them for a typo", path, strings.Join(names, ", "))
	}

	// Required, with no default port. Two apps share this hosting account
	// and the ports on it, so a default would one day be somebody else's
	// port, and the deploy's pre-flight must find the port the .htaccess
	// names written down rather than assumed.
	host, _, err := net.SplitHostPort(cfg.Server.Addr)
	switch {
	case cfg.Server.Addr == "":
		return cfg, fmt.Errorf("%s needs [server] addr, the loopback address to listen on, such as 127.0.0.1:8460", path)
	case err != nil:
		return cfg, fmt.Errorf("%s has [server] addr %q; write a host and port, such as 127.0.0.1:8460", path, cfg.Server.Addr)
	case !isLoopback(host):
		// Apache is the only way in. A port open on every interface would
		// be a second front door with no TLS in front of it.
		return cfg, fmt.Errorf("%s has [server] addr %q; listen on the loopback only, such as 127.0.0.1:8460", path, cfg.Server.Addr)
	}

	base, err := url.Parse(cfg.Server.BaseURL)
	switch {
	case cfg.Server.BaseURL == "":
		return cfg, fmt.Errorf("%s needs [server] base_url, the public address, such as https://app.sumatx.us", path)
	case err != nil || base.Host == "" || (base.Path != "" && base.Path != "/") || base.RawQuery != "":
		return cfg, fmt.Errorf("%s has [server] base_url %q; write only the scheme and host, such as https://app.sumatx.us", path, cfg.Server.BaseURL)
	case base.Scheme != "https" && !(base.Scheme == "http" && isLoopback(base.Hostname())):
		// http only for a developer's own machine.
		return cfg, fmt.Errorf("%s has [server] base_url %q; it must start https:// unless it is this machine", path, cfg.Server.BaseURL)
	}

	cfg.Server.BaseURL = base.Scheme + "://" + base.Host

	if cfg.Server.ShutdownGrace.Duration == 0 {
		cfg.Server.ShutdownGrace.Duration = 15 * time.Second
	}

	return cfg, nil
}

// summary is what -check prints. It names every setting that decides
// behaviour, and will never name one that is a secret.
//
// The deploy's pre-flight reads two of these lines exactly: "listening on"
// must name the port Apache proxies to, and "public address" must be
// https://app.sumatx.us. Change their wording and change the receiver with it.
func (c config) summary(commit string) string {
	var b strings.Builder

	fmt.Fprintf(&b, "listening on   %s\n", c.Server.Addr)
	fmt.Fprintf(&b, "public address %s\n", c.Server.BaseURL)
	fmt.Fprintf(&b, "log level      %s\n", orElse(c.Log.Level, "info"))
	fmt.Fprintf(&b, "log file       %s\n", orElse(c.Log.File, "(stderr)"))
	fmt.Fprintf(&b, "shutdown grace %s\n", c.Server.ShutdownGrace.Duration)
	fmt.Fprintf(&b, "commit         %s\n", commit)

	return b.String()
}

func isLoopback(host string) bool {
	if host == "localhost" {
		return true
	}

	ip := net.ParseIP(host)

	return ip != nil && ip.IsLoopback()
}

func orElse(s, fallback string) string {
	if s == "" {
		return fallback
	}

	return s
}

// openLog returns the destination for log lines, and whether the caller owns
// it. Empty means stderr, which the supervisor on the server redirects into a
// file, so the process never has to know it is being supervised.
func openLog(path string) (*os.File, bool, error) {
	if path == "" {
		return os.Stderr, false, nil
	}

	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o600)
	if err != nil {
		return nil, false, fmt.Errorf("opening the log file %s: %w", path, err)
	}

	return f, true, nil
}
