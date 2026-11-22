// Home, as each of the five people sees it: `make test-browser`.
//
// Home is the screen that knows who is looking (doc 07), so the thing to
// hold is that each role sees its own "Waiting on you" and nobody else's,
// and that a section with nothing in it for him is not shown (doc 10).
import { after, before, test } from "node:test";
import assert from "node:assert/strict";

import { setUp, visible } from "./browser_setup.mjs";

let t;

before(async () => {
  t = await setUp("home");
}, { timeout: 300_000 });

after(async () => {
  await t?.close();
});

const check = (name, fn) =>
  test(name, async (ctx) => {
    if (!t) return ctx.skip("no Chrome on this machine");
    return fn(t);
  });

const waiting = {
  newcomer: "#find-group",
  pending: "#request-pending",
  member: "#dues-due",
  mentor: "#mentor-requests",
  secretary: "#secretary-feed",
};

check("each role sees its own Waiting on you, and nobody else's", async ({ page, url }) => {
  for (const role of Object.keys(waiting)) {
    await page.goto(url(`?as=${role}`));
    await page.waitFor(`document.documentElement.dataset.role === ${JSON.stringify(role)}`);

    for (const [other, selector] of Object.entries(waiting)) {
      assert.equal(await page.evaluate(visible(selector)), other === role, `as ${role}, ${selector} (${other}'s)`);
    }
  }
});

check("a newcomer sees no group and no milestones; a member sees both", async ({ page, url }) => {
  await page.goto(url("?as=newcomer"));
  await page.waitFor(`document.documentElement.dataset.role === "newcomer"`);
  assert.equal(await page.evaluate(visible("#your-group")), false);
  assert.equal(await page.evaluate(visible("#milestones")), false);

  await page.goto(url("?as=member"));
  await page.waitFor(`document.documentElement.dataset.role === "member"`);
  assert.equal(await page.evaluate(visible("#your-group")), true);
  assert.equal(await page.evaluate(visible("#milestones")), true);
});

check("one accent action per screen", async ({ page, url }) => {
  for (const role of Object.keys(waiting)) {
    await page.goto(url(`?as=${role}`));
    await page.waitFor(`document.documentElement.dataset.role === ${JSON.stringify(role)}`);
    const accents = await page.evaluate(`[...document.querySelectorAll(".sum-btn--accent")].filter((e) => e.checkVisibility()).length`);
    assert.equal(accents, 1, `as ${role}`);
  }
});

check("what the mock-up does not draw says so when tapped", async ({ page, url }) => {
  await page.goto(url("?as=member"));
  await page.tap(".sum-feature .sum-btn--accent");
  await page.waitFor(`document.querySelector(".toast")?.textContent.includes("Not in this mock-up")`);
  assert.ok(new URL(await page.evaluate("location.href")).pathname.endsWith("/prototype/"), "the tap navigated away");
});

check("the newcomer's way in goes to the open groups", async ({ page, url }) => {
  await page.goto(url("?as=newcomer"));
  await page.tap("#find-group a");
  await page.waitFor(`location.pathname.endsWith("/groups.html") && document.documentElement.dataset.role === "newcomer"`);
});
