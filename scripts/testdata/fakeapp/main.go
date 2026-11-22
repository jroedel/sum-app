// Command fakeapp stands in for sum-app in scripts/receive-test.sh.
//
// It speaks just enough of the real binary's interface for the receiver to be
// tested end to end: -config and -check, with -check's summary in the real
// wording, and /healthz answering "ok <commit>". The commit is set at build
// time with -X, which the real binary deliberately does not use
// (foundation/build): here the test needs builds that claim whatever commit it
// likes. With -X main.broken=yes it passes -check and then exits at once
// instead of serving, which is the release the receiver must roll back.
//
// It lives under testdata so that ./... never builds, vets or tests it.
package main

import (
	"context"
	"flag"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"regexp"
	"syscall"
)

var (
	commit = "unknown"
	broken = ""
)

func main() {
	configPath := flag.String("config", "config.toml", "")
	check := flag.Bool("check", false, "")
	flag.Parse()

	raw, err := os.ReadFile(*configPath)
	if err != nil {
		fmt.Fprintln(os.Stderr, "fakeapp:", err)
		os.Exit(1)
	}

	addr := setting(raw, "addr")
	base := setting(raw, "base_url")

	if *check {
		fmt.Printf("listening on   %s\npublic address %s\ncommit         %s\n", addr, base, commit)
		return
	}

	if broken == "yes" {
		fmt.Fprintln(os.Stderr, "fakeapp: broken on purpose")
		os.Exit(1)
	}

	// Stop on SIGINT and SIGTERM, as the real binary does through
	// signal.NotifyContext. Without this the fake keeps the signal
	// disposition it was started with, and a process started in the
	// background by a non-interactive shell starts with SIGINT ignored, so
	// supervise.sh's polite stop did nothing and a test left the fake holding
	// its port for the next run.
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	go func() {
		<-ctx.Done()
		os.Exit(0)
	}()

	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "ok %s\n", commit)
	})

	if err := http.ListenAndServe(addr, nil); err != nil {
		fmt.Fprintln(os.Stderr, "fakeapp:", err)
		os.Exit(1)
	}
}

func setting(raw []byte, key string) string {
	m := regexp.MustCompile(`(?m)^` + key + ` = "([^"]*)"`).FindSubmatch(raw)
	if m == nil {
		return ""
	}

	return string(m[1])
}
