# 06 — Dues

★ MVP: "Dues".

## What dues are

**$60 per semester** (decided 2026-11-19, matching
[sumatx.us](https://sumatx.us/)). The app keeps track of **who has paid and
who has not yet paid**.

**Dues are paid from the first semester, and the first payment makes a
newcomer a member** (2026-11-22, for review; it replaces "not required in the
first semester", decided 2026-11-19). A newcomer can pay only once a mentor
has approved him into a life group ([03](03-accounts-and-access.md)), so that
$60 alone never buys the roster. Paying is the decision to belong: the case
for it, and against it, is in
[15](15-decisions-for-review.md#membership).

**The first dues earn the free SUM sweatshirt.** The first payment marks a
sweatshirt as owed and puts it in the secretary's feed; he marks it given when
it is handed over.

The semester each man joined is kept for the record
([04](04-roster-and-life-groups.md)). It no longer decides whether he owes.

## Semesters

How a semester is defined in the app: its name (for example "Fall 2026"),
start and end dates, and who opens a new one. The same semester calendar
anchors the deadlines in [09](09-checklists-and-milestones.md).

## Paying: only through drop-in forms

Decided 2026-11-19. **The secretary is responsible for dues**, and **from the
app's launch on, members pay through drop-in forms.**

**The exception** (2026-11-22, for review; it loosens "no cash, Venmo or Zelle
is recorded", decided 2026-11-19): the secretary can mark a semester settled
by hand, with a short note ("paid cash", "waived", "paid before launch"). It
counts like a payment, including for the sweatshirt. Recording and matching
dues is the secretary's own power, not the branch leader's
([03](03-accounts-and-access.md#the-secretarys-own-powers)).

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

## Good standing

Decided 2026-11-22, for review.

- **A semester's dues are overdue after the end of its week 6.** Reminders go
  out before then.
- A member whose dues are overdue is **out of good standing**. The phrase is
  a working one. It is separate from inactive
  ([04](04-roster-and-life-groups.md#active-and-inactive)).
- **Being out of good standing costs nothing.** It is shown, and the
  reminders continue; the roster and the apartment stay open to him.
- **Inactive members owe no dues.**

## Who sees what

A member sees his own status for each semester. **The core team and the
priest moderators** see everyone's, and who is out of good standing
(2026-11-22, for review).

## Open questions

- Which Stripe account receives the money, and whether the drop-in forms
  account that takes them is the branch's own.
- For a man who signs up after launch, whether his first semester is simply
  the one he signed up in.
