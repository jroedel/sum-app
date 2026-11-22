# 09 — Checklists and milestones

The app is a standard operating procedure manual written into software. The
*how* of each procedure lives in a page ([07](07-pages-and-menu.md)). The
*when* and *who*, and whether it is on track, live here.

One mechanism serves three uses:

1. **A life group's semester**: the steps every life group goes through.
2. **An event**: branch day, Friendsgiving, the opening and closing branch
   retreats of each semester.
3. **A person's milestones**: the checkpoints of a member's path in SUM.

## The mechanism

A **checklist** is a list of steps. A step has:

- a name;
- optionally, a **deadline**, written relative to one anchor date:
  - the **event's date** ("14 days before");
  - the **start of the semester** ("within the first 3 weeks");
  - the **end of the semester** ("in the last 2 weeks");
- optionally, a link to the page that explains how to do it;
- optionally, who it falls to (a role, such as the life group leader or the
  event's lead).

The anchor dates come from the **semester calendar**: each semester's start
and end dates, entered once per semester. Dues ([06](06-dues.md)) uses the
same calendar.

**Each step shows whether it is done, on track, due soon or overdue**,
worked out from its deadline and today's date. A step without a deadline is
just done or not done, shown in order.

### Where the steps are defined

**Recommended:** the checklists themselves (which steps, in what order, with
what deadlines) live in a **file in the repository**, and the explanations
live in pages, which can be edited in the app.

- Changing a procedure then goes through a pull request that a person
  reviews, like any other change. That suits a procedure manual: it changes
  rarely, and deliberately.
- The app needs no screens for editing checklists, which is the largest piece
  of building this that can be left out.
- The prose, which changes more often, stays editable by the core team.

### What a particular instance adds

A particular life group's semester, or a particular branch day, gets a copy
of its checklist when it is created, plus whatever is particular to it:
people in roles, a budget, a date, extra steps. Copying means a later change
to the procedure doesn't rewrite the past.

### Reminders

A step that is **due soon** and not done sends a reminder by email to whoever
it falls to. Email is already essential for sign-in
([02](02-architecture.md)), so this adds no new service. Push notifications
are a later question.

## 1. A life group's semester

### Open and closed

A life group is **open** while it is forming in the current semester, and
newcomers can see it and its composition ([04](04-roster-and-life-groups.md)).
Many groups **close at their first overnight**.

### Steps

| Step | When | How-to page |
|---|---|---|
| Schedule the first overnight | Within the first 3 weeks of the semester | 1st overnight doc |
| First overnight | (the date scheduled) | 1st overnight doc |
| Choose a group leader | At the first or second overnight | to be written |
| Choose next semester's meeting day | In the last 2 weeks of the semester | |

Overnights are held at the St. Joseph meeting space by the shrine.

### What the life group sees

At any time, how the group is doing on its current semester: which steps are
done, which are coming up, and which are overdue.

## 2. Events

The pattern described earlier for branch day applies to every event:
Friendsgiving and the four yearly branch retreats (the opening and closing
retreat of each semester, fall and spring). Each has something special, and
points in common.

- **Event type:** its how-to page (for example the branch day organization
  document), the roles it needs (**lead**, **sub-lead**, **food**: buy and
  prepare), and its steps.
- **An event:** a date, a person in each role, a budget, and its own copy of
  the steps.
- **Lead and sub-lead:** the sub-lead learns how to do it, so he can lead the
  next time. Each branch day has both assigned at the latest at the opening
  branch retreat of that semester.

## 3. A person's milestones

Milestones help a newcomer **picture himself in SUM**: there are checkpoints
to reach along the way. Each is recorded once, with a date, on the member's
profile ([04](04-roster-and-life-groups.md)), and the profile shows them as a
path: reached and still ahead.

1. **The SUM wristband**, bearing the branch's ideal: *SUM: Transforming Hearts
   with Mary*.
2. **The Home Shrine Kit**: the SUM flag, *Heavenwards*, and the diptych. The
   [home shrine class page](https://sumatx.us/homeshrine26) ties it to the
   first overnight and the branch retreat after it.
3. **The Covenant of Love**, the center of Schoenstatt spirituality.
4. **Consecration of the personal ideal.**

Personal milestones have no deadlines and send no reminders. They are
reached, not due.

**In the MVP** (decided 2026-11-19). **The member records his own** milestone,
or **the secretary** records it for him.

## 4. A leadership path

Proposed 2026-11-22, for the branch to agree.

Formation is largely growing in competence: learning how to do things and how
to serve the community. A man should be able to see how to take on more, and
the core team should be able to see who is willing to help.

Until now the branch has asked for this with a **leadership interest form**,
usually a simple Google form. It records that a man is interested and says
nothing about what comes next. The app can lay out the steps, each a small
one:

1. **Deputy** (sub-lead) of a small event.
2. **Lead** of a small event.
3. Only then is he considered for the core team, the Good Friday pilgrimage
   or Ignis, which come after some experience in the group.

Small events are branch day, Friendsgiving and the Seder meal. A role can also
be smaller and last all year:

- **Queen's Guard** makes sure the Blessed Mother arrives at each event. There
  could be several.
- **Stocking the pantry** is small, and of great value when it is done well.
- **Adoration setup** is a larger role, and should have a deputy too.

Two things should follow. A new man knows what is expected of him and which
step is next. The core team sees who has said he is willing, so it can hand a
task to someone else early rather than improvising at the last minute. Leading
means delegating: giving the new man a chance and involving more people.

**The app does not score a man.** The core team looks at his progress, and
there are qualities that no number shows. Someone who is faithful in small
matters will be entrusted with greater ones, and that counts for more than a
good résumé.

### The interest form

The **leadership interest form** is the way a man says he is willing, and it
stays. When it is open is still to be thought through. The proposal is that it
opens at the **closing branch retreat** of the fall and spring semesters, so
that positions are filled mostly at the **opening branch retreat** of the next
one (lead and sub-lead of each branch day are already assigned at the latest
then, section 2). A man who fills it in should be assigned fairly soon after.

The roles already exist for events (**lead** and **sub-lead**, section 2), and
the path is those roles over time. What is not decided is how much of it the
app records; see the open questions. As with everything here, it must stay
small enough for a student branch to maintain.

An evaluation after each event, which would show the core team how it went, is
in [11](11-later.md).

## Deliberately left out

To keep this maintainable:

- no screens for editing checklists ([where the steps are defined](#where-the-steps-are-defined));
- no dependencies between steps;
- no states beyond done or not done;
- anchors are limited to an event's date and the semester's start and end. A
  deadline tied to *another* event ("lead and sub-lead by the opening
  retreat") becomes an ordinary dated step, set when the semester's events
  are created;
- reminders only by email, and only for "due soon".

## In the MVP or after

**Personal milestones are in the MVP** (decided 2026-11-19). Being cheap to
build, they also help newcomers picture their path from the first release.

The life group semester checklist and events are still to decide. The
recommended order is the life group semester next, and events after that.

## Open questions

- Whether the life group semester checklist is in the MVP, or first after it.
- Whether checklists live in a repository file (recommended) or are edited
  in the app.
- Who marks a life group closed: its leader, the secretary, or automatically
  at the first overnight.
- Whether the home shrine blessing is a milestone of its own.
- Whether reminders also go out when a step is overdue, and to whom (the
  life group, its leader, the secretary).
- Better names for lead and sub-lead.
- What "hook" means for an event.
- Who creates events and assigns people.
- Whether a budget is a single amount, or tracks what is spent.
- Whether the leadership path ([section 4](#4-a-leadership-path)) is in the
  MVP. It builds on events, which are still to decide.
- Which roles have a deputy, and which can have several people (Queen's
  Guard).
- Who decides that a man is ready for the next step, and who sees his
  progress.
- When the interest form opens and closes, and how soon after a man fills it
  in he is assigned.
- How the core team sees who has filled the form in, and whether the form
  lives in the app or stays a separate form that the app links to.
- Whether the term is Friendsgiving or something else the branch uses.
- Whether a step is a milestone on the member's profile (section 3) or is
  worked out from the events he has been sub-lead and lead of.
