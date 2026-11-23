# The clickable mock-ups

What the first screens of the SUM app could look like, to click through on a
phone: <https://app.sumatx.us/prototype/>. They follow
[14 — Stories, flows and the site map](../14-stories-flows-and-site-map.md#the-first-mock-up)
and [10 — Design](../10-design.md). They are **not the app**. Every page says
so in a banner, nothing is saved anywhere but in the browser that clicked
it, and every person, group and booking in them is invented.

The brand sheet is beside them at <https://app.sumatx.us/brand/>, from
[`../design/brand.html`](../design/brand.html), and shares their fonts and
stylesheets.

## Looking as someone else

The banner's **Viewing as** switches between the five people doc 14 asks
for. Home and the menu change with it:

| Role | Who |
|---|---|
| Newcomer, no request | Signed up, not yet in a life group. No Apartment tab |
| Newcomer with a request | Has asked to join a group, and is waiting |
| Member | Confirmed by the secretary, in a group |
| Mentor (an alum) | Mentors a group from outside it; not a member |
| Secretary | A member who keeps the roster and answers what nobody else has |

A link can name the role: `…/prototype/?as=secretary`. The choice is kept as
you click, and in the browser's storage where it allows that.

## Guesses the documents don't settle

Where a screen needed an answer the docs leave open, the mock-up picks one and
lists it here, so it is not mistaken for a decision:

- **Home's sections, per role** (doc 07's table, in doc 10's order). The
  secretary's feed holds a new sign-up, a request nobody answered in 3 days, a
  payment to match and a sweatshirt to hand over. The mentor sees his groups
  under *Your groups*.
- **The secretary is a member,** with his own group, streak and milestones.
- **Withdrawing to ask another group** is offered right where the second
  request is refused, as "Withdraw it", rather than only on Home.
- **A mentor sees requests to his own groups only;** the secretary sees every
  request, with the ones unanswered for 3 days marked.
- **The rooms' names.** Doc 05 has the secretary name the spaces; "Study
  room" and "Second room" stand in for whatever he calls them.
- **An overlap is marked on both bookings** ("Overlaps"), and adding one says
  who is told. **Who gives way** (doc 05 decides what claims a room, not the
  order between claims): a life group's meeting comes first, then a meeting,
  then studying and being there, which share. Two meetings at once are both
  told to settle it.
- **Bumping** a booking (the core team's and the priests' power) is shown for
  the secretary, on anything but a life group's meeting.
- **Signing in:** the name is asked as first and last, and only the first is
  required. The phone being optional is the mock-up's guess. Four codes per
  address is the mock-up's "a few times an hour" (doc 03), counted per visit.
- **Dues:** the payment page stands for the drop-in forms dues form; the
  mock-up's semester is Fall 2026, past its week 6, so Mateo's unpaid dues
  show him out of good standing. Settling a semester by hand asks for a note.
- **Songs:** a song found by its words shows the line it was found in, and a
  larger text size, for reading across a room, is remembered. Only
  public-domain texts are in the mock-up: the branch's own songs are mostly
  under copyright and belong in the app's database, never in this public
  repository.
- **Game, More and anything marked "not in this mock-up"** are placeholders:
  tapping one says so rather than doing nothing.

The people (Lucas, Mateo, Andrew, Daniel, Owen, Noah, Ethan, Caleb and the
groups' members) and the groups (Emmaus, Cana, Nazareth, Tabor) are invented.
Their emails are at example.org and their phone numbers in 555-0100 to
555-0199, which are set aside for fiction.

## Clicking through the flows

**Flow 1, signing in.** **More → Sign out** opens it, with no tabs. The code
is always **246810**, and a note on the screen says so. Any address signs up:
after the code comes the profile, then Home as a newcomer.
**mateo@example.org** (a member) and **daniel@example.org** (the secretary)
skip the profile. A wrong code says how many tries are left; after five, or
after "Pretend 10 minutes have passed", it asks for a new code; a fifth "Send
a new code" is refused.

**Flow 2, a request to join.** Lucas, the newcomer, has one request in this
browser. Choosing **Newcomer, no request** starts him over. He opens a group
from Groups and taps **Request to join**; Home then shows Pending. Asking a
second group asks him to withdraw the first. As **Mentor**, Requests to join
(from Home or Groups) has **Approve**. Before he has done anything, the
mock-up's example is a request to Emmaus sent on Saturday.

**Flow 3, dues.** Approved, Lucas's Home asks for his **first dues**; before
that, Dues says they come after his group. Paying them (the payment page,
then back) makes him a member: Home welcomes him, the Apartment tab appears,
and his group's page shows contact details. As **Member**, Mateo's Fall dues
are overdue: he is out of good standing, and nothing else changes until he
pays. As **Secretary**, More → Everyone's dues matches a payment by hand,
marks a sweatshirt given, and settles a semester with a note.

**Flow 4, a song.** **More → Songs** lists them A to Z; the search narrows by
title, then by words ("salve regina" finds both the chant and the hymn that
ends with it). A song opens with its words; the larger **A** stays chosen.

**Flow 5, the apartment.** As **Member**, Apartment shows the two weeks from
Monday, November 23, with each life group meeting as its two halves and the
apartment order linked at the top. Studying and being there share a room
(Simon is there while Isaac studies); a meeting claims it (Fr. Thomas, on
Friday). Mateo's Wednesday study time is overlapped by Cana's second hour,
and Home says so. **Add yourself** is always accepted, and says who is told:
try a meeting in the study room on Monday afternoon, or being there in the
dining room on Tuesday at 6:30. **Remove me** takes off his own; as
**Secretary**, **Bump** takes off someone else's.

**Contact details** (doc 04) show on a group's page for members, and for a
mentor in the groups he mentors. A newcomer sees first names, years and
majors.

## How it is built

Plain HTML, CSS and JavaScript modules, with no build step and no npm, as
`CLAUDE.md` asks. The pages share no template: the banner, top bar and tab bar
are written out in each, so each page reads on its own.

- `tokens.css` holds the brand's tokens and `components.css` its components,
  both taken from the brand sheet, which now links them instead of carrying
  its own copy.
- `prototype.css` is the shell: the banner, the top bar, the column, and the
  tab bar, which becomes a left rail from 960 px.
- `model.js` holds the rules (who sees what, whether two bookings clash), and
  `app.js` applies them to the page. An element marked
  `data-for="member secretary"` is shown only to those roles.
- `fonts/` has the four Latin woff2 files, under the SIL Open Font License
  (the `OFL-*.txt` beside them). They were fetched once from
  `https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,600;0,700;1,400&family=Alegreya+Sans:wght@400;700`,
  with a current Chrome's user agent so the answer is woff2, taking each
  `/* latin */` block's file. Alegreya's 600 and 700 are one variable file.
- `icons.svg` is a sprite of [Lucide](https://lucide.dev) icons from
  `lucide-static` 0.460.0, under the ISC license (`LICENSE-lucide.txt`). Its
  comment says how to add one.
- `seal.svg` is a placeholder. The seal's artwork is not in this public
  repository (doc 10, "The seal").

The server carries these files in its binary (`docs/docs.go`) and serves them
from `app/domain/docsapp`. Under `/prototype/` and `/brand/` it sends
`X-Robots-Tag: noindex` and allows the pages their own scripts; everywhere
else its policy is unchanged.

## Checking a change

```sh
make test-js         # model.js, in Node
make test-browser    # the pages in headless Chrome, against the real server
make go-check PKG=./app/domain/docsapp   # every page has the banner and noindex; every link resolves
make dev             # then open http://localhost:8460/prototype/
```

## Taking them out

When the real screens replace them (issue #8):

1. Delete `docs/prototype/`, the `Prototype` variable and its pattern in
   `docs/docs.go`, and the `/prototype/` route in
   `app/domain/docsapp/docsapp.go`, with its tests.
2. Move the fonts, `tokens.css`, `components.css` and `icons.svg` to the
   app's own static files first, since the brand sheet links them, or delete
   the brand sheet's route too.
3. Remove the `/prototype/` case from `app/sdk/page/policy.go`.
4. Take `docs/prototype` out of `scripts/js-test` once nothing is left there.
