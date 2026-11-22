// Command sum-app is the server for the SUM app at app.sumatx.us.
//
// It listens on a loopback port behind Apache on the hosting account
// (docs/02-architecture.md, docs/13-ci-cd.md). So far it serves a holding page
// and /healthz: the scaffold exists to prove the path from a merge to the
// server before any feature rides on it.
package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/jroedel/sum-app/app/domain/docsapp"
	"github.com/jroedel/sum-app/app/domain/homeapp"
	"github.com/jroedel/sum-app/app/sdk/health"
	"github.com/jroedel/sum-app/app/sdk/page"
	"github.com/jroedel/sum-app/foundation/build"
	"github.com/jroedel/sum-app/foundation/logger"
	"github.com/jroedel/sum-app/foundation/web"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "sum-app:", err)
		os.Exit(1)
	}
}

func run() error {
	var (
		configPath = flag.String("config", "config.toml", "path to the configuration file")
		check      = flag.Bool("check", false, "load and validate the configuration, print a summary, and exit")
	)

	flag.Parse()

	cfg, err := loadConfig(*configPath)
	if err != nil {
		return err
	}

	// -check exists for the deploy, which runs the *new* binary against the
	// *live* config while the old one is still serving. A config the new
	// binary will not accept is then a deploy that swaps nothing, rather than
	// a process that dies after the rename with the previous one gone.
	if *check {
		fmt.Print(cfg.summary(build.Commit()))
		return nil
	}

	logFile, shouldClose, err := openLog(cfg.Log.File)
	if err != nil {
		return err
	}
	if shouldClose {
		defer logFile.Close()
	}

	level, err := logger.Level(cfg.Log.Level)
	if err != nil {
		return fmt.Errorf("%s: %w", *configPath, err)
	}

	log := logger.New(logFile, level)
	log.Info("starting", "commit", build.Commit(), "public", cfg.Server.BaseURL)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	return web.Serve(ctx, log, cfg.Server.ShutdownGrace.Duration, cfg.Server.Addr, routes(log))
}

// routes is every route the app answers, inside the middleware every request
// passes through. The order of the chain is the order it is read in: the
// request id first, so the request line and a panic line share it; logging
// outside panics, so a panic still gets its request line; headers before
// anything can write a body.
func routes(log *slog.Logger) http.Handler {
	mux := http.NewServeMux()

	mux.Handle("GET /healthz", health.Handler(build.Commit()))
	homeapp.Routes(mux)
	docsapp.Routes(mux)

	return web.Wrap(mux,
		web.RequestID(),
		web.Logging(log),
		web.Panics(log),
		web.SecureHeaders(page.Policy()),
	)
}
