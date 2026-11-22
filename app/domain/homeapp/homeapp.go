// Package homeapp serves the page at /.
//
// For now that is a holding page: the scaffold exists to prove the path from a
// merge to app.sumatx.us, and a page that says the app is coming is all that
// path needs to carry. The real Home (docs/07-pages-and-menu.md) replaces it.
package homeapp

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed static
var static embed.FS

// Routes adds the holding page and its stylesheet to mux.
//
// "GET /{$}" matches / and nothing below it, so a mistyped address is the
// mux's 404 rather than the holding page, and a link checker can tell the two
// apart. Everything still passes through the same middleware, so a 404 is
// answered by this app with its headers, not by Apache.
func Routes(mux *http.ServeMux) {
	files, err := fs.Sub(static, "static")
	if err != nil {
		panic(err) // the directory is embedded at build time; this cannot fail
	}

	mux.Handle("GET /{$}", serveFile(files, "index.html"))
	mux.Handle("GET /style.css", serveFile(files, "style.css"))
}

// serveFile answers with one embedded file.
//
// http.ServeFileFS rather than http.FileServerFS, because a file server lists
// directories and redirects index.html to its directory; the holding page
// needs neither, and a route per file is the whole inventory at a glance.
func serveFile(files fs.FS, name string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.ServeFileFS(w, r, files, name)
	})
}
