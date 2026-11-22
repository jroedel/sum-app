// Flow 2, a newcomer requests to join a life group, clicked through in a
// real Chrome: `make test-browser`.
//
// The whole of doc 14's flow: the open groups with their years; a group's
// members; Request to join, and Home showing Pending; one request at a time;
// a mentor approving; and Home showing the group.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";

import { setUp, visible } from "./browser_setup.mjs";

let t;

before(async () => {
  t = await setUp("request");
}, { timeout: 300_000 });

after(async () => {
  await t?.close();
});

const check = (name, fn) =>
  test(name, async (ctx) => {
    if (!t) return ctx.skip("no Chrome on this machine");
    return fn(t);
  });

const roleIs = (role) => `document.documentElement.dataset.role === ${JSON.stringify(role)}`;

check("the open groups show their members' years, and no closed group", async ({ page, url }) => {
  await page.goto(url("groups.html?as=newcomer"));
  await page.waitFor(`document.querySelectorAll(".group-card").length === 3`);

  const names = await page.evaluate(`[...document.querySelectorAll(".group-card [data-slot=name]")].map((e) => e.textContent)`);
  assert.deepEqual(names, ["Emmaus", "Cana", "Nazareth"]);

  const cana = await page.evaluate(`[...document.querySelectorAll(".group-card")][1].querySelector("[data-slot=years]").textContent`);
  assert.equal(cana, "20272027202720272028");
});

check("a newcomer asks, waits, is asked to withdraw before asking another, and is approved", async ({ page, url }) => {
  // Start over: the newcomer with no request.
  await page.goto(url("?as=newcomer"));
  await page.waitFor(roleIs("newcomer"));
  await page.evaluate(`localStorage.clear()`);
  await page.goto(url("?as=newcomer"));
  await page.waitFor(roleIs("newcomer"));

  // He opens Cana and asks to join.
  await page.goto(url("group.html?g=cana"));
  await page.waitFor(`document.querySelector("#group [data-slot=name]").textContent === "Cana"`);
  assert.equal(await page.evaluate(`document.querySelectorAll("#group .row-link").length`), 5, "Cana's five members");
  await page.tap("#request");

  // Home shows Pending, for Cana.
  await page.waitFor(`location.pathname.endsWith("/prototype/") && ${roleIs("pending")}`);
  await page.waitFor(visible("#request-pending"));
  assert.equal(await page.evaluate(`document.querySelector("#request-pending [data-fill=group-name]").textContent`), "Cana");

  // Asking Emmaus too is refused until he withdraws.
  await page.goto(url("group.html?g=emmaus"));
  await page.waitFor(`document.querySelector("#group [data-slot=name]").textContent === "Emmaus"`);
  await page.tap("#request");
  await page.waitFor(visible("#withdraw-first"));
  await page.tap("#withdraw-first [data-withdraw]");
  await page.waitFor(`location.search.includes("g=emmaus") && ${roleIs("newcomer")}`);
  await page.waitFor(visible("#request"));
  await page.tap("#request");
  await page.waitFor(`location.pathname.endsWith("/prototype/") && ${roleIs("pending")}`);
  assert.equal(await page.evaluate(`document.querySelector("#request-pending [data-fill=group-name]").textContent`), "Emmaus");

  // Andrew, who mentors Emmaus, approves him.
  await page.goto(url("requests.html?as=mentor"));
  await page.waitFor(visible("#request-lucas"));
  assert.match(await page.evaluate(`document.querySelector("#request-lucas [data-slot=title]").textContent`), /Lucas wants to join Emmaus/);
  await page.tap("#request-lucas [data-slot=approve]");
  await page.waitFor(visible("#request-lucas [data-slot=approved]"));

  // Lucas's Home shows his group and its meeting time.
  await page.goto(url("?as=pending"));
  await page.waitFor(visible("#request-approved"));
  assert.equal(await page.evaluate(visible("#request-pending")), false);
  assert.match(await page.evaluate(`document.querySelector("#request-approved").textContent`), /Emmaus[\s\S]*Tue · 7:00–9:00 PM/);
});

check("Withdraw on Home takes the request back", async ({ page, url }) => {
  await page.goto(url("?as=pending"));
  await page.evaluate(`localStorage.clear()`);
  await page.goto(url("?as=pending"));
  await page.waitFor(visible("#request-pending"));
  await page.tap("#withdraw");
  await page.waitFor(`${roleIs("newcomer")}`);
  await page.waitFor(visible("#find-group"));
});

check("a mentor sees only his groups' requests; the secretary sees them all", async ({ page, url }) => {
  await page.goto(url("?as=newcomer"));
  await page.evaluate(`localStorage.clear()`);
  await page.goto(url("?as=newcomer"));
  await page.waitFor(roleIs("newcomer"));
  await page.goto(url("group.html?g=nazareth"));
  await page.waitFor(visible("#request"));
  await page.tap("#request");
  await page.waitFor(roleIs("pending"));

  await page.goto(url("requests.html?as=mentor"));
  await page.waitFor(`document.querySelectorAll(".request").length > 0`);
  assert.equal(await page.evaluate(`!!document.getElementById("request-lucas")`), false, "Nazareth is not Andrew's");
  assert.equal(await page.evaluate(`!!document.getElementById("request-noah")`), true);

  await page.goto(url("requests.html?as=secretary"));
  await page.waitFor(`document.querySelectorAll(".request").length === 3`);
  assert.ok(await page.evaluate(visible("#request-caleb [data-slot=late]")), "Caleb's unanswered request is marked");
});

check("the flow's pages run without errors", async ({ page, url }) => {
  for (const p of ["groups.html?as=member", "group.html?g=tabor&as=member", "group.html?g=nope", "requests.html?as=secretary"]) {
    page.errors.length = 0;
    await page.goto(url(p));
    await page.waitFor(`document.readyState === "complete"`);
    await new Promise((d) => setTimeout(d, 100));
    assert.deepEqual(page.errors, [], p);
  }
});
