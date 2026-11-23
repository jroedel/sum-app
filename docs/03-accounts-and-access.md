# 03 — Accounts and access

★ MVP: "User management". Closely tied to the roster in
[04](04-roster-and-life-groups.md).

## Decided (2026-11-19)

- **Sign-in is a 6-digit code sent by email.** There are no passwords, no
  sign-in links, and no single sign-on (no "Sign in with Google").
- **Anyone can sign up and start using the app at once.** A new account does
  not wait on anyone's approval. It starts as a **newcomer**.
- **The secretary** keeps the roster, and reaches out to each new sign-up
  himself, outside the app.

## Decided (2026-11-22, for review)

Working decisions, to build from until the stakeholders have looked at them
([15](15-decisions-for-review.md#membership) lists the pressure points).

- **The front door is a life group.** A newcomer asks to join an open group,
  and its mentors approve him **only if they know him**: they have met him in
  person, or confirmed his phone number or email
  ([04](04-roster-and-life-groups.md#requesting-to-join)). That is the app's
  main protection against bots and strangers.
- **A newcomer becomes a member by paying dues**, even in his first semester,
  and only once a mentor has approved him into a group ([06](06-dues.md)).
  Being a newcomer is meant to be short.
- **The secretary can make someone a member by hand**, for the rare man who
  belongs without a life group.
- **New sign-ups reach the secretary twice:** in his feed and by email.
- **Stale newcomers.** Around the third week of each semester, the secretary
  is told who signed up the semester before and never came through, and he
  **deactivates** them. Deactivating is reversible; the record stays.
- **A bot check at sign-up:** a challenge such as Cloudflare Turnstile on the
  email step, before a code is sent. It loads a script from Cloudflare, so the
  sign-in page's Content-Security-Policy must allow it, and a privacy notice
  must say so.
- **The name stays "newcomer".**

## Signing in

A person enters their email address, receives a 6-digit code, and types it
in. Signing up and signing in are the same steps; the first time, the app
then asks for the profile in [04](04-roster-and-life-groups.md).

**Why a code and not a link.** A link only works on the device where the
email is opened. A person signing in on a laptop who reads Gmail on their
phone ends up signed in on the wrong device, or confused. A code works
anywhere they can read their email. It matters even more on an iPhone: an app
installed from Safari keeps its sign-in separate from Safari, and a link in an
email opens Safari, not the installed app. A code typed into the app is the
one approach that signs in the app itself.

### Proposed details, to confirm

- A code is valid for 10 minutes and works once.
- Asking for a new code cancels the old one.
- After 5 wrong tries the code stops working and a new one must be requested.
- Codes for one address can be requested only a few times an hour, so the app
  cannot be used to flood someone's inbox.
- A person stays signed in on a device for a long time (months), so codes are
  rare. Signing out, or the secretary deactivating the account, ends it.
- The email says only the code, what it is for, and that it can be ignored if
  the person did not ask for it.

## Newcomers and members

This mirrors the branch itself. In a person's first semester they are getting
into the branch: they don't immediately get, for example, the code to the
apartment, but they can take part in events.

| | Newcomer | Member |
|---|---|---|
| Who | Anyone who has signed up | Approved into a life group, then paid his first dues; or made a member by the secretary |
| Pages | yes | yes |
| Upcoming events, signing up, seeing who's going | yes | yes |
| Open life groups: members' first names, graduation years and majors, and when the group meets ([04](04-roster-and-life-groups.md)) | yes | yes |
| The core team, by full name and role | yes | yes |
| Roster with email and phone | no | yes |
| Apartment schedule and booking | no | yes |
| Dues | his first dues make him a member ([06](06-dues.md)) | own status |

"Newcomer" stays the name (decided 2026-11-22, for review).

### A newcomer could be anyone

**Assume a newcomer may be a bot, or a stranger.** The sign-in code proves
only that someone can read an inbox. Anyone can create an email address, and
signing up needs no approval. So the rule for designing anything a newcomer
can see is: **would we put it on sumatx.us?** If not, it is for members.

What follows from this:

- A newcomer sees the **members of open life groups** by first name,
  graduation year and major, and **the core team** by full name and role.
  Email, phone and photos are for members (decided 2026-11-22, for review).
  What he sees of **who's going** to an event is still proposed: first names.
- The limits on requesting codes ([above](#proposed-details-to-confirm)), and
  the bot check on the email step, slow down mass sign-ups.
- **The mentors' approval** is the real check: a mentor approves only someone
  he knows, and only a man in a group can pay dues and become a member.
- The secretary's outreach to each new sign-up, outside the app, is also how
  a fake account is noticed. He can deactivate one.
- Nothing a newcomer does reaches other people without a person seeing it
  first, beyond adding his own name to an event.

## The secretary

The secretary is a **core team** position, and one of the first core team
roles to fill in the app, because the roster depends on him. He:

- keeps the roster ([04](04-roster-and-life-groups.md));
- sees each new sign-up, in his feed and by email, and contacts that person
  outside the app;
- makes someone a member by hand, when he belongs without dues or without a
  group (the exception);
- deactivates stale newcomers and suspected fake accounts;
- is responsible for dues, and sees everyone's ([06](06-dues.md)), including
  the sweatshirt each man is owed for his first dues;
- marks members active or inactive;
- can approve a request to join a life group, as a group's mentors can
  ([04](04-roster-and-life-groups.md));
- has a **feed** of what is waiting on him: new sign-ups, requests to join
  that no mentor has answered in 3 days, payments to match, sweatshirts owed,
  and each semester's stale newcomers;
- can record a member's personal milestones
  ([09](09-checklists-and-milestones.md)).

### The secretary's own powers

Decided 2026-11-22, for review. The secretary and the branch leader hold the
keys, but two kinds of power are **the secretary's and not the branch
leader's**, so that the branch leader has to delegate to him:

- deactivating or removing accounts;
- recording and matching dues: a payment the app could not match, a semester
  settled by hand, the sweatshirt.

The priest moderators hold these too ([below](#priest-moderators)).

## Mentors

Each life group has one or two **mentors**, who are notified when someone
asks to join the group, and approve the request
([04](04-roster-and-life-groups.md)). The app asks a mentor to approve **only
a man he knows** (decided 2026-11-22, for review). A mentor may be a member, a priest
moderator, or an alum. Mentorship is a role a person holds for a group, not a
kind of account: a member who mentors a group is still a member.

## Priest moderators

The branch has priest moderators. **They hold every power the branch leader
and the secretary hold** (decided 2026-11-22, for review): keeping the branch
on track is their full-time job. **Assigning mentors is within their
competence.** Each may delegate that to the branch leader, the secretary,
both, or neither. The app keeps it to two switches that only a priest
moderator can change: "the branch leader may assign mentors" and "the
secretary may assign mentors". Both are off until a priest moderator turns
them on.

## Roles

The MVP needs:

| Role | Held by | Can, beyond a member |
|---|---|---|
| Newcomer | anyone who signs up | (less than a member; see the table above) |
| Member | confirmed by the secretary | |
| Mentor | one or two per life group | approve requests to join his group |
| Secretary | core team | make a member by hand, keep the roster, approve join requests, record milestones, record and match dues, deactivate accounts; assign mentors if delegated |
| Branch leader | core team | give core team roles; assign mentors if delegated |
| Priest moderator | the branch's moderators | everything the secretary and the branch leader can do; assign mentors, and delegate that |
| Page editor | given for a group of pages | edit and publish those pages ([07](07-pages-and-menu.md#who-edits)) |

Other core team roles are named in the app ([below](#other-core-team-roles)).
The full set of leadership roles is later ([11](11-later.md)).

### Who gives each role

Decided 2026-11-19.

- **The first priest moderator** is the app's main designer, who is a
  priest moderator. His role is set once on the server when the app goes
  live. That is the only role given outside the app.
- **A priest moderator** is given the role by a priest moderator who already
  has it.
- **The branch leader** is given the role by the outgoing branch leader or a
  priest moderator: they pass the baton (2026-11-22, for review; the outgoing
  secretary, allowed on 2026-11-19, is no longer named).
- **The secretary** is named by the branch leader (a new branch leader names
  his own secretary), or by a priest moderator. The secretary is the role
  that stays steady from year to year.
- **Other core team roles** are given by the branch leader or a priest
  moderator (2026-11-22, for review).

### Changeover

When a role is handed to someone new, the person handing it over picks a
**changeover period: immediately (the default), 3 days, 1 week, or 2
weeks**. During it, outgoing and incoming both hold the role, so the new
person can learn it with the old one still able to act. At the end, the
outgoing person loses the role on his own, with no one having to remember to
remove it.

This applies to every role one person holds at a time: the **branch
leader**, the **secretary**, and any other core team role. Roles several
people can hold at once (priest moderator, mentor) are simply added and
removed.

### Other core team roles

The core team has more roles than the ones above, and **they change from
year to year**, so the app lets them be named and changed rather than fixing
them in code (decided 2026-11-22, for review). Most are **titles**, shown on
the roster and to newcomers. A role gets a permission only when a feature
needs one. The first is pages: **every core team member can edit pages**, as
can anyone given a page editor role ([07](07-pages-and-menu.md#who-edits)). The branch has no treasurer today; **the secretary is responsible for
dues** ([06](06-dues.md)).
- **Mentors** are assigned by a priest moderator, or by the branch leader or
  secretary if a priest moderator has delegated it
  ([above](#priest-moderators)). A priest or an alum, who is not a member,
  signs in like anyone; **a priest moderator** gives his account the mentor
  kind (decided 2026-11-22, for review).

## Alumni and priests

Priest moderators and alumni can be mentors, so they need to sign in from the
MVP on. They are neither newcomers nor members. The MVP gives them the narrow
part they need: signing in, and seeing the groups they mentor. The wider
"alumni functionality" is later ([11](11-later.md)).

## Open questions

- What to call the kind of account a priest or alum mentor has.
- What a newcomer sees of **who's going** to an event (proposed: first
  names).
