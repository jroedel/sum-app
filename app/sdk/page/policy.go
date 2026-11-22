// Package page holds what this app puts in its response headers, and later in
// a <head>.
//
// It sits one layer above foundation/ because a policy is a product decision
// rather than plumbing: what may be cached, what a page is allowed to load.
// foundation/web.SecureHeaders takes the policy as a value for that reason.
package page

import (
	"net/http"
	"slices"
	"strings"

	"github.com/jroedel/sum-app/foundation/web"
)

// hsts is sent on every response, so HTTPS does not depend on the .htaccess
// staying correct.
const hsts = "max-age=31536000; includeSubDomains"

// Policy is the whole header policy for the app as it stands: a holding page
// and its stylesheet, and the pages kept under docs/ (app/domain/docsapp).
//
// No script on the app's own pages yet, so none is allowed. The service
// worker, the saved copies and the daily game (docs/02-architecture.md) each
// widen this when they arrive, by a line here that names what they need.
// Fonts are self-hosted, never from a font service (docs/10-design.md): a
// stylesheet that pulls a font from somebody else's origin tells them who
// opened which page. No manifest-src either: nothing is installable until the
// app is.
//
// The deploy's public check looks for "default-src 'none'" on / to prove the
// page was answered by this app and not by Apache, so that clause stays first
// in every policy.
func Policy() web.PolicyFor {
	app := web.Policy{
		ContentSecurityPolicy: csp(),
		ReferrerPolicy:        "same-origin",
		CacheControl:          "no-store",
		FrameOptions:          "DENY",
		StrictTransport:       hsts,
	}

	// The mock-ups run their own scripts (the role switcher, a tapped
	// request), so script-src 'self' is allowed there and only there. Both
	// they and the brand sheet are kept out of search results (issue #8); the
	// header covers the stylesheets, fonts and sprite, which a meta tag
	// cannot.
	prototype := app
	prototype.ContentSecurityPolicy = csp("script-src 'self'")
	prototype.RobotsTag = "noindex"

	// The brand sheet sets colours in style attributes on its swatches, 22
	// of them, which only 'unsafe-inline' allows. It is a static page with
	// nothing a visitor typed in it, so there is nothing for an inline style
	// to be injected through.
	brand := prototype
	brand.ContentSecurityPolicy = csp("script-src 'self'", "style-src 'self' 'unsafe-inline'")

	return func(r *http.Request) web.Policy {
		switch {
		case strings.HasPrefix(r.URL.Path, "/prototype/"):
			return prototype
		case r.URL.Path == "/brand" || strings.HasPrefix(r.URL.Path, "/brand/"):
			return brand
		default:
			return app
		}
	}
}

// csp is the app's Content-Security-Policy with extra directives. One that
// names a directive already present (style-src) replaces it rather than
// adding a second, which a browser would ignore.
func csp(extra ...string) string {
	directives := []string{
		"default-src 'none'",
		"style-src 'self'",
		"font-src 'self'",
		"img-src 'self'",
		"form-action 'none'",
		"base-uri 'none'",
		"frame-ancestors 'none'",
	}

	for _, e := range extra {
		name, _, _ := strings.Cut(e, " ")
		i := slices.IndexFunc(directives, func(d string) bool { return strings.HasPrefix(d, name+" ") })
		if i >= 0 {
			directives[i] = e
		} else {
			directives = append(directives, e)
		}
	}

	return strings.Join(directives, "; ")
}
