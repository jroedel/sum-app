# 14 — Stories, flows and the site map

Proposed 2026-11-22, for the branch to agree. This is what a designer, or an
agent building a clickable mock-up, needs in one place: what each kind of
person wants to do, the steps they take, and which screens exist. It comes
from the UX designer's worksheet (stories, flows, site map, sketches,
prototype) and is drawn from documents [03](03-accounts-and-access.md) to
[10](10-design.md). Where it disagrees with one of them, that document wins
and this one is wrong.

Anything not decided yet is marked **Open**.

## User stories

A story says what one kind of person wants to do, and why. It does not say how
the screen looks. There is a group of stories for each of the five highest
items in [01](01-overview.md#priority).

### 1. User management ([03](03-accounts-and-access.md))

- As a new man, I want to sign in with a code sent to my email, so that I
  don't need a password and can start using the app at once.
- As a member with the app installed on my iPhone, I want to stay signed in
  for months, so that I'm not asked for a code every time I open it.
- As the secretary, I want to see each new sign-up, so that I can reach out to
  him and confirm him as a member.
- As a priest moderator, I want to hand a role such as secretary to a new man
  with a changeover period, so that he can learn it while the outgoing man can
  still act.
- As a priest or alum who mentors a life group, I want to sign in without being
  a member, so that I can see my group.

### 2. LG directory / roster ([04](04-roster-and-life-groups.md))

- As a member, I want to keep my own profile current (phone, major, year of
  graduation), so that the roster is right without the secretary chasing me.
- As a member, I want to find another member's email or phone number, so that
  I can reach him.
- As a new man, I want to see the open life groups with their members'
  graduation years, so that I can find a group that suits me.
- As a new man, I want to request to join one group, and withdraw the request
  if I change my mind, so that I am never waiting on two groups at once.
- As a mentor, I want to be told when someone asks to join my group, and to
  approve him, so that he is in without a meeting about it.
- As the secretary, I want a request nobody has answered in 3 days to land in
  my feed, so that no one is left waiting.

### 3. Dues ([06](06-dues.md))

- As a member, I want to see whether I have paid this semester, so that I know
  whether I owe anything.
- As a member, I want to pay the $60 from my phone with Apple Pay, so that it
  takes less than a minute.
- As a man in his first semester, I want to see that nothing is due yet, so
  that I am not confused.
- As the secretary, I want to see who has paid and who has not, so that I
  remind only those who owe.
- As the secretary, I want a payment the app cannot match to a member to show
  up in my feed, so that nothing goes missing.

### 4. Songs ([07](07-pages-and-menu.md))

- As a member at a gathering, I want to open a song on my phone and read its
  words right away, so that the whole group can sing together.
- As someone on the core team who edits pages, I want to add or correct a song
  without a programmer, so that the songbook stays current.
- Later, and very important: chords, recordings, video recordings to learn a
  song on guitar, and guitar tabs, because music is a way of passing on the
  branch's values and ideals ([11](11-later.md)).

### 5. Apartment scheduling ([05](05-apartment-schedule.md))

- As a member, I want to see who will be at the apartment and when, so that I
  can choose a time when someone is there.
- As a member, I want to put myself on the schedule, so that others know I will
  be there.
- As a life group leader, I want my group's weekly meeting to appear on its
  own, the dining room for the first hour and one of the two rooms for the
  second, so that nobody has to enter it again.
- As a life group leader, I want to be told when another booking displaces my
  group, so that we can settle it before the meeting.
- As a member, I want to reserve the study room from 3 to 6, so that I can get
  work done, and I expect others to respect it. If a life group meeting
  displaces me, I want to be told myself.

## Task flows

A flow follows one person through one task, step by step, and shows where the
path splits. There is one for each of the five items.

### 1. Signing in for the first time

1. The man opens the app and sees one field: his email address.
2. He enters it and asks for a code. The app emails a 6-digit code. If he asks
   too many times in an hour, the app tells him to wait.
3. He reads the email and types the code into the app. If it is wrong he tries
   again, up to 5 times. After that, or after 10 minutes, he asks for a new
   code.
4. If this is his first time, the app asks for his profile: name, phone,
   school, major and year of graduation. Agreeing to receive texts is a
   separate question.
5. He lands on the home page as a newcomer, which shows the open life groups
   and how to request to join one. He stays signed in on this device.
6. Meanwhile the secretary sees the new sign-up in his feed and reaches out to
   him outside the app.

### 2. A newcomer requests to join a life group

1. On the home page the newcomer sees the open life groups, each with its
   members' graduation years.
2. He opens one to see its members (first name, graduation year, major) and its
   meeting time. **Open:** what else a group shows.
3. He taps Request to join. If he already has a request out, the app asks him
   to withdraw it first.
4. The group's mentors are notified, and his home page shows Pending.
5. A mentor or the secretary approves. If nobody answers in 3 days, the request
   goes to the secretary's feed. He can withdraw at any time and ask another
   group.
6. Once approved, his home page shows his group and its meeting time.

### 3. A member pays dues

1. The member opens the home page and sees that dues are due for this
   semester. If it is his first semester, nothing is due and the flow ends
   here.
2. He taps to pay. The app opens the semester's dues form from drop-in forms.
3. He pays $60 with Apple Pay or a card through Stripe. The app never sees card
   details.
4. The app learns of the payment from the form, and his home page shows that he
   has paid.
5. If the payment cannot be matched to a member (until the form can carry his
   identity, matching is by email address), it goes to the secretary's feed and
   he matches it by hand.

### 4. A member opens a song

1. The member opens the menu and taps Songs.
2. He sees the list of songs and taps a title.
3. The song opens quickly as a page with its words, and he reads or scrolls.
   Later the page can also show chords, recordings, video and guitar tabs.
   **Open:** how the list is ordered or searched, and whether a song stays
   readable with a poor signal.

### 5. A member puts himself on the apartment schedule

1. The member opens the schedule from the menu and sees the coming days, with
   life group meetings already on it.
2. He picks a space (a room, or the dining and living area, which is one
   space), a day and a time, and adds himself.
3. If his time overlaps another booking, the app still accepts it and tells the
   life group leader of whoever is displaced, so that the two can settle it
   beforehand. To study, he books the study room the same way, and others are
   asked to respect it.
4. His name appears, so others can see who will be there. He can remove himself
   later.

## The site map

The top level is the tab bar from [10](10-design.md#the-apps-layout): members
see **Home, Groups, Apartment, Game, More**; a newcomer sees the same without
Apartment (**open**, [03](03-accounts-and-access.md#open-questions)). A new
feature goes under More; there is never a sixth tab.

- **Before the tabs**
  - Sign in: email address, then the 6-digit code, then (first time only) the
    profile
- **Home**, built in code because it shows each person what is waiting on him
  ([07](07-pages-and-menu.md))
  - Waiting on you, which depends on the role: a newcomer's request, a
    mentor's requests to join, the secretary's feed
  - The feature, from a page
  - Upcoming events, then an event page with its sign-up form
  - Your group, then My life group
  - The daily game's tile, then Game
  - The milestone ring, then My milestones
- **Groups**
  - Open life groups (a newcomer sees these too)
    - A group: its members' graduation years, its meeting time, and Request
      to join
  - My life group (members)
    - Its members, its meeting time, and its semester checklist
  - Roster (members only)
    - A member's profile, with email and phone
  - Requests to join (for a mentor)
- **Apartment**
  - The schedule: the coming days, with life group meetings already on it
  - Add a booking: the space (two rooms, or the dining and living area), the
    day and the time
    - Reserve the study room for studying
  - A notice that a booking displaced yours, then the booking
- **Game**
  - Today's game (not chosen yet), with the branch's event promotion
- **More**
  - Pages
    - Documentation: apartment order, conduct policy, first overnight
      document, branch day organization document
    - Schoenstatt knowledge base: formation material and founding documents
    - Songs, then a song
  - Dues: this semester, whether paid, and Pay
  - My profile: edit my details, my milestones, sign out
  - The secretary's tools: his feed (new sign-ups, requests nobody has
    answered), confirm members, the roster and active or inactive, everyone's
    dues, record milestones
  - The priest moderator's tools: assign mentors, the two switches that let
    the branch leader or the secretary assign them, give roles with a
    changeover period
  - The core team's tools: edit pages in the app, and through the MCP endpoint

### Not placed yet

These are wanted, but are either later ([11](11-later.md)) or not decided
enough to have a screen:

- The leadership path and its interest form
  ([09](09-checklists-and-milestones.md)). **Open:** whether it lives on Home
  or under More.
- Capital of grace, prayer requests and a glossary. They are in the branch's
  notes but in none of the documents yet. The glossary could be a page in the
  knowledge base; the other two would be new features under More.
- The communications person's text blast and promotion tracking.
- Evaluations after each event, song media, a photo database, a forum and the
  apartment display, all in [11](11-later.md).

## The first mock-up

For whoever builds the clickable mock-up. It follows `CLAUDE.md`: the mock-up
is static pages under `docs/prototype/`, plain HTML, CSS and JavaScript with no
build step, and it behaves only as far as the flows above need. It does not
become the app.

- **Build first:** Home, then the request-to-join flow (flow 2), then the
  apartment schedule (flow 5). Home is already drawn in
  [10](10-design.md); the rest are sketched as screens are agreed.
- **A role switcher.** Home and the menu change with who is looking, so the
  mock-up needs a way to be a newcomer with no request, a newcomer with a
  request, a member, a mentor and the secretary.
- **Invented people and groups only.** The repository is public. No real name,
  email, phone number or photograph goes into a mock-up.
- **The daily game is a placeholder tile.** It is not chosen
  ([08](08-daily-game.md)).
- **Marked as a mock-up.** A page says so, and it cannot be installed as the
  app (issue #8).
- **Follow [10](10-design.md)** for colour, type and the components.

## Open questions

- What each screen contains beyond Home. That is the designer's sketch step.
- The empty and error states: a wrong code, no open groups, nobody going.
- The screen where a person chooses how he is notified, since email, push and
  text each need consent ([02](02-architecture.md#notifications)).
- What a newcomer sees of the apartment, and how a life group leader picks the
  room for the second hour ([05](05-apartment-schedule.md)).
- Where the leadership path, capital of grace, prayer requests and the glossary
  go.
- Whether flows are wanted for the secretary's feed and for handing over a
  role, which the worksheet's top five do not cover.
