// The mock-ups' rules, without the page: who is looking, what each of them is
// shown, where a link goes, and whether two bookings clash. Kept apart from
// the page so that Node can test it without a browser (model_test.mjs);
// app.js and the screens' own scripts are what touch the document.
//
// None of this is the app. It is the least the flows in
// docs/14-stories-flows-and-site-map.md need in order to be clicked through,
// and it goes when docs/prototype/ goes (README.md).

// ROLES are the five ways of looking at the mock-up that doc 14 asks for, in
// the order the role switcher lists them.
//
// The mentor is an alum who mentors a life group, the narrow alumni case doc
// 04 brings into the MVP. He is not a member, so he does not see the
// Apartment tab; that is the mock-up's guess, and README.md lists it.
export const ROLES = [
  { id: "newcomer", label: "Newcomer, no request", member: false },
  { id: "pending", label: "Newcomer with a request", member: false },
  { id: "member", label: "Member", member: true },
  { id: "mentor", label: "Mentor (an alum)", member: false },
  { id: "secretary", label: "Secretary", member: true },
];

// DEFAULT_ROLE is the one a first visit sees: a member's Home has the most on
// it, which is the best first look at the design.
export const DEFAULT_ROLE = "member";

const known = new Set(ROLES.map((r) => r.id));

// roleFrom chooses the role: the address's ?as= first, so that a link can be
// shared as "look at it as the secretary", then the one remembered from
// earlier, then the default. Anything unknown is ignored rather than trusted.
export function roleFrom(search, remembered) {
  const asked = new URLSearchParams(search).get("as");
  if (asked && known.has(asked)) {
    return asked;
  }

  if (remembered && known.has(remembered)) {
    return remembered;
  }

  return DEFAULT_ROLE;
}

// shownFor says whether an element marked data-for="..." is shown to role.
// The attribute is a space-separated list of roles; "all" or an empty list is
// everyone.
export function shownFor(dataFor, role) {
  const roles = (dataFor || "").split(/\s+/).filter(Boolean);
  return roles.length === 0 || roles.includes("all") || roles.includes(role);
}

// isMember says whether role sees what members see: the Apartment tab, the
// roster, contact details (doc 03, doc 04).
export function isMember(role) {
  return ROLES.some((r) => r.id === role && r.member);
}

// withRole adds ?as=role to a link to another mock-up page, so the role
// survives a click even where the browser keeps no storage (a private
// window). Links elsewhere, and in-page anchors, are left alone.
export function withRole(href, role) {
  if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//") || href.startsWith("#")) {
    return href;
  }

  const [beforeHash, hash] = splitOnce(href, "#");
  const [path, query] = splitOnce(beforeHash, "?");
  if (!path.endsWith(".html") && path !== "./" && path !== "") {
    return href;
  }

  const params = new URLSearchParams(query || "");
  params.set("as", role);
  return `${path}?${params}${hash === undefined ? "" : `#${hash}`}`;
}

function splitOnce(s, sep) {
  const i = s.indexOf(sep);
  return i < 0 ? [s, undefined] : [s.slice(0, i), s.slice(i + 1)];
}

// requestFor is Lucas's request to join, as the role being looked at has it.
//
// "Newcomer, no request" has none, whatever this browser remembers. Everyone
// else sees the one he made, or, before he has made one, the mock-up's own
// example: Lucas asked Emmaus on Saturday, so the mentor has a request to
// approve on a first visit. Choosing "Newcomer, no request" forgets his, which
// starts the flow over, and a tap on Request to join moves the role from one
// newcomer to the other.
export const EXAMPLE_REQUEST = { group: "emmaus", status: "pending", sent: "Saturday" };

// remembered is undefined when this browser has seen nothing yet, and null
// once a request was withdrawn or the flow started over.
export function requestFor(role, remembered) {
  if (role === "newcomer") return undefined;
  if (remembered) return remembered;
  if (role === "pending" || remembered === undefined) return EXAMPLE_REQUEST;
  return undefined;
}

// askToJoin is what tapping Request to join does to a request (doc 04): one
// at a time, so a request out to another group must be withdrawn first; there
// is no second request to the same group; and a man already approved into a
// group asks no other.
export function askToJoin(request, groupID) {
  if (!request) {
    return { ok: true, request: { group: groupID, status: "pending", sent: "just now" } };
  }

  if (request.status === "approved") {
    return { ok: false, reason: "in-group" };
  }

  return { ok: false, reason: request.group === groupID ? "already" : "withdraw-first" };
}

