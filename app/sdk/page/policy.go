// Package page holds what this app puts in its response headers, and later in
// a <head>.
//
// It sits one layer above foundation/ because a policy is a product decision
// rather than plumbing: what may be cached, what a page is allowed to load.
// foundation/web.SecureHeaders takes the policy as a value for that reason.
package page

import (
	"net/http"
	"strings"

	"github.com/jroedel/sum-app/foundation/web"
)

// hsts is sent on every response, so HTTPS does not depend on the .htaccess
// staying correct.
const hsts = "max-age=31536000; includeSubDomains"

// Policy is the whole header policy for the app as it stands: a holding page
// and its stylesheet.
//
// No script at all yet, so none is allowed. The service worker, the saved
// copies and the daily game (docs/02-architecture.md) each widen this when
// they arrive, by a line here that names what they need. Fonts are
// self-hosted, never from a font service (docs/10-design.md): a stylesheet
// that pulls a font from somebody else's origin tells them who opened which
// page. No manifest-src either: nothing is installable until the app is.
//
// The deploy's public check looks for "default-src 'none'" on / to prove the
// page was answered by this app and not by Apache, so that clause stays first.
func Policy() web.PolicyFor {
	return func(*http.Request) web.Policy {
		return web.Policy{
			ContentSecurityPolicy: strings.Join([]string{
				"default-src 'none'",
				"style-src 'self'",
				"font-src 'self'",
				"img-src 'self'",
				"form-action 'none'",
				"base-uri 'none'",
				"frame-ancestors 'none'",
			}, "; "),

			ReferrerPolicy:  "same-origin",
			CacheControl:    "no-store",
			FrameOptions:    "DENY",
			StrictTransport: hsts,
		}
	}
}
