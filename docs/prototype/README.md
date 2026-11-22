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

- **An alum mentor has no Apartment tab.** Doc 10 gives the tab to members;
  doc 04 makes the alum mentor not a member.
- **Home's sections, per role** (doc 07's table, in doc 10's order). The
  secretary's feed holds a new sign-up, a request nobody answered in 3 days,
  and a payment to match (doc 03, doc 06). A member's *Waiting on you* is dues
  when they are due. The mentor sees his groups under *Your groups*.
- **The secretary is a member,** with his own group, streak and milestones.
- **Game, More and anything marked "not in this mock-up"** are placeholders:
  tapping one says so rather than doing nothing.

The people (Lucas, Mateo, Andrew, Daniel, Noah, Ethan, Caleb) and the groups
(Emmaus, Cana, Tabor) are invented.

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
