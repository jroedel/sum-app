# 15 — Decisions for review

Working decisions made on 2026-11-22 by going through the open questions in
documents [01](01-overview.md) to [10](10-design.md), topic by topic. They
are the plan to build from **until the stakeholders have looked at them**,
not settled policy. When a decision here is confirmed, it moves into its own
document and leaves this one; when it is changed, it is changed here first.

Each topic lists what was decided, then its **pressure points**: the
decisions that were made with some doubt, that pull against another one, or
that cost more than they look. Those are the ones to talk through.

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

**Decided:**

- Anyone can sign up and start as a **newcomer**. Being a newcomer is meant
  to be short.
- **The front door is a life group.** A newcomer sees the open groups: each
  member's first name, graduation year and major, and when the group meets.
  He asks to join one.
- **Mentors are the check.** The group's mentors are told of each request,
  and are asked to approve **only someone they know**: someone they have met
  in person, or whose phone number or email they have confirmed. This is
  what keeps bots and strangers out.
- **A newcomer becomes a member by paying dues, even in his first
  semester**, and only after a mentor has approved him into a group. Paying
  the $60 is the decision to belong.
- **The first dues earn the free SUM sweatshirt.** The first payment marks a
  sweatshirt as owed and puts it in the secretary's feed; the secretary marks
  it given when it is handed over.
- **A member gets everything:** the full roster with email and phone, the
  apartment schedule and booking, and later the apartment's door code. The
  app is meant to become the official record of who belongs.
- **A member without a life group** is rare but possible. The secretary can
  make someone a member by hand.
- **Stale newcomers:** around the third week of each semester, the secretary
  is told who signed up the semester before and never came through. He
  **deactivates** them (reversible), rather than deleting.
- **The name stays "newcomer".**

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

**Decided:**

- **Newcomers do not see the apartment schedule.** It is for members.
- **What a newcomer sees of people:** the members of open groups (first
  name, graduation year, major) and **the core team, by full name and role**
  (for example "Secretary"). No contact details.
- **New sign-ups reach the secretary twice:** in his feed in the app, and by
  email.
- **A bot check at sign-up** (a challenge such as Cloudflare Turnstile), on
  the email step, before a code is sent.

**Pressure points:**

- **Turnstile** loads a script from Cloudflare on the first screen. That
  opens the page's Content-Security-Policy to a third party, and with the
  server in Germany, it needs a line in a privacy notice. The alternative was
  to rely on the rate limits, the mentors and the $60, and add a challenge
  only if bots appeared.

## Roles and powers

**Decided:**

- **Priest moderators hold every power the branch leader and the secretary
  hold.** Keeping things on track is their full-time job.
- **The secretary and the branch leader hold the keys**, but two kinds of
  power are **the secretary's alone** (and the priest moderators'), not the
  branch leader's, so that the branch leader has to delegate to him:
  - deactivating or removing accounts;
  - recording and matching dues (a payment the app could not match, a
    semester settled by hand, the sweatshirt).
- **The secretary stays the same** from year to year; **the core team roles
  change**, so the app lets them be named and changed rather than fixing
  them in code.
- **Passing the baton:** a priest moderator, or the outgoing branch leader,
  makes the new branch leader. The branch leader or a priest moderator then
  gives core team roles.
- **Mentor accounts** (a priest or an alum, who is not a member) are made
  mentors by a **priest moderator**, as whoever assigns mentors.
- **Who sees that a man is out of good standing:** the core team and the
  priest moderators.

**Pressure points:**

- **Secretary-only powers.** Confirming a member by hand and editing anyone's
  profile were *not* chosen as the secretary's alone, so the branch leader
  can do both. Check that this is the intended split.
- **The core team sees good standing.** That is wider than "him, the
  secretary and the branch leader"; every core team member sees who is
  behind on dues.

## Roster and life groups

**Decided:**

- **Phone numbers are always shown to members.** There is no switch to hide
  one.
- **Profiles are confirmed each semester:** at the start of each semester,
  Home asks each member to look over his profile and tap Confirm.
- **A mentor sees his own groups** with their members' contact details, plus
  what any newcomer sees. Not the whole roster.
- **Moving between groups:** while a man's group is still **open**, moving
  to another open group is easy: he asks to join it, as a newcomer does, and
  leaves his old group when he is approved. Once his group has closed, a move
  goes through the secretary.
- **Members see newcomers on the roster**, marked as newcomers, so they can
  welcome them.
