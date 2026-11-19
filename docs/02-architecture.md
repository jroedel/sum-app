# 02 — Architecture

## The app on a phone

A progressive web app. A member opens it in Chrome or Safari and adds it to
the home screen; its `manifest.json` makes it open like any other app, with
nothing to download from an app store.

- `manifest.json`: name, icons, colors, start URL, display mode.
- A service worker: needed for installability on Chrome, and central to
  fighting latency ([below](#latency-the-server-is-in-germany)).
- Safari/iOS: installs via Share → Add to Home Screen. Its differences from
  Chrome are to be listed here.

## The server

A Go HTTP server, following the layout and rules in [`CLAUDE.md`](../CLAUDE.md)
and the sibling projects ([drop-in forms](https://github.com/jroedel/dropin-forms),
[stewards](https://github.com/jroedel/stewards)). It renders HTML and serves the app's static files.
Because members log in, it also checks who a person is and serves their data.

## Hosting and deploy

The app is at **`app.sumatx.us`** (decided 2026-11-19), beside the public site
at sumatx.us. It is hosted on the **schoenstatt.link** web server account, on
the dedicated server the movement already has. It costs nothing extra. The server is in **Germany**,
and the latency that brings is the main constraint on the front end, below.
A merge to `main` deploys through CI.

## Latency: the server is in Germany

Decided 2026-11-19.

A round trip from Austin to Germany is roughly 120–140 ms. A tap that costs
one round trip feels fine. A tap that costs five (a redirect, then CSS, then
a font, then a script, each waiting on the one before) feels slow. **What
matters is the number of round trips, not the amount of JavaScript.**

So the rule is: **one round trip per tap, and none for files the phone
already has.**

### Server-rendered HTML, not a JavaScript app

The pages are HTML rendered by Go, as in the sibling projects. A JavaScript
single-page app was considered and rejected. It would not remove the latency,
since the data still lives in Germany. It would cost a build step, npm,
monthly dependency updates, a JSON API beside the HTML, and a second codebase
for a volunteer branch to maintain.

### Where JavaScript does the work

JavaScript plays a bigger role here than in the sibling projects, but in the
stewards style: **plain ES modules, no build step, no npm**, served by the
app. Unit tests run under Node's own test runner and browser tests in
headless Chrome, as in stewards. It does four things:

1. **The service worker keeps the app's files on the phone.** CSS, scripts,
   icons and fonts cross the ocean once. After that, a tap costs one round
   trip, for the page itself.
2. **Show the last copy, then refresh.** Pages that are mostly read (the
   roster, open life groups, milestones, content pages) appear at once from
   the copy saved last time, and update in the background.
3. **Act before the server answers.** For actions such as requesting to join
   a group, marking a step done or recording a milestone, the screen changes
   at once and the request goes in the background. If it fails, the screen
   says so plainly and puts things back.
4. **The daily game runs in the browser** ([08](08-daily-game.md)). It fetches
   the day's puzzle once, and needs the server only to send the result.

**Signing out clears every saved copy.** They include members' phone numbers
and email addresses, and a phone or laptop may be shared.

### Measure first

Before building, time a test page on the server from Austin, from a phone, on
campus Wi-Fi and on mobile data. Repeat once the app exists, and keep the
numbers here.

### Later, if it isn't fast enough: Cloudflare

Cloudflare in front of the server, on its free plan, would set up each
secure connection at a nearby edge server in Dallas instead of in Germany.
That saves a few hundred milliseconds on the first request of a session. It
can be added afterwards without changing the app, so it is held in reserve
until measurements call for it. It adds a third party that sees the traffic.

## Storage

SQLite through `modernc.org/sqlite`, as in the sibling projects, with the
storage conventions in `CLAUDE.md`, unless decided otherwise here.

## Sign-in, technically

A 6-digit code sent by email ([03](03-accounts-and-access.md)). Still to
decide here: how codes are stored (hashed, never in plain text), how a
session is kept (a cookie), and how long it lasts on an installed app.

## Sending email

The sign-in code makes email a requirement for the MVP: if the code doesn't
arrive, nobody can sign in.

Mail comes from **`sum@schoenstatt.link`** (decided 2026-11-19), a domain
with a proven reputation and enforced authentication.
The server's email notes, kept outside this repository, cover sending
from the shared server. They recommend the local Exim, which sends
authenticated mail with no password to store, and a sender on the same domain
as the `From:` address.

## Notifications

The first thing that needs to reach a person who isn't looking at the app is
a **request to join a life group**, which goes to the group's mentors
([04](04-roster-and-life-groups.md)). Reminders from checklists
([09](09-checklists-and-milestones.md)) come later.

**All three channels are in the MVP** (decided 2026-11-19):

| Channel | What it takes | Catch |
|---|---|---|
| **Email** | Already needed for sign-in; from `sum@schoenstatt.link` | Easy to miss |
| **Push** | Web push from the Go server, with no paid service | On an iPhone, only if the app is installed to the home screen and the person allowed notifications |
| **SMS** | **The existing Twilio account and its existing number, whose US carrier campaign is already approved** | A cost per message; credentials to keep on the server |

SMS is what reaches a mentor who never installs the app, such as a priest
or an alum, so the costs above are worth paying from the start.

The Twilio credentials are runtime secrets. Following `CLAUDE.md`, a person
puts them on the server from his own machine. They never go through CI and
are never read by an agent.

### Texts need consent

US carrier rules, which the approved campaign is bound by, require that a
person has agreed to receive texts and can stop them by replying STOP. So the
profile ([04](04-roster-and-life-groups.md)) asks for that agreement beside
the phone number, and the app respects a STOP that Twilio reports.

## Offline

Nothing has to *work* offline in the MVP. The saved copies above mean a
member with a bad connection still sees the roster and pages as they were
last time, marked as possibly out of date.

## Open questions

- Who controls DNS for sumatx.us, to point `app.sumatx.us` at the server.
- Which notification goes by which channel. Proposed: a request to join goes
  to each mentor by push if he allowed it, otherwise by SMS if he agreed to
  texts, otherwise by email. Sign-in codes go by email only.
- What the consent to texts says, word for word. The approved campaign
  (drop-in forms issue #97) describes opt-in as members agreeing verbally,
  with sample messages about an alumni lunch and a BBQ. Texts about requests
  to join, with consent given in the app, probably mean updating the
  campaign, which sends it back to carrier review. Do it between events, as
  #97 plans.
- How old a saved copy may be before the app says so.
