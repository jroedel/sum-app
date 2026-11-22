package page

import (
	"net/http/httptest"
	"strings"
	"testing"
)

// A directive named again replaces the app's rather than being added beside
// it: with two style-src directives a browser uses the first and ignores the
// second, so the brand sheet's 'unsafe-inline' would silently not apply.
func TestCSPReplacesADirectiveRatherThanRepeatingIt(t *testing.T) {
	got := csp("style-src 'self' 'unsafe-inline'", "script-src 'self'")

	if n := strings.Count(got, "style-src"); n != 1 {
		t.Fatalf("style-src appears %d times in %q", n, got)
	}

	if !strings.Contains(got, "style-src 'self' 'unsafe-inline'") || !strings.Contains(got, "script-src 'self'") {
		t.Errorf("csp = %q", got)
	}

	if !strings.HasPrefix(got, "default-src 'none'") {
		t.Errorf("csp = %q; the deploy's check needs default-src 'none' first", got)
	}
}

func TestPolicyByPath(t *testing.T) {
	policy := Policy()

	for path, want := range map[string]struct{ robots, script string }{
		"/":                      {"", ""},
		"/healthz":               {"", ""},
		"/prototypes":            {"", ""},
		"/prototype/":            {"noindex", "script-src 'self'"},
		"/prototype/groups.html": {"noindex", "script-src 'self'"},
		"/brand/":                {"noindex", "script-src 'self'"},
	} {
		p := policy(httptest.NewRequest("GET", path, nil))

		if p.RobotsTag != want.robots {
			t.Errorf("%s: RobotsTag = %q, want %q", path, p.RobotsTag, want.robots)
		}

		hasScript := strings.Contains(p.ContentSecurityPolicy, "script-src")
		if (want.script == "") == hasScript || want.script != "" && !strings.Contains(p.ContentSecurityPolicy, want.script) {
			t.Errorf("%s: Content-Security-Policy = %q, want script %q", path, p.ContentSecurityPolicy, want.script)
		}
	}
}
