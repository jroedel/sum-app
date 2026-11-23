# 07 — Home, pages and menu

★ MVP: "Pages". Every **P** item on the board is handled as a page. The home
page is the exception: it is built in code.

## The home page is built in code

Decided 2026-11-19. The home page is **not** an editable page. It is the
screen that knows who is looking and what is waiting on them, and those are
things the code must know when it is written. What it shows depends on the
person:

| Who | What the home page shows |
|---|---|
| A newcomer with no request | Open life groups, and how to request to join one ([04](04-roster-and-life-groups.md)) |
| A newcomer with a request | **Pending**, or **approved** with his group and its meeting time |
| A member | His life group and its next meeting; dues if due ([06](06-dues.md)) |
| Anyone with milestones | His path: reached, and next ([09](09-checklists-and-milestones.md)) |
| A mentor | Requests to join his groups |
| The secretary | His feed: new sign-ups, unanswered requests ([03](03-accounts-and-access.md)) |
| Everyone | Upcoming events, the feature, and the daily game ([08](08-daily-game.md)) |

**Upcoming events and the feature stay editable.** The home page sets aside
a place for each, and fills it from a page that the core team edits like any
other. The layout is in code; what the branch wants to promote this week is
not.

## Pages

WordPress-style: a page is stored in the database and can be edited in the
app.

### What a page is made of

Decided 2026-11-22, for review.

- **A page is a list of blocks:** a heading, text, an image, audio, an
  embedded form ([12](12-forms.md)).
- **A group of blocks can be named and reused on other pages.** Changing it
  changes every page that uses it, so a reused group has its own drafts and
  shows where it is used. The proposal is to build plain blocks first and
  reusable groups straight after, not both at once
  ([15](15-decisions-for-review.md#pages-and-songs)).
- **Drafts.** An edit is a draft until it is published, and **the editor
  publishes his own**; there is no second approval.
- **Public pages.** An editor can mark a page public, readable without
  signing in. Everything else needs signing in. Doc 03's test applies: would
  we put it on sumatx.us?

This part should be reusable in other projects.

### Editing through an MCP endpoint

Proposed 2026-11-22; the decisions below are of the same day, for review.
Pages are the part of the app where one endpoint reaches
the most content: the feature and upcoming events on the home page, the
documents, the knowledge base and the songs are all pages. An **MCP endpoint**
over pages would let the core team read and change them from Claude, as well
as in the app. Drop-in forms already has one for forms ([12](12-forms.md)).
It would be another way to do what the editing screens do, with the same
permissions.

- **Page editors** may use it, under **the same rules as the app**: it saves
  drafts, and publishes only what the editor could publish himself.
- **It covers people as well as pages.** Moving the branch in at launch is
  done through it: the roster is read from a spreadsheet with Claude and
  entered through the endpoint
  ([04](04-roster-and-life-groups.md#moving-the-branch-in)). So the endpoint
  for people is needed before the first release.

## The menu

The menu is **fixed in code**, and **an editor chooses in the app which page
each menu item opens** (2026-11-22, for review). Changing a target needs no
pull request.

## The first pages

From the board:

- **Upcoming events** and **the feature**, shown on the home page.
- **Documentation**: apartment order, conduct policy, first overnight
  document, branch day organization document.
- **Schoenstatt knowledge base**: formation material, founding documents.
- **Songs**. The lyrics come first and must open quickly. Chords, recordings,
  video and tabs are later ([11](11-later.md)). **Listed A to Z, with a search
  over titles and words, and saved for reading offline**, for the apartment
  and retreats (2026-11-22, for review).
- **Event sign-ups**: a page with a form from drop-in forms
  ([12](12-forms.md)).

## Links from elsewhere

A page can be linked from places other than the menu, for example from an
event type in [09](09-checklists-and-milestones.md) to its how-to page.

## Who edits

Decided 2026-11-22, for review.

- **Every core team member** can edit and publish pages, automatically.
- **A page editor role** can be given to anyone else, **for a group of
  pages**: someone can be allowed to edit the songs and nothing else.

## Open questions

- The groups of pages that editor roles cover, beyond songs (documents, the
  knowledge base, events?).
- Who gives the page editor role: the branch leader, the secretary, or any
  core team member.
