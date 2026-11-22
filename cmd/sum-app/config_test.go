package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func writeConfig(t *testing.T, body string) string {
	t.Helper()

	path := filepath.Join(t.TempDir(), "config.toml")
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}

	return path
}

const goodConfig = `
[server]
addr = "127.0.0.1:8460"
base_url = "https://app.sumatx.us/"
`

func TestLoadConfigAcceptsAndNormalises(t *testing.T) {
	cfg, err := loadConfig(writeConfig(t, goodConfig))
	if err != nil {
		t.Fatal(err)
	}

	if cfg.Server.BaseURL != "https://app.sumatx.us" {
		t.Errorf("base_url = %q, want the trailing slash dropped", cfg.Server.BaseURL)
	}

	if cfg.Server.ShutdownGrace.Duration != 15*time.Second {
		t.Errorf("shutdown grace = %s, want the 15s default", cfg.Server.ShutdownGrace.Duration)
	}
}

// The deploy's pre-flight reads these two lines exactly. If this test has to
// change, deploy/receive.sh changes with it.
func TestSummaryLinesTheDeployReads(t *testing.T) {
	cfg, err := loadConfig(writeConfig(t, goodConfig))
	if err != nil {
		t.Fatal(err)
	}

	got := cfg.summary("abc123")

	for _, want := range []string{
		"listening on   127.0.0.1:8460\n",
		"public address https://app.sumatx.us\n",
		"commit         abc123\n",
	} {
		if !strings.Contains(got, want) {
			t.Errorf("summary is missing %q:\n%s", want, got)
		}
	}
}

func TestLoadConfigRefuses(t *testing.T) {
	tests := []struct {
		name string
		body string
		want string
	}{
		{"an unknown key", goodConfig + "\n[db]\npath = \"x.db\"\n", "db.path. Check them for a typo"},
		{"no addr", "[server]\nbase_url = \"https://app.sumatx.us\"\n", "needs [server] addr"},
		{"an addr on every interface", "[server]\naddr = \":8460\"\nbase_url = \"https://app.sumatx.us\"\n", "loopback only"},
		{"a public addr", "[server]\naddr = \"0.0.0.0:8460\"\nbase_url = \"https://app.sumatx.us\"\n", "loopback only"},
		{"no base_url", "[server]\naddr = \"127.0.0.1:8460\"\n", "needs [server] base_url"},
		{"a base_url with a path", "[server]\naddr = \"127.0.0.1:8460\"\nbase_url = \"https://app.sumatx.us/home\"\n", "only the scheme and host"},
		{"plain http to a public host", "[server]\naddr = \"127.0.0.1:8460\"\nbase_url = \"http://app.sumatx.us\"\n", "must start https://"},
		{"a bad duration", goodConfig + "shutdown_grace = \"soon\"\n", "not a duration"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := loadConfig(writeConfig(t, tt.body))
			if err == nil || !strings.Contains(err.Error(), tt.want) {
				t.Fatalf("err = %v, want one containing %q", err, tt.want)
			}
		})
	}
}

func TestLoadConfigAllowsHTTPOnThisMachine(t *testing.T) {
	_, err := loadConfig(writeConfig(t, "[server]\naddr = \"127.0.0.1:8460\"\nbase_url = \"http://localhost:8460\"\n"))
	if err != nil {
		t.Fatal(err)
	}
}

func TestLoadConfigMissingFileSaysWhatToDo(t *testing.T) {
	_, err := loadConfig(filepath.Join(t.TempDir(), "config.toml"))
	if err == nil || !strings.Contains(err.Error(), "copy config.example.toml") {
		t.Fatalf("err = %v, want it to say to copy the example", err)
	}
}

// The example in the repository root must load, so that the first thing a
// new contributor does works.
func TestConfigExampleLoads(t *testing.T) {
	if _, err := loadConfig(filepath.Join("..", "..", "config.example.toml")); err != nil {
		t.Fatal(err)
	}
}
