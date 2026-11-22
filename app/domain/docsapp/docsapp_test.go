package docsapp

import (
	"io/fs"
	"net/http"
	"net/http/httptest"
	"path"
	"regexp"
	"strings"
	"testing"

	"github.com/jroedel/sum-app/docs"
)

// The guards issue #8 asks of every mock-up page, read from the files the
// binary carries. The headers are tested in cmd/sum-app, through the whole
// app with its middleware.

const banner = "Mock-up · not the real SUM app"

func prototypeFiles(t *testing.T) map[string]string {
	t.Helper()

	files := map[string]string{}
	err := fs.WalkDir(docs.Prototype, "prototype", func(name string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() {
			return err
		}

		b, err := fs.ReadFile(docs.Prototype, name)
		files[name] = string(b)
		return err
	})
	if err != nil {
		t.Fatal(err)
	}

	if len(files) == 0 {
		t.Fatal("no mock-up files are embedded")
	}

	return files
}

func TestEveryMockupPageIsMarkedAndNotIndexed(t *testing.T) {
	pages := 0
	for name, body := range prototypeFiles(t) {
		if !strings.HasSuffix(name, ".html") {
			continue
		}
		pages++

		if !strings.Contains(body, banner) || !strings.Contains(body, `class="mockup-banner" role="note"`) {
			t.Errorf("%s: no mock-up banner", name)
		}

		if !strings.Contains(body, `<meta name="robots" content="noindex">`) {
			t.Errorf("%s: no noindex meta", name)
		}

		if strings.Contains(body, `rel="manifest"`) {
			t.Errorf("%s: links a manifest, which would make it installable", name)
		}
	}

	if pages == 0 {
		t.Fatal("no mock-up pages are embedded")
	}
}

// Nothing that makes a mock-up installable or keeps it running offline, so
// nobody mistakes one for the app on a phone's home screen.
func TestNoManifestAndNoServiceWorker(t *testing.T) {
	for name, body := range prototypeFiles(t) {
		if path.Base(name) == "manifest.json" || strings.HasSuffix(name, ".webmanifest") {
			t.Errorf("%s is a manifest", name)
		}

		if strings.Contains(body, "serviceWorker") {
			t.Errorf("%s mentions serviceWorker", name)
		}
	}
}

// The mock-ups run under the server's Content-Security-Policy, which allows
// no inline script and no inline style. A page that relied on either would
// work when opened as a file and break on app.sumatx.us.
func TestNoInlineScriptOrStyle(t *testing.T) {
	inlineScript := regexp.MustCompile(`<script(?:\s[^>]*)?>\s*[^<\s]`)
	eventHandler := regexp.MustCompile(`\son[a-z]+=`)
	for name, body := range prototypeFiles(t) {
		if !strings.HasSuffix(name, ".html") {
			continue
		}

		if inlineScript.MatchString(body) {
			t.Errorf("%s has an inline script", name)
		}

		if strings.Contains(body, "<style") || strings.Contains(body, " style=") || eventHandler.MatchString(body) {
			t.Errorf("%s has an inline style or event handler", name)
		}
	}
}

// Every relative address in a page or stylesheet names a file the binary
// carries: a mistyped link is a 404 for the designer clicking through, and
// nothing else would notice it.
func TestEveryRelativeLinkResolves(t *testing.T) {
	ref := regexp.MustCompile(`(?:href|src)="([^"]+)"|url\("?([^")]+)"?\)`)

	check := func(from, body string) {
		for _, m := range ref.FindAllStringSubmatch(body, -1) {
			target := m[1] + m[2]
			if target == "" || strings.HasPrefix(target, "#") || strings.Contains(target, "://") || strings.HasPrefix(target, "data:") {
				continue
			}

			target, _, _ = strings.Cut(target, "#")
			target, _, _ = strings.Cut(target, "?")
			if target == "./" || target == "" {
				target = "index.html"
			}

			resolved := path.Join(path.Dir(from), target)
			var fsys fs.FS = docs.Prototype
			if strings.HasPrefix(resolved, "design/") {
				fsys = docs.Brand
			}

			if _, err := fs.Stat(fsys, resolved); err != nil {
				t.Errorf("%s links %q, which is not embedded (%s)", from, m[0], resolved)
			}
		}
	}

	for name, body := range prototypeFiles(t) {
		if strings.HasSuffix(name, ".html") || strings.HasSuffix(name, ".css") {
			check(name, body)
		}
	}

	brand, err := fs.ReadFile(docs.Brand, "design/brand.html")
	if err != nil {
		t.Fatal(err)
	}
	check("design/brand.html", string(brand))
}

func TestNoDirectoryListing(t *testing.T) {
	mux := http.NewServeMux()
	Routes(mux)

	for _, p := range []string{"/prototype/fonts/", "/prototype/fonts"} {
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, p, nil))
		if rec.Code == http.StatusOK {
			t.Errorf("%s answered 200; a directory is not listed", p)
		}
	}
}
