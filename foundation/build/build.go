// Package build reports which commit this binary was built from.
package build

import (
	"runtime/debug"
	"sync"
)

// Commit is the full hash of the commit this binary was built from, with
// "-dirty" appended when the working tree had uncommitted changes, or "unknown"
// when the build carries no version-control information (go test, go run).
//
// It is read from the build info the go command stamps into every binary built
// inside a git checkout, rather than passed in with -ldflags -X. A flag is one
// more thing the Makefile and CI must agree on, and the day one of them forgets
// it the binary reports an empty commit with no error. The stamp cannot be
// forgotten.
//
// The deploy relies on it: /healthz reports it, and the deploy's public check
// compares it with the commit it meant to ship, which is how a deploy notices
// that the old process is still the one answering.
var Commit = sync.OnceValue(func() string {
	info, ok := debug.ReadBuildInfo()
	if !ok {
		return "unknown"
	}

	var revision, modified string
	for _, s := range info.Settings {
		switch s.Key {
		case "vcs.revision":
			revision = s.Value
		case "vcs.modified":
			modified = s.Value
		}
	}

	switch {
	case revision == "":
		return "unknown"
	case modified == "true":
		return revision + "-dirty"
	}

	return revision
})
