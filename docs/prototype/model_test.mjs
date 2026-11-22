// The mock-ups' rules, in Node: `make test-js`.
import { test } from "node:test";
import assert from "node:assert/strict";

import { DEFAULT_ROLE, ROLES, clashes, isMember, memory, roleFrom, shownFor, withRole } from "./model.js";

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
