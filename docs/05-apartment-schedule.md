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

### Decided (2026-11-22)

- **The study room is one of the two rooms.** The other is the second room.
- **A typical life group meeting** starts in the dining room for the first
  hour and moves to one of the two rooms for the second.
- **A life group meeting can displace a study reservation.** Meetings are
  scheduled ahead, at a constant weekly time, so a member can see them coming.
- **A single member who is displaced is told himself.**

## Open questions

- What the two rooms are called.
- How a life group leader chooses the room for his second hour, and whether a
  meeting without a room free in its second hour is reported like any other
  double booking.
- Whether a study reservation can be displaced by something other than a life
  group meeting.
- Whether some uses need a space to themselves and others can share it.
- Whether there is an "apt order" document ([07](07-pages-and-menu.md)) with
  house rules the schedule should link to.
- How far ahead a member can put himself on the schedule.
- Whether inactive members, or members who have not paid dues, can use it.
