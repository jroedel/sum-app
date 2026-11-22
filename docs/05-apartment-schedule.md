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
- **The schedule is kept in the app's database**, so a screen in the apartment
  can show it later ([11](11-later.md)). The MVP does not need the screen, only
  to keep the schedule in a form a screen could read.

This replaces the earlier open question of claim versus visibility: an entry
claims a space, and a clash is reported to the people it affects instead of
being refused.

## Open questions

- The spaces and their names: whether one of the two rooms is the study room,
  and whether the dining and living area is ever booked as two.
- Which space a life group's weekly meeting takes by default, and how its
  leader changes it.
- Whether a life group meeting can displace a member's study reservation, or
  the reverse, or both are only reported.
- Who is notified when a member, not a group, is displaced: only the member, or
  also a life group leader.
- Whether some uses need the apartment to themselves (a life group meeting?)
  and others can share.
- Whether there is an "apt order" document ([07](07-pages-and-menu.md)) with
  house rules the schedule should link to.
- How far ahead a member can put himself on the schedule.
- Whether inactive members, or members who have not paid dues, can use it.
