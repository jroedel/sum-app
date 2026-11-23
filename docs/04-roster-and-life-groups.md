# 04 — Roster and life groups

★ MVP: "LG directory / roster".

## Decided (2026-11-19)

- **Members keep their own profiles up to date.** This matters most: the
  roster is only useful if it is current, and the person who knows the facts
  is the member.
- The roster holds **major** and **year of graduation**, both editable.
- **School defaults to UT Austin**, and is not required.
- The **secretary** keeps the roster ([03](03-accounts-and-access.md)).

## Careful language

Every member today belongs to an institution of higher education, but
membership does not require it. The app says **member**, not "student", and
never makes school, major or graduation year a condition of anything.

## A member's profile

| Field | Notes |
|---|---|
| Name | |
| Email | The sign-in address ([03](03-accounts-and-access.md)) |
| Phone | With a separate agreement to receive texts ([02](02-architecture.md#texts-need-consent)). Always shown to members; there is no hiding it (2026-11-22, for review) |
| Life group | |
| School | Defaults to UT Austin; optional |
| Major | Optional; editable |
| Year of graduation | Optional; editable |
| Active / inactive | Set by the secretary ([below](#active-and-inactive)) |
| Newcomer / member | Set by the secretary ([03](03-accounts-and-access.md)) |
| First semester in the branch | For the record ([06](06-dues.md)). For the men moved in at launch, each says which it was ([below](#moving-the-branch-in)) |
| Good standing | Whether this semester's dues are paid; worked out, not entered ([06](06-dues.md)) |
| Sweatshirt | Owed on his first dues; the secretary marks it given ([06](06-dues.md)) |
| Personal milestones | Wristband, Home Shrine Kit, Covenant of Love, consecration of the personal ideal ([09](09-checklists-and-milestones.md)) |

The member edits everything except active/inactive, newcomer/member,
good standing and the sweatshirt. He sets his first semester only during the
changeover at launch. The secretary can edit anything. Who records milestones is open in
[09](09-checklists-and-milestones.md).

## Life groups

The branch is made up of life groups. A life group has:

- its members;
- **one** leader, chosen at the first or second overnight;
- **one or two mentors** ([below](#mentors));
- a **weekly meeting time**. Meetings are typically **2 hours**. This is also
  an input to the apartment schedule ([05](05-apartment-schedule.md));
- a **place**, set by the group: usually the apartment. Only meetings at the
  apartment go on its schedule;
- **open or closed** status;
- its semester checklist ([09](09-checklists-and-milestones.md)).

A member is in **one life group** at a time (2026-11-22, for review).

### Open life groups

An **open** life group is one forming in the current semester. Many close at
their first overnight. Open life groups are how a newcomer finds his place, so
**newcomers can see them** ([03](03-accounts-and-access.md)): each member's
first name, graduation year and major, and when and where the group meets.

**A group is closed** (no longer taking requests) **by its mentor or the
secretary**, usually at the first overnight (2026-11-22, for review).

**Composition is shown, because graduation years matter.** A group's members
should generally share a similar graduation year: a group of four seniors and
two sophomores comes apart within a year, and that is what we try to avoid.
So each open group shows its members' graduation years at a glance.

**But the newcomer chooses.** He is encouraged to find a group that suits
him, that he finds attractive, with people he gets along with. The app
informs the choice; it does not make it. It does not block or warn about a
mismatched year.

### Requesting to join

Decided 2026-11-19. **The newcomer takes the initiative.** When he settles on
an open group, he taps **Request to join**. The group's **mentors** are
notified ([how](02-architecture.md#notifications)). A mentor, or **the
secretary**, approves the request, and he is in the group.

- **One request at a time.** A newcomer cannot request more than one group at
  once; he has to decide. He **can withdraw** his request, and then ask a
  different group.
- **A mentor can ignore a request.** A request nobody answers for **3 days**
  goes to the **secretary's feed** ([03](03-accounts-and-access.md)).
- **There is no decline.** A mentor approves or ignores; that is all. Kept
  deliberately simple (decided 2026-11-19).
- **A mentor approves only someone he knows** (2026-11-22, for review): a man
  he has met in person, or whose phone number or email he has confirmed. The
  app says so beside Approve. This approval is what lets a newcomer pay dues
  and become a member ([03](03-accounts-and-access.md)), so it is the branch's
  main check against strangers.
- **Moving.** While a man's group is still open, he can move to another open
  group the same way: he asks to join it, and leaves his old group when he is
  approved. Once his group has closed, a move goes through the secretary
  (2026-11-22, for review).

### Mentors

Each life group usually has **one or two mentors**. A mentor can be:

- another member of SUM;
- a priest moderator;
- a SUM alum.

A mentor is not the group's leader. The leader is a member of the group,
chosen at an overnight. A mentor accompanies the group from outside it.

**Assigning mentors is within the competence of the priest moderators.**
A priest moderator may delegate it to the **branch leader**, the
**secretary**, both, or neither. In the app that is a setting only a priest
moderator can change ([03](03-accounts-and-access.md)).

Priests and alumni are not branch members, so a mentor needs an account
that is neither newcomer nor member ([03](03-accounts-and-access.md)). This
brings a narrow part of "alumni functionality" into the MVP: an alum can sign
in, as a mentor, and see his groups.

**What a mentor sees** (2026-11-22, for review): the groups he mentors, with
their members' full names and contact details, and what any newcomer sees.
Not the whole roster.

## Who sees contact details

Email addresses and phone numbers are visible to **members**. Newcomers do
not see them. A member cannot hide his phone number from other members
(2026-11-22, for review).

**Members see newcomers on the roster**, marked as newcomers, with their
contact details, so they can welcome them (2026-11-22, for review).

## Active and inactive

Decided 2026-11-22, for review.

- **Inactive is the secretary's call.** Nothing makes a member inactive on
  its own: not graduation, not unpaid dues.
- **An inactive member** can sign in and see pages and events, as a newcomer
  can. He loses the roster and the apartment, and owes no dues. Coming back
  is the secretary setting him active again.
- **Good standing is separate.** A member whose dues are overdue is out of
  good standing, not inactive ([06](06-dues.md)).

## Keeping it current

Self-maintenance is the main way. **At the start of each semester, Home asks
each member to look over his profile and tap Confirm**, one tap if nothing
changed (2026-11-22, for review).

## Moving the branch in

Decided 2026-11-22, for review. About **80 men** are in the branch when the
app launches.

- **Everyone the branch knows enters as a member**; anyone not personally
  known enters as a newcomer.
- **They come in through the app's MCP endpoint.** The branch's roster is a
  spreadsheet in Google Drive. A person with the secretary's powers works with
  Claude to read it and enter each man through the endpoint, rather than
  typing 80 profiles into screens ([07](07-pages-and-menu.md#editing-through-an-mcp-endpoint)).
  The endpoint matches on email address, so a man who has already signed up
  is updated rather than added twice.
- **First semester:** nobody has a record of it, so during the changeover
  each man says which semester was his first in SUM.

Members' names, emails and phone numbers pass through Claude on the way in.
The branch is told, once, that this is how the move is done.

## Open questions

- Who may enter people through the MCP endpoint after the move, and what it
  may do then. The proposal: the secretary and the priest moderators, with
  exactly the powers of their screens.
