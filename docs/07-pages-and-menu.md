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

WordPress-style: a page is stored in the database, can be edited in the app,
and has structure (to be defined here: headings, text, images, links,
embedded audio, embedded forms ([12](12-forms.md))?).

This part should be reusable in other projects.

## The menu

The menu is **fixed in code**. What is open is how a menu item reaches its
page:

- **the page is named in code** (by its slug), so the menu and its targets
  change only through a pull request; or
- **a page is assigned to a menu item in the app**, so the code defines the
  item and an editor chooses which page it opens.

## The first pages

From the board:

- **Upcoming events** and **the feature**, shown on the home page.
- **Documentation**: apartment order, conduct policy, first overnight
  document, branch day organization document.
- **Schoenstatt knowledge base**: formation material, founding documents.
- **Songs**. Streaming is later ([11](11-later.md)).
- **Event sign-ups**: a page with a form from drop-in forms
  ([12](12-forms.md)).

## Links from elsewhere

A page can be linked from places other than the menu, for example from an
event type in [09](09-checklists-and-milestones.md) to its how-to page.

## Who edits

Who can create, edit and publish pages, and whether there are drafts.

## Open questions

- The menu question above.
- What structure a page has.
- Whether any page is visible without logging in.
- Drafts and history: whether an edit can be undone.
- English only, or English and Spanish ([10](10-design.md)).