- **One leader per group; one group per member.**
- **Each group sets where it meets.** Usually the apartment; only apartment
  meetings go on its schedule.
- **A group is closed** (no longer taking requests) **by its mentor or the
  secretary**, usually at the first overnight.
- **Inactive is the secretary's call**, never automatic. An inactive member
  can sign in and see pages and events, like a newcomer, and owes no dues.

**Pressure points:**

- **No hiding a phone number.** It is part of belonging, but some men will
  not want their number on a list that every member, newcomers' welcomers
  included, can read.
- **How a move between open groups works** is this document's reading of
  "it should be easy": the same request and approval as a newcomer's.

## Dues

**Decided:**

- **Overdue after the end of week 6** of each semester, every semester.
- **"Good standing"** (or a similar phrase) is the word for whether a man's
  dues are paid. It is separate from active or inactive.
- **Being out of good standing costs nothing.** It is shown, and reminders
  go out; nothing is taken away.
- **Exceptions:** the secretary can mark a semester settled by hand, with a
  short note ("paid cash", "waived"). It counts like a payment, including for
  the first-dues sweatshirt.

**Pressure points:**

- **Nothing enforced.** The alternative considered was that a man out of good
  standing cannot book the apartment until he pays.

## Moving the branch in

**Decided:**

- About **80 men** are in the branch today. Everyone the branch knows is
  entered **as a member**; anyone not personally known enters as a newcomer.
- **First semester:** during the changeover, each man says which semester
  was his first in SUM, since nobody has a record of it.
- **They come in through an MCP endpoint.** The branch already keeps a
  roster in a spreadsheet in Google Drive. A person with the right role works
  with Claude to read it and enter each man through the app's MCP endpoint,
  rather than anyone typing 80 profiles into screens. So **the MCP endpoint
  covers people, not only pages**, and it is needed **before** the first
  release, not after: the branch has to be in the database for anyone to
  sign in to it.

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

**Decided:**

- **Who edits:** every core team member, automatically, and anyone given a
  **page editor** role. Editor roles cover **groups of pages**: someone can be
  allowed to edit only the songs.
- **A page is made of blocks** (heading, text, image, audio, embedded form),
  and **a group of blocks can be named and reused on other pages**.
- **Drafts and publishing:** an edit is a draft until it is published, and
  the editor publishes his own; there is no second approval.
- **Some pages can be public**, chosen per page by an editor. Everything else
  needs signing in.
- **The menu:** the code defines the menu items; an editor chooses which page
  each opens.
- **The MCP endpoint** (editing pages from Claude) is for page editors, and
  follows the same rules as the app: it saves drafts, and publishes only what
  the editor could publish himself.
- **Songs:** listed A to Z with a search over titles and words, and **saved
  for reading offline**, for the apartment and retreats.

**Pressure points:**

- **Reusable groups of blocks.** A shared group changes on every page that
  uses it, so it needs its own drafts and a list of where it is used. The
  proposal is to build plain blocks first and reusable groups straight after,
  rather than both at once.
- **Public pages** let an editor publish something to anyone on the
  internet. Doc 03's test, "would we put it on sumatx.us?", is the one to
  apply.

## Apartment

**Decided:**

- **The spaces are named by the secretary** in the app, not in code.
- **A life group's second-hour room** is chosen once, when the leader sets
  the weekly meeting. A clash is reported like any double booking.
- **A member can book up to two weeks ahead.**
- **Studying never claims a space.** It asks others for quiet; others can
  still be there.
- **A meeting claims a space.** Any member can book a space for a meeting,
  such as a priest's conversation with a student.
- **Who can bump a booking:** core team and priests. Otherwise only a life
  group meeting takes precedence.
- **The apartment order** (house rules) is linked at the top of the
  schedule.

**Pressure points:**

- **Any member can claim a space for a meeting**, while study never claims
  one. A member wanting quiet could book a "meeting". It may be worth
  limiting how long a claim can be, or who it can be with.

## Notifications

**Decided:**

- **Channel:** push if the person allowed it, otherwise a text if he agreed
  to texts, otherwise email. Sign-in codes always go by email.

## Scope and the first release

**Decided:**

- **English only.** (Recorded in [10](10-design.md).)
- **The MVP priority order** in [01](01-overview.md) is agreed.
- **In the first release:** personal milestones, and each life group's
  semester checklist ([09](09-checklists-and-milestones.md)).
- **Not in the first release:** the daily game. It arrives once it is chosen
  and built.
- **Something should be live for the fall closing branch retreat 2026.**

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
