// Package health answers whether this process is fit to serve.
package health

import (
	"net/http"
)

// Handler answers "ok" and the commit this binary was built from.
//
// The commit is the reason for the body. The deploy compares it with the
// commit it meant to ship: a deploy whose new process failed to start, while
// an old one kept answering, would otherwise pass every check against old
// code. The upgrade check (docs/13-ci-cd.md) reads it too, to know which
// commit's database to rehearse against. A commit hash of a public repository
// tells a stranger nothing they could not read on GitHub.
//
// There is no database yet. When the first store lands, this re-checks the
// schema on every call, as CLAUDE.md "When there is a database" requires: a
// binary rolled back onto a newer schema must report unhealthy here, while
// the previous binary is still one rename away.
func Handler(commit string) http.HandlerFunc {
	body := []byte("ok " + commit + "\n")

	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		w.Write(body)
	}
}
