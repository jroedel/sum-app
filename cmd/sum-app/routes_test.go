package main

import (
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// get asks the whole app, middleware included, for one path.
func get(t *testing.T, path string) (*http.Response, string) {
	t.Helper()

	srv := httptest.NewTestServer(t, routes(slog.New(slog.DiscardHandler)))

	resp, err := srv.Client().Get(srv.URL + path)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatal(err)
	}

	return resp, string(body)
}

func TestHoldingPage(t *testing.T) {
	resp, body := get(t, "/")

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("status = %d, want 200", resp.StatusCode)
	}

	if !strings.Contains(body, "The SUM app is on its way") {
		t.Errorf("body does not look like the holding page:\n%s", body)
	}

	// The deploy's public check proves / was answered by the app, not by
	// Apache, by this exact clause.
	if csp := resp.Header.Get("Content-Security-Policy"); !strings.HasPrefix(csp, "default-src 'none'") {
		t.Errorf("Content-Security-Policy = %q, want it to start with default-src 'none'", csp)
	}

	for name, want := range map[string]string{
		"X-Content-Type-Options":    "nosniff",
		"X-Frame-Options":           "DENY",
		"Strict-Transport-Security": "max-age=31536000; includeSubDomains",
	} {
		if got := resp.Header.Get(name); got != want {
			t.Errorf("%s = %q, want %q", name, got, want)
		}
	}
}

func TestStylesheet(t *testing.T) {
	resp, _ := get(t, "/style.css")

	if resp.StatusCode != http.StatusOK || !strings.HasPrefix(resp.Header.Get("Content-Type"), "text/css") {
		t.Fatalf("status %d, type %q; want 200 text/css", resp.StatusCode, resp.Header.Get("Content-Type"))
	}
}

func TestHealthz(t *testing.T) {
	resp, body := get(t, "/healthz")

	if resp.StatusCode != http.StatusOK || !strings.HasPrefix(body, "ok ") {
		t.Fatalf("status %d, body %q; want 200 and ok <commit>", resp.StatusCode, body)
	}
}

// A mistyped address is the app's 404, with its headers, and not the holding
// page under another name.
func TestUnknownPathIsTheAppsNotFound(t *testing.T) {
	resp, body := get(t, "/index.html.bak")

	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("status = %d, want 404", resp.StatusCode)
	}

	if strings.Contains(body, "on its way") {
		t.Error("a 404 served the holding page")
	}

	if resp.Header.Get("X-Content-Type-Options") != "nosniff" {
		t.Error("the 404 did not pass through the app's headers")
	}
}

func TestOnlyGET(t *testing.T) {
	srv := httptest.NewTestServer(t, routes(slog.New(slog.DiscardHandler)))

	resp, err := srv.Client().Post(srv.URL+"/", "text/plain", strings.NewReader("x"))
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()

	if resp.StatusCode != http.StatusMethodNotAllowed {
		t.Fatalf("POST / = %d, want 405", resp.StatusCode)
	}
}
