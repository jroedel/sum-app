# 05 — Apartment schedule

★ MVP: "Apartment scheduling".

## The problem

The SUM apartment in West Campus is a branch-member benefit. The schedule
coordinates **who is going to be at the apartment at the same time**.

## What is on it

- **Life group meetings:** each life group's weekly meeting time from
  [04](04-roster-and-life-groups.md), about 2 hours, shows on the schedule
  without anyone entering it again.
- **Other use:** members saying when they will be there.

## Spaces and double bookings

Proposed 2026-11-22. The apartment has two rooms and an open dining and living
area, which is one space for this purpose. An entry names a **space** and a
**time**, for example "dining room, 4:30 to 5:30".

- **Double bookings are allowed.** The app does not refuse one. It **notifies
  the life group leader** of whoever is displaced by it
  ([how](02-architecture.md#notifications)). The point is to push groups to
  plan ahead and settle a conflict before it becomes a problem, not to have the
  app decide it. A group might hold the dining room from 4:30 to 5:30 and a room
  from 5:30 to 6:30 to fit around another group.
- **A member can reserve a room to study or work**, for example from 3 to 4 or
  3 to 6, when it is free. The branch asks people to respect it and not to
  disturb him. The app shows the reservation; it does not enforce quiet.
  **Study never claims a space** (2026-11-22, for review): others can still be
  there; it asks them for quiet.
- **The schedule is kept in the app's database**, so a screen in the apartment
  can show it later ([11](11-later.md)). The MVP does not need the screen, only
  to keep the schedule in a form a screen could read.

This replaces the earlier open question of claim versus visibility: an entry
claims a space, and a clash is reported to the people it affects instead of
being refused.

### Decided (2026-11-22)

- **The study room is one of the two rooms.** The other is the second room.
- **A typical life group meeting** starts in the dining room for the first
  hour and moves to one of the two rooms for the second.
- **A life group meeting can displace a study reservation.** Meetings are
  scheduled ahead, at a constant weekly time, so a member can see them coming.
- **A single member who is displaced is told himself.**

### Decided (2026-11-22, for review)

- **Who uses it:** members. A newcomer, an inactive member and an alum mentor
  do not see the schedule. A member out of good standing still uses it
  ([06](06-dues.md)).
- **The spaces are named by the secretary** in the app, not in code: the two
  rooms and the dining and living area.
- **A life group's second-hour room** is chosen once, when the leader sets the
  weekly meeting, and stays. A clash is reported like any other double
  booking.
- **The kinds of booking:**

  | Kind | Claims the space? | Who can book it |
  |---|---|---|
  | Studying | No; asks others for quiet | any member |
  | Being there | No; shared | any member |
  | A meeting (a priest's conversation with a student, for example) | Yes | any member |
  | A life group meeting | Yes | from the group's weekly time ([04](04-roster-and-life-groups.md)) |

- **Who can bump a booking:** the core team and the priests. Otherwise only a
  life group meeting takes precedence. Whoever is bumped is told.
- **A member can book up to two weeks ahead.**
- **The apartment order** (house rules) is linked at the top of the
  schedule. It is a page, edited like any other ([07](07-pages-and-menu.md)).

## Open questions

- Whether a meeting booking needs a limit (on how long, or with whom), since
  a member wanting a room to himself could book a "meeting"
  ([15](15-decisions-for-review.md#apartment)).
