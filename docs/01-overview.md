# 01 — Overview

## What SUM is

The Schoenstatt University Men (SUM) of Austin, Texas is a **branch** of the
Schoenstatt movement. The branch is made up of small groups called **life
groups** (LGs); together the life groups make up the branch.

Being a branch member brings benefits:

- access to the **SUM apartment** in West Campus;
- access to the **Schoenstatt Fathers' basement**, on request;
- life group **overnights** at the **St. Joseph meeting space** by the shrine.

Life groups meet every week. Each semester opens and closes with a **branch
retreat**, so there are four a year. The branch's ideal is *SUM: Transforming
Hearts with Mary*. The public site is [sumatx.us](https://sumatx.us/).

## What the app is for

The day-to-day operations of the branch. Every member can log in; alumni may
be able to later.

In a sense the app is the branch's **standard operating procedure manual,
written into software**. It knows what should happen when (for a life group
in its semester, for an event, along a member's path), shows whether it is on
track, and links to the page that explains how. See
[09](09-checklists-and-milestones.md).

## Who uses it

- **Newcomers**: anyone who signs up. They can use the app at once, in a
  holding pattern that mirrors a first semester in the branch.
- **Members** of the branch, confirmed by the secretary, active or inactive.
- **The secretary** and other core team roles, who keep the roster, record
  dues and edit pages. See [03](03-accounts-and-access.md).
- **Alumni**: later, not in the MVP. The MVP must not assume members are the
  only kind of user.

Members belong to an institution of higher education today, but the app does
not require it: it says "member", not "student".

## The MVP test

<!-- One sentence the first release must pass, in the spirit of stewards'
"Phase 1 test". To be written with the branch. -->

## The brainstorm

From the whiteboard ([photo](whiteboard-2026-11-18.jpg)). ★ = in the MVP.
P = will be a page: content, not a feature of its own.

| Item | Mark | Where it is documented |
|---|---|---|
| User management | ★ | [03](03-accounts-and-access.md) |
| LG directory / roster | ★ | [04](04-roster-and-life-groups.md) |
| Apartment scheduling | ★ | [05](05-apartment-schedule.md) |
| Dues (→ Apple Pay) | ★ | [06](06-dues.md): $60, paid only through drop-in forms, where Stripe offers Apple Pay |
| Pages | ★ | [07](07-pages-and-menu.md) |
| Daily game | ★ | [08](08-daily-game.md) |
| Home page: upcoming events, feature | P | [07](07-pages-and-menu.md): the home page is built in code; events and the feature stay editable |
| Documentation: apt order, conduct policy, 1st overnight doc, branch day org doc | P | [07](07-pages-and-menu.md) |
| Event sign-ups / home page | P | [12](12-forms.md), [09](09-checklists-and-milestones.md) |
| Schoenstatt knowledge base: formation material, founding docs | P | [07](07-pages-and-menu.md) |
| Songs (→ streaming) | P | [07](07-pages-and-menu.md); chords, recordings and video in [11](11-later.md) |
| Meeting scheduling | | [11](11-later.md) |
| LG coordination | | [11](11-later.md), [09](09-checklists-and-milestones.md) |
| Alumni functionality | | [11](11-later.md) |
| Leadership roles | | [11](11-later.md) |
| Native applications | | [11](11-later.md) |
| Evaluations | | [11](11-later.md) |
| Voting | | [11](11-later.md) |
| COG | | [11](11-later.md) |

## In and out of the MVP

**In:** accounts (newcomers and members), the roster and life group directory
with open groups and requests to join, personal milestones, the apartment
schedule, dues tracking, editable pages (including the home page), and a
daily game.

**Out:** everything else on the board, listed in [11](11-later.md).

**To decide:** the rest of checklists and milestones
([09](09-checklists-and-milestones.md)): life group semesters and events. It is
designed now either way, so that nothing in the MVP blocks it.

## Priority

Proposed 2026-11-22, for the branch to agree. All of these are in the MVP.
This is the order of importance among them:

1. User management ([03](03-accounts-and-access.md))
2. LG directory / roster ([04](04-roster-and-life-groups.md))
3. Dues ([06](06-dues.md))
4. Songs, as pages ([07](07-pages-and-menu.md))
5. Apartment scheduling ([05](05-apartment-schedule.md))
6. Daily game ([08](08-daily-game.md))

Pages ([07](07-pages-and-menu.md)) are not on the list because they are what
songs and the other content are built from. They are also valued for a second
reason: an MCP endpoint over pages lets the core team change a lot of the
app's content without a screen for each.

## Open questions

- The MVP test, in one sentence.
- A target date for the first release.
- Whether the order above is also the order of building, and what is cut first
  if the first release has to be smaller.
