// Flow 5, a member puts himself on the apartment schedule, clicked through
// in a real Chrome: `make test-browser`.
//
// Two weeks with the life group meetings already on them, each as its two
// halves; what each kind of booking claims (doc 05): studying and being there
// share, a meeting claims, a life group comes first; who is told what; and
// removing your own, or bumping someone else's as the secretary.
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

check("two weeks, with the meetings in two halves, and sharing never a double booking", async ({ page, url }) => {
  await page.goto(url("apartment.html?as=member"));
  await page.evaluate(`localStorage.clear()`);
  await page.goto(url("apartment.html?as=member"));
  await page.waitFor(`document.querySelectorAll("#days section").length === 14`);
  assert.ok(await page.evaluate(visible("#house-rules")), "the apartment order is linked at the top");

  assert.match(await page.evaluate(text("#b-emmaus-2026-11-24-1")), /7:00–8:00 PM[\s\S]*Emmaus life group[\s\S]*Dining and living area, first hour/);
  assert.match(await page.evaluate(text("#b-emmaus-2026-11-24-2")), /8:00–9:00 PM[\s\S]*Second room, second hour/);
  assert.ok(await page.evaluate(`!!document.getElementById("b-emmaus-2026-12-01-1")`), "and again in the second week");

  // Cana's second hour claims the study room over Mateo's study time.
  assert.match(await page.evaluate(text("#b-cana-2026-11-25-2")), /Overlaps/);
  assert.match(await page.evaluate(text("#b-mateo-wed")), /Overlaps/);

  // Simon there while Isaac studies is sharing.
  assert.doesNotMatch(await page.evaluate(text("#b-isaac-mon")), /Overlaps/);
  assert.doesNotMatch(await page.evaluate(text("#b-simon-mon")), /Overlaps/);
  assert.match(await page.evaluate(text("#b-thomas-fri")), /Fr\. Thomas[\s\S]*Meeting/);
});

async function add(page, url, { space, kind, day, start, end }) {
  await page.goto(url("apartment-add.html?as=member"));
  await page.waitFor(visible("#add"));
  await page.evaluate(`(() => {
    const f = document.getElementById("add");
    f.querySelector('[name=space][value=${space}]').checked = true;
    f.querySelector('[name=kind][value=${kind}]').checked = true;
    f.day.value = "${day}";
    f.start.value = "${start}";
    f.end.value = "${end}";
  })()`);
  await page.tap('#add button[type="submit"]');
  await page.waitFor(visible("#added"));
}

check("being there during a life group meeting is accepted, and gives way", async ({ page, url }) => {
  // The dining room on Tuesday, 6:30 to 7:30: Emmaus's first hour from 7.
  await add(page, url, { space: "dining", kind: "here", day: "2026-11-24", start: "18:30", end: "19:30" });
  assert.ok(await page.evaluate(visible("#overlap")));
  const told = await page.evaluate(text("#told"));
  assert.match(told, /Emmaus's meeting has the room from 7:00–8:00 PM, and comes first\. Its leader is told/);
  assert.doesNotMatch(told, /Mateo/, "Mateo's own time there is shared, not a clash");

  // On the schedule, marked, and removable by him.
  await page.tap("#see");
  await page.waitFor(`location.pathname.endsWith("/apartment.html") && document.querySelectorAll("[id^=b-mine-]").length === 1`);
  const id = await page.evaluate(`document.querySelector("[id^=b-mine-]").id`);
  assert.match(await page.evaluate(text(`#${id}`)), /6:30–7:30 PM[\s\S]*Mateo[\s\S]*Overlaps/);
  await page.tap(`#${id} [data-slot=remove]`);
  await page.waitFor(`!document.getElementById(${JSON.stringify(id)})`);
});

check("a meeting over someone studying displaces him, and he is told himself", async ({ page, url }) => {
  await add(page, url, { space: "study", kind: "meeting", day: "2026-11-23", start: "16:30", end: "17:30" });
  const told = await page.evaluate(text("#told"));
  assert.match(told, /Isaac is there from 3:00–6:00 PM, and your meeting comes first\. He is told himself\./);
  assert.match(told, /Simon is there from 4:00–5:00 PM/);
});

check("being there where someone studies only asks for quiet", async ({ page, url }) => {
  await add(page, url, { space: "study", kind: "here", day: "2026-12-02", start: "15:00", end: "16:00" });
  assert.equal(await page.evaluate(text("#overlap .sum-event-title")), "Someone is studying there");
  assert.match(await page.evaluate(text("#told")), /Jude is studying there from 2:00–5:00 PM\. Keep it quiet\./);
  assert.equal(await page.evaluate(visible("#overlap .sum-chip")), false, "nobody is told");
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

check("a member removes only his own; the secretary can bump others, never a life group", async ({ page, url }) => {
  await page.goto(url("apartment.html?as=member"));
  await page.waitFor(`document.querySelectorAll("#days section").length === 14`);
  assert.equal(await page.evaluate(visible("#b-isaac-mon [data-slot=remove]")), false);
  assert.equal(await page.evaluate(visible("#b-isaac-mon [data-slot=bump]")), false, "a member cannot bump");

  await page.goto(url("apartment.html?as=secretary"));
  await page.waitFor(`document.querySelectorAll("#days section").length === 14`);
  assert.equal(await page.evaluate(visible("#b-emmaus-2026-11-24-1 [data-slot=bump]")), false, "a life group is not bumped");
  assert.equal(await page.evaluate(visible("#b-daniel-sat [data-slot=remove]")), true, "the secretary's own");
  await page.tap("#b-isaac-mon [data-slot=bump]");
  await page.waitFor(`!document.getElementById("b-isaac-mon") && (document.querySelector(".toast")?.textContent ?? "").includes("Isaac is told")`);
});

check("a newcomer is told the apartment is for members", async ({ page, url }) => {
  await page.goto(url("apartment.html?as=newcomer"));
  await page.waitFor(`document.documentElement.dataset.role === "newcomer"`);
  assert.ok(await page.evaluate(visible("#members-only")));
  assert.equal(await page.evaluate(visible("#days")), false);
});