// years is a group's graduation years, earliest first, for the chips an open
// group shows at a glance (doc 04, "Composition is shown").
export function years(members) {
  return members.map((m) => m.year).sort((a, b) => a - b);
}

// minutes turns "16:30" into minutes after midnight.
export function minutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// overlaps says whether two bookings are in the same space on the same day at
// overlapping times. Touching ends do not overlap: the dining room until 5:30
// and from 5:30 is the hand-over doc 05 describes, not a double booking.
export function overlaps(a, b) {
  return (
    a.space === b.space &&
    a.day === b.day &&
    minutes(a.start) < minutes(b.end) &&
    minutes(b.start) < minutes(a.end)
  );
}

// RANK is what a booking claims (doc 05, decided 2026-11-22). Studying and
// being there claim nothing: they share the space, and studying only asks for
// quiet. A meeting claims it, and a life group's meeting comes first of all.
export const RANK = { here: 0, study: 0, meeting: 1, group: 2 };

const claims = (b) => RANK[b.kind] > 0;

// clashes says whether two overlapping bookings are a double booking: at
// least one of them claims the space. Two that only share it never clash.
export function clashes(a, b) {
  return overlaps(a, b) && (claims(a) || claims(b));
}

// outcome is what a new booking n means for an existing one e that it
// overlaps: n "displaces" e, n "is-displaced" by e, they are "level" (two
// meetings: settle it between them), or "quiet" (n shares a space where e is
// studying). Nothing is refused; this says who is told what. The core team's
// and the priests' power to bump a booking is a separate action, not a rank.
export function outcome(n, e) {
  if (!overlaps(n, e)) return null;
  if (!claims(n) && !claims(e)) return e.kind === "study" && n.kind === "here" ? "quiet" : null;
  if (RANK[n.kind] > RANK[e.kind]) return "displaces";
  if (RANK[n.kind] < RANK[e.kind]) return "is-displaced";
  return "level";
}

