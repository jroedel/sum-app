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

// minutes turns "16:30" into minutes after midnight.
export function minutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// clashes says whether two bookings are in the same space on the same day at
// overlapping times. Touching ends do not clash: the dining room until 5:30
// and from 5:30 is the hand-over doc 05 describes, not a double booking.
export function clashes(a, b) {
  return (
    a.space === b.space &&
    a.day === b.day &&
    minutes(a.start) < minutes(b.end) &&
    minutes(b.start) < minutes(a.end)
  );
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
