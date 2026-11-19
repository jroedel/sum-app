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
| Phone | With a separate agreement to receive texts ([02](02-architecture.md#texts-need-consent)) |
| Life group | |
| School | Defaults to UT Austin; optional |
| Major | Optional; editable |
| Year of graduation | Optional; editable |
| Active / inactive | Set by the secretary |
| Newcomer / member | Set by the secretary ([03](03-accounts-and-access.md)) |
| First semester in the branch | Needed for dues ([06](06-dues.md)) |
| Personal milestones | Wristband, Home Shrine Kit, Covenant of Love, consecration of the personal ideal ([09](09-checklists-and-milestones.md)) |

The member edits everything except active/inactive, newcomer/member and first
semester. The secretary can edit anything. Who records milestones is open in
[09](09-checklists-and-milestones.md).

## Life groups

The branch is made up of life groups. A life group has:

- its members;
- a leader, chosen at the first or second overnight;
- **one or two mentors** ([below](#mentors));
- a **weekly meeting time**. Meetings are typically **2 hours**. This is also
  an input to the apartment schedule ([05](05-apartment-schedule.md));
- **open or closed** status;
- its semester checklist ([09](09-checklists-and-milestones.md)).

### Open life groups

An **open** life group is one forming in the current semester. Many close at
their first overnight. Open life groups are how a newcomer finds his place, so
**newcomers can see them** ([03](03-accounts-and-access.md)).

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

## Who sees contact details

Email addresses and phone numbers are visible to **members**: people who are
signed in and confirmed by the secretary. Newcomers do not see them.

## Active and inactive

What makes a member inactive, and what an inactive member can still see and
do.

## Keeping it current

Self-maintenance is the main way. The open question is how the app prompts
it, without becoming a chore.

## Open questions

- How the app prompts members to keep their profile current: for example,
  asking each member to confirm it at the start of each semester.
- Whether a member can hide his phone number from other members.
- What an open group shows a newcomer besides graduation years: meeting day
  and time, where it meets, first names and majors?
- Whether a member who is already in a group can request to move.
- What a mentor sees: only his groups, or the whole roster like a member.
- Whether every life group has one leader, or can have more.
- Whether a member can be in more than one life group.
- Whether members see newcomers on the roster (so they can welcome them).
- Where a life group meets, if not always the apartment.
- What "inactive" means, and whether it is ever automatic (for example, after
  graduation).