// clock turns "16:30" into "4:30 PM", and span gives "4:30–5:30 PM", or
// "11:00 AM–1:00 PM" across noon.
export function clock(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function span(start, end) {
  const a = clock(start);
  const b = clock(end);
  return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)}–${b}` : `${a}–${b}`;
}

// schedule is every booking in the days given: each life group meeting as its two
// halves (doc 05), then the members' own, in the order of the day.
export function schedule(meetings, days, bookings) {
  const out = [...bookings];
  for (const m of meetings) {
    for (const d of days.filter((d) => d.weekday === m.weekday)) {
      out.push({ id: `${m.group}-${d.iso}-1`, kind: "group", group: m.group, space: "dining", day: d.iso, start: m.start, end: m.middle });
      out.push({ id: `${m.group}-${d.iso}-2`, kind: "group", group: m.group, space: m.room, day: d.iso, start: m.middle, end: m.end });
    }
  }
  return out.sort((a, b) => a.day.localeCompare(b.day) || minutes(a.start) - minutes(b.start) || a.space.localeCompare(b.space));
}

// clashesWith is every other booking that b is double booked with. A double
// booking is allowed (doc 05): this is who to tell, not a reason to refuse.
export function clashesWith(b, all) {
  return all.filter((o) => o.id !== b.id && clashes(b, o));
}

// memory is localStorage when the browser allows it, and a plain map when it
// does not (a private window, blocked site data), so the mock-up still works
// for the length of a page and never throws.
export function memory(win) {
  const fallback = new Map();
  const prefix = "sum-mockup:";

  return {
    get(key) {
      try {
        const v = win.localStorage.getItem(prefix + key);
        return v === null ? undefined : JSON.parse(v);
      } catch {
        return fallback.get(key);
      }
    },
    set(key, value) {
      fallback.set(key, value);
      try {
        win.localStorage.setItem(prefix + key, JSON.stringify(value));
      } catch {
        // kept in the fallback only
      }
    },
    remove(key) {
      fallback.delete(key);
      try {
        win.localStorage.removeItem(prefix + key);
      } catch {
        // nothing to remove
      }
    },
  };
}

// --- signing in (doc 03, doc 14 flow 1) -------------------------------------
//
// The mock-up's stand-in for the server: one code that always works, so a
// designer can click through, and the limits doc 03 proposes, so each of its
// messages can be seen. Nothing leaves the browser and no email is sent.

export const MOCK_CODE = "246810";
export const MAX_TRIES = 5;

// MAX_SENDS is how many codes one address may ask for before being told to
// wait. Doc 03 says "a few times an hour"; four is the mock-up's guess, and
// the mock-up counts per visit rather than per hour.
export const MAX_SENDS = 4;

// KNOWN are the addresses that already have an account: they skip the
// profile and land on Home as who they are. Any other address signs up.
export const KNOWN = { "mateo@example.org": "member", "daniel@example.org": "secretary" };

// looksLikeEmail is the check a person gets before a code is sent: enough to
// catch a typo, not a validation of the address, which only the email does.
export function looksLikeEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}

// sendCode asks for a code for email. A new request replaces the one before
// it, with its tries and its ten minutes (doc 03), and counts toward the
// limit.
export function sendCode(state, email) {
  const address = email.trim().toLowerCase();
  const sends = state?.email === address ? state.sends : 0;
  if (sends >= MAX_SENDS) {
    return { ok: false, reason: "too-many", state };
  }
  return { ok: true, state: { email: address, sends: sends + 1, tries: 0, expired: false } };
}

// tryCode checks what was typed. "used-up" is the fifth wrong try and after;
// "expired" is a code older than ten minutes; both need a new code.
export function tryCode(state, typed) {
  const code = typed.replace(/\s/g, "");
  if (state.expired) return { result: "expired", state };
  if (state.tries >= MAX_TRIES) return { result: "used-up", state };
  if (!/^\d{6}$/.test(code)) return { result: "malformed", state };
  if (code === MOCK_CODE) return { result: "ok", state, account: KNOWN[state.email] };

  const next = { ...state, tries: state.tries + 1 };
  return { result: next.tries >= MAX_TRIES ? "used-up" : "wrong", state: next, left: MAX_TRIES - next.tries };
}

// --- dues (doc 06, doc 14 flow 3) --------------------------------------------

// firstDues is where the newcomer's first dues stand: "not-yet" until a
// mentor has approved him into a group (doc 06: group first, so that $60
// alone never buys the roster), then "due", then "paid".
export function firstDues(request, paid) {
  if (request?.status !== "approved") return "not-yet";
  return paid ? "paid" : "due";
}

// memberNow says whether the person looked at is a member: the member and the
// secretary always, and the newcomer once his first dues are paid, which is
// the step that makes him one (doc 03).
export function memberNow(role, request, firstPaid) {
  return isMember(role) || (role === "pending" && firstDues(request, firstPaid) === "paid");
}

// standing is a member's semester, as the app shows it: paid, settled by the
// secretary by hand (with his note), due, or overdue after week 6. Overdue is
// "out of good standing", which is shown and costs nothing (doc 06).
export function standing(entry, pastDue) {
  if (entry?.paid) return "paid";
  if (entry?.settled) return "settled";
  return pastDue ? "overdue" : "due";
}

// --- songs (doc 07) ------------------------------------------------------------

// fold makes text comparable for a search: lower case, without accents or
// punctuation, so "salve regina" finds "Salve, Regina" and "heaven" finds
// "Heav'n" only if typed as written.
export function fold(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

// findSongs is the list A to Z, narrowed by a search over titles and words
// (doc 07, decided 2026-11-22). A title that matches comes before a song that
// only has the words somewhere in it; each hit says which it was.
export function findSongs(songs, query) {
  const az = [...songs].sort((a, b) => a.title.localeCompare(b.title));
  const q = fold(query ?? "");
  if (!q) return az.map((s) => ({ song: s, in: "all" }));

  const inTitle = az.filter((s) => fold(s.title).includes(q)).map((s) => ({ song: s, in: "title" }));
  const inWords = az
    .filter((s) => !fold(s.title).includes(q))
    .map((s) => ({ song: s, line: s.verses.flat().find((l) => fold(l).includes(q)) }))
    .filter((h) => h.line)
    .map((h) => ({ ...h, in: "words" }));
  return [...inTitle, ...inWords];
}
