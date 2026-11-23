# 15 — Decisions for review

Working decisions made on 2026-11-22 by going through the open questions in
documents [01](01-overview.md) to [10](10-design.md), topic by topic. They
are recorded in those documents, each marked **"2026-11-22, for review"**,
and are the plan to build from **until the stakeholders have looked at
them**. This document is the agenda for that review: for each topic, where
its decisions are, and its **pressure points**, the decisions made with some
doubt, that pull against another one, or that cost more than they look.

When a pressure point is settled, it leaves this document and its "for
review" mark leaves the other.

## The pressure points, at a glance

1. **Becoming a member by paying dues in the first semester**
   ([Membership](#membership)). The biggest change: it reverses "nothing due
   in the first semester" and makes $60 the step into the branch. To discuss
   with Fr. Gonzalo and others.
2. **What goes live for the fall closing branch retreat 2026**
   ([Scope](#scope-and-the-first-release)). The date and the contents are not
   settled, and it means leaving the documentation phase now. Moving the
   branch in needs the MCP endpoint for people first
   ([Moving the branch in](#moving-the-branch-in)), which also puts members'
   details through Claude.
3. **The mentor as the front door** ([Membership](#membership)). Mentors are
   asked to approve only men they know in person. That is the app's main
   protection against fake accounts, and it rests on mentors doing it.
4. **Priest moderators hold every power**, and some powers are the
   secretary's alone, not the branch leader's ([Roles](#roles-and-powers)).
5. **Phone numbers always shown to members**, with no way to hide one
   ([Roster](#roster-and-life-groups)).
6. **Pages built from blocks, with named groups of blocks reused across
   pages** ([Pages](#pages-and-songs)). The largest piece of the pages design.
7. **Any member can claim a space for a meeting** while study never claims one
   ([Apartment](#apartment)).
8. **A bot check (Cloudflare Turnstile) at sign-up**
   ([Accounts](#accounts)). A third party on the first screen.
9. **Good standing costs nothing** ([Dues](#dues)). Overdue dues are shown,
   not enforced.

## Membership

The decisions are recorded in [03](03-accounts-and-access.md#decided-2026-11-22-for-review), [04](04-roster-and-life-groups.md#requesting-to-join) and [06](06-dues.md).

**Pressure points:**

- **Dues in the first semester.** The case for it: paying is a choice, and it
  makes a man part of the branch instead of leaving him in a limbo of not
  quite belonging. The case against: SUM is not exclusive, and easing a
  freshman in without a charge can read as welcome. This reverses
  [06](06-dues.md) ("not due in the first semester") and the newcomer table
  in [03](03-accounts-and-access.md). **To discuss with Fr. Gonzalo and
  others.**
- **Group first, then dues.** A newcomer cannot pay before a mentor approves
  him, so that $60 alone never buys the roster's phone numbers. A man who
  wants to belong but not join a group goes through the secretary.
- **The weight on mentors.** If a mentor approves someone he has not met, a
  stranger can reach the roster for $60. The app can tell mentors the rule;
  it cannot check it.

## Accounts

The decisions are recorded in [03](03-accounts-and-access.md).

**Pressure points:**

- **Turnstile** loads a script from Cloudflare on the first screen. That
  opens the page's Content-Security-Policy to a third party, and with the
  server in Germany, it needs a line in a privacy notice. The alternative was
  to rely on the rate limits, the mentors and the $60, and add a challenge
  only if bots appeared.

## Roles and powers

The decisions are recorded in [03](03-accounts-and-access.md#roles).

**Pressure points:**

- **Secretary-only powers.** Confirming a member by hand and editing anyone's
  profile were *not* chosen as the secretary's alone, so the branch leader
  can do both. Check that this is the intended split.
- **The core team sees good standing.** That is wider than "him, the
  secretary and the branch leader"; every core team member sees who is
  behind on dues.
- **Passing the baton.** On 2026-11-19 the outgoing secretary could also make
  the new branch leader; now only the outgoing branch leader or a priest
  moderator does.

## Roster and life groups

The decisions are recorded in [04](04-roster-and-life-groups.md).

**Pressure points:**

- **No hiding a phone number.** It is part of belonging, but some men will
  not want their number on a list that every member, newcomers' welcomers
  included, can read.
- **How a move between open groups works** is this document's reading of
  "it should be easy": the same request and approval as a newcomer's.

## Dues

The decisions are recorded in [06](06-dues.md).

**Pressure points:**

- **Nothing enforced.** The alternative considered was that a man out of good
  standing cannot book the apartment until he pays.
- **Dues outside the app.** On 2026-11-19 nothing but drop-in forms was to
  be recorded; now the secretary can mark a semester settled by hand ("paid
  cash", "waived"). It is the way in for waivers, and also for cash.

## Moving the branch in

The decisions are recorded in [04](04-roster-and-life-groups.md#moving-the-branch-in) and [07](07-pages-and-menu.md#editing-through-an-mcp-endpoint).

**Pressure points:**

- **Who may enter people through MCP.** Adding a member gives him the roster
  and the apartment, so it is at least a secretary's power. The proposal is
  the secretary and the priest moderators, with the same rules as their
  screens: what they could not do in the app, they cannot do through Claude.
- **The roster passes through Claude.** Names, emails and phone numbers are
  read from the spreadsheet and sent to the app by Claude, which is a third
  party handling members' details. Worth saying to the branch, once, that
  this is how the move is done.
- **The import is one-off, the endpoint is not.** The same endpoint stays for
  the secretary's later work (correcting details, marking a semester
  settled). What it may do after the move is a decision of its own; the
  proposal is the same as in the app, nothing more.
- **A man already signed up by himself** before the import would be entered
  twice. The endpoint matches on email address and updates instead of adding
  a second account.

## Pages and songs

The decisions are recorded in [07](07-pages-and-menu.md).

**Pressure points:**

- **Reusable groups of blocks.** A shared group changes on every page that
  uses it, so it needs its own drafts and a list of where it is used. The
  proposal is to build plain blocks first and reusable groups straight after,
  rather than both at once.
- **Public pages** let an editor publish something to anyone on the
  internet. Doc 03's test, "would we put it on sumatx.us?", is the one to
  apply.

## Apartment

The decisions are recorded in [05](05-apartment-schedule.md).

**Pressure points:**

- **Any member can claim a space for a meeting**, while study never claims
  one. A member wanting quiet could book a "meeting". It may be worth
  limiting how long a claim can be, or who it can be with.

## Notifications

The decisions are recorded in [02](02-architecture.md#notifications).

## Scope and the first release

The decisions are recorded in [01](01-overview.md#the-first-release) and [09](09-checklists-and-milestones.md).

**Pressure points:**

- **The retreat.** Its date, and what "something" is, are not settled. It is
  a few weeks away, so it decides whether the documentation phase ends now.
  The smallest useful release would be signing in and the roster: the branch
  moved in through the MCP endpoint, each man then confirming his profile and
  first semester. That puts the endpoint for people, and the database under
  it, first in the building order.
- **The life group checklist in the first release** brings the rest of doc
  09's open questions forward: who ticks a step, reminders when one is
  overdue, and whether checklists are a file in the repository or edited in
  the app.

## Not settled in this round

- **The second milestone's name:** "Home Shrine Kit", as docs 04, 09 and 10
  and the mock-up have it, or "Home Shrine".
- **The brand** ([10](10-design.md)): who holds the seal's original artwork,
  whether it may be committed to this public repository, a small mark for
  the favicon, and whether the tagline is written in title case.
- **Doc 09's details** for the life group checklist, as above.
- **The wording of the consent to texts**, which may need the texting
  campaign updated ([02](02-architecture.md)).
- **How old a saved copy may be** before the app says so
  ([02](02-architecture.md)).
- **The MVP test, in one sentence**, and what is cut first if the first
  release must be smaller ([01](01-overview.md)).
