# 03 — Accounts and access

★ MVP: "User management". Closely tied to the roster in
[04](04-roster-and-life-groups.md).

## Decided (2026-11-19)

- **Sign-in is a 6-digit code sent by email.** There are no passwords, no
  sign-in links, and no single sign-on (no "Sign in with Google").
- **Anyone can sign up and start using the app at once.** A new account does
  not wait on anyone's approval. It starts as a **newcomer**.
- **The secretary** confirms newcomers as members, keeps the roster, and
  reaches out to each new sign-up himself, outside the app.

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
| Who | Anyone who has signed up | Confirmed by the secretary |
| Pages | yes | yes |
| Upcoming events, signing up, seeing who's going | yes | yes |
| Open life groups and their composition ([04](04-roster-and-life-groups.md)) | yes | yes |
| Roster with email and phone | no | yes |
| Apartment schedule | ? | yes |
| Dues | not due in the first semester ([06](06-dues.md)) | own status |

"Newcomer" is a working name.

### A newcomer could be anyone

**Assume a newcomer may be a bot, or a stranger.** The sign-in code proves
only that someone can read an inbox. Anyone can create an email address, and
signing up needs no approval. So the rule for designing anything a newcomer
can see is: **would we put it on sumatx.us?** If not, it is for members.

What follows from this:

- A newcomer sees **who's going** to an event and the **composition of open
  life groups** by first name, graduation year and major. Surnames, email,
  phone and photos are for members. (Proposed; to confirm.)
- The limits on requesting codes ([above](#proposed-details-to-confirm)) also
  slow down mass sign-ups.
- The secretary's outreach to each new sign-up, outside the app, is also how
  a fake account is noticed. He can deactivate one.
- Nothing a newcomer does reaches other people without a person seeing it
  first, beyond adding his own name to an event.

## The secretary

The secretary is a **core team** position, and one of the first core team
roles to fill in the app, because the roster depends on him. He:

- keeps the roster ([04](04-roster-and-life-groups.md));
- sees each new sign-up, and contacts that person outside the app;
- confirms a newcomer as a member;
- marks members active or inactive;
- can approve a request to join a life group, as a group's mentors can
  ([04](04-roster-and-life-groups.md));
- has a **feed** of what is waiting on him: new sign-ups, and requests to
  join that no mentor has answered in 3 days;
- can record a member's personal milestones
  ([09](09-checklists-and-milestones.md)).

## Mentors

Each life group has one or two **mentors**, who are notified when someone
asks to join the group, and approve the request
([04](04-roster-and-life-groups.md)). A mentor may be a member, a priest
moderator, or an alum. Mentorship is a role a person holds for a group, not a
kind of account: a member who mentors a group is still a member.

## Priest moderators

The branch has priest moderators. **Assigning mentors is within their
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
| Secretary | core team | confirm members, keep the roster, approve join requests, record milestones; assign mentors if delegated |
| Branch leader | core team | assign mentors if delegated |
| Priest moderator | the branch's moderators | assign mentors; delegate that |

Other core team roles, such as whoever records dues and whoever edits pages,
are open below. The full set of leadership roles is later
([11](11-later.md)).

### Who gives each role

Decided 2026-11-19.

- **The first priest moderator** is the app's main designer, who is a
  priest moderator. His role is set once on the server when the app goes
  live. That is the only role given outside the app.
- **A priest moderator** is given the role by a priest moderator who already
  has it.
- **The branch leader** is given the role by the outgoing branch leader, the
  outgoing secretary, or a priest moderator.
- **The secretary** is named by the branch leader (a new branch leader names
  his own secretary), or by a priest moderator.

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

The core team has more roles than the ones above. Most don't need anything
special from the app: they are **titles**, shown on the roster, with nothing
more than a member can do. A role gets a permission only when a feature needs
one. The branch has no treasurer today; who records dues is still open
([06](06-dues.md)).
- **Mentors** are assigned by a priest moderator, or by the branch leader or
  secretary if a priest moderator has delegated it
  ([above](#priest-moderators)).

## Alumni and priests

Priest moderators and alumni can be mentors, so they need to sign in from the
MVP on. They are neither newcomers nor members. The MVP gives them the narrow
part they need: signing in, and seeing the groups they mentor. The wider
"alumni functionality" is later ([11](11-later.md)).

## Open questions

- A better name than "newcomer".
- Whether newcomers see the apartment schedule.
- Exactly what a newcomer sees of a person: the proposal is first name,
  graduation year and major.
- Whether a check against bots at sign-up (a challenge like Cloudflare
  Turnstile) is worth adding, or whether rate limits and the secretary's
  outreach are enough.
- How the secretary learns of a new sign-up: a list in the app, an email to
  him, or both.
- Whether becoming a member is always the secretary's step, or follows from
  something else (a second semester, paying dues).
- What happens to a newcomer who never joins.
- Which other core team roles the MVP needs (treasurer for dues? page
  editors?), and who assigns core team roles in the app.
- Whether the secretary can remove an account, or only deactivate it.
- What to call the kind of account a priest or alum mentor has, and who
  creates it (the secretary, by email address?).
- The list of core team roles, and whether any besides secretary and branch
  leader needs a permission in the MVP (recording dues, editing pages).
