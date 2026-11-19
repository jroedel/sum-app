# 06 — Dues

★ MVP: "Dues".

## What dues are

The amount each member pays each semester: **$50** as remembered, but the
[sumatx.us](https://sumatx.us/) homepage says **$60** ("dues begin your second
semester"). To confirm. The app keeps track of **who has paid and who has
not yet paid**.

**Dues are not required in a person's first semester.** They are due from the
second semester on (decided 2026-11-19). So the app needs to know the semester
each person joined ([04](04-roster-and-life-groups.md)).

## Semesters

How a semester is defined in the app: its name (for example "Fall 2026"),
start and end dates, and who opens a new one. The same semester calendar
anchors the deadlines in [09](09-checklists-and-milestones.md).

## Two ways a payment is recorded

Decided 2026-11-19. **The secretary is responsible for dues.**

### 1. A member pays through drop-in forms, and it records itself

Once the app is live, most members are expected to pay this way. Each
semester has a dues form in drop-in forms ([12](12-forms.md)), made from a
template like any other form, with the semester's amount as its fee. Stripe
handles the card, and its checkout offers Apple Pay on an iPhone, which
covers the board's "Dues → Apple Pay".

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

### 2. Cash, recorded by hand

Some members will pay in cash. The secretary records it in the app:

- the member, and the semester it is for;
- the amount and the date;
- **who received the cash**, which need not be the secretary.

A hand-recorded payment can be corrected or removed only by the secretary,
and the record keeps who entered it and when.

## Who sees what

A member sees his own status for each semester, and how he paid. The
secretary sees everyone's.

## What paying, or not paying, affects

Whether unpaid dues affect anything in the app or the member benefits.

## Open questions

- The amount: $50 or $60 (the website says $60), and whether it can change per
  semester.
- Other ways members pay today besides cash (Venmo, Zelle?), and whether the
  secretary records those by hand too.
- Whether a member who received cash can record it himself, for the
  secretary to confirm, or only the secretary records.
- Who receives Stripe payments, and whether the drop-in forms account that
  takes them is the branch's own.
- Partial payments and waivers.
- Whether unpaid dues affect apartment or basement access.
- Whether inactive members owe dues.
- Whether "first semester" means the semester they signed up in the app, or
  is set by the secretary (for people who joined before the app existed).
