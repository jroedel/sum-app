package web

import (
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// Wrap's first argument is the outermost layer: the order the chain is
// written in is the order a request meets it.
func TestWrapOrder(t *testing.T) {
	var order []string

	layer := func(name string) Middleware {
		return func(next http.Handler) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				order = append(order, name)
				next.ServeHTTP(w, r)
			})
		}
	}

	h := Wrap(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		order = append(order, "handler")
	}), layer("outer"), nil, layer("inner"))

	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest("GET", "/", nil))

	if got := strings.Join(order, ","); got != "outer,inner,handler" {
		t.Fatalf("order = %s, want outer,inner,handler", got)
	}
}

func TestSecureHeadersSetsAndSkipsEmpty(t *testing.T) {
	h := SecureHeaders(func(*http.Request) Policy {
		return Policy{ContentSecurityPolicy: "default-src 'none'"}
	})(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))

	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))

	if got := rec.Header().Get("Content-Security-Policy"); got != "default-src 'none'" {
		t.Errorf("CSP = %q", got)
	}

	if got := rec.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Errorf("nosniff = %q", got)
	}

	if _, ok := rec.Header()["Cache-Control"]; ok {
		t.Error("an empty field in the policy was set anyway")
	}
}

func TestPanicsAnswers500WithASentence(t *testing.T) {
	h := Panics(slog.New(slog.DiscardHandler))(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		panic("boom")
	}))

	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest("GET", "/", nil))

	if rec.Code != http.StatusInternalServerError || !strings.Contains(rec.Body.String(), "Try again") {
		t.Fatalf("got %d %q, want 500 and a sentence saying what to do", rec.Code, rec.Body.String())
	}
}
