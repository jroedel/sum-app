# 06 — Dues

★ MVP: "Dues".

## What dues are

**$60 per semester** (decided 2026-11-19, matching
[sumatx.us](https://sumatx.us/)). The app keeps track of **who has paid and
who has not yet paid**.

**Dues are not required in a person's first semester.** They are due from the
second semester on (decided 2026-11-19). So the app needs to know the semester
each person joined ([04](04-roster-and-life-groups.md)).

## Semesters

How a semester is defined in the app: its name (for example "Fall 2026"),
start and end dates, and who opens a new one. The same semester calendar
anchors the deadlines in [09](09-checklists-and-milestones.md).

## Paying: only through drop-in forms

Decided 2026-11-19. **The secretary is responsible for dues**, and **from the
app's launch on, members pay only through drop-in forms.** No cash, Venmo or
Zelle is recorded in the app.

Each semester has a dues form in drop-in forms ([12](12-forms.md)), made from
a template like any other form, with $60 as its fee. Stripe handles the card,
and its checkout offers Apple Pay on an iPhone, which covers the board's
"Dues → Apple Pay".

- The member pays from the app, so the form knows who he is: the signed
  token from drop-in forms
  [#100](https://github.com/jroedel/dropin-forms/issues/100) carries his ID.
  The app never sees card details.
- The app learns of the payment by reading the form's submissions, or by a
  webhook once [#101](https://github.com/jroedel/dropin-forms/issues/101)
  exists. Nobody types anything.
- Until #100 exists, a payment is matched to a member by email address, and
  anything that does not match lands in the secretary's feed
  ([03](03-accounts-and-access.md)).

## Who sees what

A member sees his own status for each semester. The secretary sees
everyone's.

## What paying, or not paying, affects

Whether unpaid dues affect anything in the app or the member benefits.

## Open questions

- Which Stripe account receives the money, and whether the drop-in forms
  account that takes them is the branch's own.
- Waivers, and dues paid before the app launched: does the secretary mark a
  semester settled by hand, with a note, or is there no exception at all?
- Whether unpaid dues affect apartment or basement access.
- Whether inactive members owe dues.
- Whether "first semester" means the semester they signed up in the app, or
  is set by the secretary (for people who joined before the app existed).
