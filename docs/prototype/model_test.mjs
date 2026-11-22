// The mock-ups' rules, in Node: `make test-js`.
import { test } from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_ROLE, MAX_SENDS, MOCK_CODE, ROLES, askToJoin, clashes, clashesWith, clock, isMember, looksLikeEmail, memory, requestFor, roleFrom, schedule, sendCode, shownFor, span, tryCode, withRole, years } from "./model.js";

test("the role comes from ?as=, then memory, then the default", () => {
  assert.equal(roleFrom("?as=secretary", "mentor"), "secretary");
  assert.equal(roleFrom("", "mentor"), "mentor");
  assert.equal(roleFrom("", undefined), DEFAULT_ROLE);
  assert.equal(roleFrom("?as=admin", "nobody"), DEFAULT_ROLE, "an unknown role is ignored, not trusted");
  assert.equal(roleFrom("?g=emmaus&as=pending", undefined), "pending");
});

test("the five roles doc 14 asks for", () => {
  assert.deepEqual(
    ROLES.map((r) => r.id),
    ["newcomer", "pending", "member", "mentor", "secretary"],
  );
});

test("data-for lists who sees an element", () => {
  assert.ok(shownFor("member secretary", "member"));
  assert.ok(!shownFor("member secretary", "newcomer"));
  assert.ok(shownFor("", "newcomer"), "no list is everyone");
  assert.ok(shownFor("all", "mentor"));
  assert.ok(!shownFor("newcomer-ish", "newcomer"), "a role is matched whole");
});

test("members see what members see; a newcomer and an alum mentor do not", () => {
  assert.ok(isMember("member"));
  assert.ok(isMember("secretary"));
  assert.ok(!isMember("newcomer"));
  assert.ok(!isMember("pending"));
  assert.ok(!isMember("mentor"));
});

test("a link to another mock-up page carries the role", () => {
  assert.equal(withRole("groups.html", "mentor"), "groups.html?as=mentor");
  assert.equal(withRole("./", "member"), "./?as=member");
  assert.equal(withRole("group.html?g=emmaus", "pending"), "group.html?g=emmaus&as=pending");
  assert.equal(withRole("group.html?as=member#members", "secretary"), "group.html?as=secretary#members");
});

test("a link elsewhere is left alone", () => {
  for (const href of ["https://sumatx.us/", "mailto:x@example.org", "#top", "//example.org/a.html", "icons.svg#house", "tokens.css"]) {
    assert.equal(withRole(href, "member"), href);
  }
});

test("bookings clash in the same space, on the same day, at overlapping times", () => {
  const meeting = { space: "dining", day: "2026-11-24", start: "16:30", end: "17:30" };

  assert.ok(clashes(meeting, { space: "dining", day: "2026-11-24", start: "17:00", end: "18:00" }));
  assert.ok(clashes(meeting, { space: "dining", day: "2026-11-24", start: "15:00", end: "21:00" }), "one inside the other");
  assert.ok(!clashes(meeting, { space: "dining", day: "2026-11-24", start: "17:30", end: "18:30" }), "touching ends are a hand-over");
  assert.ok(!clashes(meeting, { space: "study", day: "2026-11-24", start: "16:30", end: "17:30" }), "another space");
  assert.ok(!clashes(meeting, { space: "dining", day: "2026-11-25", start: "16:30", end: "17:30" }), "another day");
});

test("memory works without localStorage, and never throws", () => {
  const blocked = {
    get localStorage() {
      throw new Error("blocked");
    },
  };
  const m = memory(blocked);
  m.set("role", "mentor");
  assert.equal(m.get("role"), "mentor");
  m.remove("role");
  assert.equal(m.get("role"), undefined);
});

test("memory keeps values in localStorage as JSON", () => {
  const store = new Map();
  const win = {
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, v),
      removeItem: (k) => store.delete(k),
    },
  };
  memory(win).set("request", { group: "emmaus", status: "pending" });
  assert.deepEqual(memory(win).get("request"), { group: "emmaus", status: "pending" });
});

test("the request follows the role", () => {
  const made = { group: "cana", status: "pending", sent: "just now" };
  assert.equal(requestFor("newcomer", made), undefined, "no request, whatever is remembered");
  assert.deepEqual(requestFor("pending", made), made);
  assert.equal(requestFor("pending", undefined).group, "emmaus", "the mock-up's own example");
  assert.deepEqual(requestFor("mentor", made), made);
  assert.equal(requestFor("mentor", undefined).group, "emmaus", "a first visit has the example to approve");
  assert.equal(requestFor("mentor", null), undefined, "withdrawn is remembered as none");
  assert.equal(requestFor("pending", null).group, "emmaus", "the pending newcomer always has one");
});

