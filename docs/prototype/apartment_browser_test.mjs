// Flow 5, a member puts himself on the apartment schedule, clicked through
// in a real Chrome: `make test-browser`.
//
// The week with the life group meetings already on it, each as its two
// halves; a booking over a meeting accepted, with who is told about it; the
// new booking on the schedule, marked as overlapping; and removing it.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";

import { setUp, visible } from "./browser_setup.mjs";

let t;

before(async () => {
  t = await setUp("apartment");
}, { timeout: 300_000 });

after(async () => {
  await t?.close();
});

const check = (name, fn) =>
  test(name, async (ctx) => {
    if (!t) return ctx.skip("no Chrome on this machine");
    return fn(t);
  });

const text = (selector) => `document.querySelector(${JSON.stringify(selector)})?.textContent ?? ""`;

check("the week has the meetings on it, in two halves", async ({ page, url }) => {
  await page.goto(url("apartment.html?as=member"));
  await page.evaluate(`localStorage.clear()`);
  await page.goto(url("apartment.html?as=member"));
  await page.waitFor(`document.querySelectorAll("#days section").length === 7`);

  assert.match(await page.evaluate(text("#b-emmaus-2026-11-24-1")), /7:00–8:00 PM[\s\S]*Emmaus life group[\s\S]*Dining and living area, first hour/);
  assert.match(await page.evaluate(text("#b-emmaus-2026-11-24-2")), /8:00–9:00 PM[\s\S]*Second room, second hour/);

  // Cana's second hour and Mateo's study time overlap, and both say so.
  assert.match(await page.evaluate(text("#b-cana-2026-11-25-2")), /Overlaps/);
  assert.match(await page.evaluate(text("#b-mateo-wed")), /Overlaps/);
  assert.doesNotMatch(await page.evaluate(text("#b-isaac-mon")), /Overlaps/);
});

check("a booking over a meeting is accepted, and says who is told", async ({ page, url }) => {
  await page.goto(url("apartment-add.html?as=member"));
  await page.waitFor(visible("#add"));

  // The dining room on Tuesday, 6:30 to 7:30: Emmaus's first hour from 7.
  await page.evaluate(`(() => {
    const f = document.getElementById("add");
    f.querySelector('[name=space][value=dining]').checked = true;
    f.querySelector('[name=kind][value=here]').checked = true;
    f.day.value = "2026-11-24";
    f.start.value = "18:30";
    f.end.value = "19:30";
  })()`);
  await page.tap('#add button[type="submit"]');

  await page.waitFor(visible("#added"));
  assert.ok(await page.evaluate(visible("#overlap")));
  const told = await page.evaluate(text("#told"));
  assert.match(told, /Emmaus meets there from 7:00–8:00 PM\. Its leader is told/);
  assert.match(told, /Mateo is there from 5:00–7:00 PM\. He is told himself/);

  // On the schedule, marked, and removable by him.
  await page.tap("#see");
  await page.waitFor(`location.pathname.endsWith("/apartment.html") && document.querySelectorAll("[id^=b-mine-]").length === 1`);
  const id = await page.evaluate(`document.querySelector("[id^=b-mine-]").id`);
  assert.match(await page.evaluate(text(`#${id}`)), /6:30–7:30 PM[\s\S]*Mateo[\s\S]*Overlaps/);
  assert.ok(await page.evaluate(visible(`#${id} [data-slot=remove]`)));

  await page.tap(`#${id} [data-slot=remove]`);
  await page.waitFor(`!document.getElementById(${JSON.stringify(id)})`);
});

check("an end before the start is caught, with what to do", async ({ page, url }) => {
  await page.goto(url("apartment-add.html?as=member"));
  await page.waitFor(visible("#add"));
  await page.evaluate(`(() => { const f = document.getElementById("add"); f.start.value = "18:00"; f.end.value = "17:00"; })()`);
  await page.tap('#add button[type="submit"]');
  await page.waitFor(visible("#error"));
  assert.equal(await page.evaluate(text("#error")), "Choose an end time after the start time.");
  assert.equal(await page.evaluate(visible("#added")), false);
});

check("Home's displacement notice leads to the booking, and goes when it is removed", async ({ page, url }) => {
  await page.goto(url("?as=member"));
  await page.evaluate(`localStorage.clear()`);
  await page.goto(url("?as=member"));
  await page.waitFor(visible("#displaced-home"));
  await page.tap("#displaced-home");
  await page.waitFor(`location.hash === "#b-mateo-wed" && !!document.getElementById("b-mateo-wed")`);

  await page.tap("#b-mateo-wed [data-slot=remove]");
  await page.waitFor(`!document.getElementById("b-mateo-wed")`);
  await page.goto(url("?as=member"));
  await page.waitFor(`document.documentElement.dataset.role === "member"`);
  assert.equal(await page.evaluate(`!!document.getElementById("displaced-home")`), false);
});

check("someone else's booking cannot be removed, nor a meeting", async ({ page, url }) => {
  await page.goto(url("apartment.html?as=secretary"));
  await page.waitFor(`document.querySelectorAll("#days section").length === 7`);
  assert.equal(await page.evaluate(visible("#b-isaac-mon [data-slot=remove]")), false);
  assert.equal(await page.evaluate(visible("#b-emmaus-2026-11-24-1 [data-slot=remove]")), false);
  assert.equal(await page.evaluate(visible("#b-daniel-sat [data-slot=remove]")), true, "the secretary's own");
});

check("a newcomer is told the apartment is for members", async ({ page, url }) => {
  await page.goto(url("apartment.html?as=newcomer"));
  await page.waitFor(`document.documentElement.dataset.role === "newcomer"`);
  assert.ok(await page.evaluate(visible("#members-only")));
  assert.equal(await page.evaluate(visible("#days")), false);
});
