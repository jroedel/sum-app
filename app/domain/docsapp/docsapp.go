// Package docsapp serves the pages kept under docs/: the clickable mock-ups
// at /prototype/ and the brand sheet at /brand/ (issue #8).
//
// They are public on purpose. The repository is public, so a password here
// would protect nothing that GitHub does not already show, and their content
// is invented. What is guarded against is confusion and accidental installs:
// every mock-up page carries a banner and a noindex meta, app/sdk/page sends
// X-Robots-Tag: noindex under both paths, and neither has a manifest or a
// service worker. The tests in this package hold all of that.
package docsapp

import (
	"io/fs"
	"net/http"
	"strings"

	"github.com/jroedel/sum-app/docs"
)

// Routes adds the mock-ups and the brand sheet to mux.
//
// "GET /prototype/" is a subtree, so the mux also answers /prototype with a
// redirect to it. /brand gets the same by hand, because "/brand/{$}" names
// one page rather than a subtree.
func Routes(mux *http.ServeMux) {
	prototype, err := fs.Sub(docs.Prototype, "prototype")
	if err != nil {
		panic(err) // embedded at build time; this cannot fail
	}

	mux.Handle("GET /prototype/", http.StripPrefix("/prototype", noListing(http.FileServerFS(prototype))))

	mux.Handle("GET /brand", http.RedirectHandler("/brand/", http.StatusTemporaryRedirect))
	mux.Handle("GET /brand/{$}", serveFile(docs.Brand, "design/brand.html"))
	mux.Handle("GET /brand/brand.js", serveFile(docs.Brand, "design/brand.js"))
}

// noListing answers 404 for a directory other than the mock-ups' own root.
//
// http.FileServerFS lists a directory that has no index.html. fonts/ has
// none, and its listing would give nothing away (the repository is public),
// but a listing is a page nobody designed, so it is not served.
func noListing(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" && strings.HasSuffix(r.URL.Path, "/") {
			http.NotFound(w, r)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// serveFile answers with one embedded file, as homeapp does.
func serveFile(files fs.FS, name string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, files, name)
	})
}