test("one request at a time (doc 04)", () => {
  const first = askToJoin(undefined, "cana");
  assert.ok(first.ok);
  assert.deepEqual([first.request.group, first.request.status], ["cana", "pending"]);

  assert.deepEqual(askToJoin(first.request, "emmaus"), { ok: false, reason: "withdraw-first" });
  assert.deepEqual(askToJoin(first.request, "cana"), { ok: false, reason: "already" });
  assert.deepEqual(askToJoin({ group: "cana", status: "approved" }, "emmaus"), { ok: false, reason: "in-group" });
});

test("a group's years, earliest first", () => {
  assert.deepEqual(years([{ year: 2029 }, { year: 2027 }, { year: 2028 }]), [2027, 2028, 2029]);
});

test("times read as a phone shows them", () => {
  assert.equal(clock("16:30"), "4:30 PM");
  assert.equal(clock("00:15"), "12:15 AM");
  assert.equal(clock("12:00"), "12:00 PM");
  assert.equal(span("16:30", "17:30"), "4:30–5:30 PM");
  assert.equal(span("11:00", "13:00"), "11:00 AM–1:00 PM");
});

test("a meeting is two halves: the dining room, then a room", () => {
  const days = [{ iso: "2026-11-24", weekday: 2 }, { iso: "2026-11-25", weekday: 3 }];
  const all = schedule([{ group: "emmaus", weekday: 2, start: "19:00", middle: "20:00", end: "21:00", room: "second" }], days, []);
  assert.deepEqual(
    all.map((b) => [b.space, b.day, b.start, b.end]),
    [
      ["dining", "2026-11-24", "19:00", "20:00"],
      ["second", "2026-11-24", "20:00", "21:00"],
    ],
  );
});

test("a booking lists what it overlaps, never itself", () => {
  const a = { id: "a", space: "study", day: "d", start: "15:00", end: "18:00" };
  const b = { id: "b", space: "study", day: "d", start: "17:00", end: "19:00" };
  const c = { id: "c", space: "study", day: "d", start: "18:00", end: "20:00" };
  assert.deepEqual(clashesWith(a, [a, b, c]).map((x) => x.id), ["b"]);
  assert.deepEqual(clashesWith(b, [a, b, c]).map((x) => x.id), ["a", "c"]);
});

test("an address is checked for a typo before a code is sent", () => {
  assert.ok(looksLikeEmail("lucas@example.org"));
  assert.ok(looksLikeEmail("  lucas@example.org "));
  for (const bad of ["", "lucas", "lucas@", "lucas@example", "lu cas@example.org"]) {
    assert.ok(!looksLikeEmail(bad), bad);
  }
});

test("asking again replaces the code, and too many asks are refused", () => {
  let s;
  for (let i = 1; i <= MAX_SENDS; i++) {
    const r = sendCode(s, "Lucas@Example.org");
    assert.ok(r.ok, `ask ${i}`);
    s = r.state;
  }
  assert.equal(s.email, "lucas@example.org");
  assert.deepEqual(sendCode(s, "lucas@example.org").reason, "too-many");
  assert.ok(sendCode(s, "other@example.org").ok, "another address has its own count");
});

test("a code: wrong, then used up after five; right signs in", () => {
  let s = sendCode(undefined, "lucas@example.org").state;
  let r = tryCode(s, "111111");
  assert.deepEqual([r.result, r.left], ["wrong", 4]);
  for (let i = 0; i < 3; i++) r = tryCode(r.state, "111111");
  assert.deepEqual([r.result, r.left], ["wrong", 1]);
  r = tryCode(r.state, "111111");
  assert.equal(r.result, "used-up");
  assert.equal(tryCode(r.state, MOCK_CODE).result, "used-up", "even the right code, once used up");

  s = sendCode(r.state, "lucas@example.org").state;
  r = tryCode(s, "246 810");
  assert.equal(r.result, "ok");
  assert.equal(r.account, undefined, "a new address signs up");
  assert.equal(tryCode(sendCode(undefined, "mateo@example.org").state, MOCK_CODE).account, "member");
});

test("a code that is not six digits is not a try; an expired one needs a new code", () => {
  const s = sendCode(undefined, "lucas@example.org").state;
  const r = tryCode(s, "12345");
  assert.equal(r.result, "malformed");
  assert.equal(r.state.tries, 0);
  assert.equal(tryCode({ ...s, expired: true }, MOCK_CODE).result, "expired");
});
