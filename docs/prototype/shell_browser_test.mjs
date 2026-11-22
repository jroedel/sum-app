// The mock-ups' frame in a real Chrome against the real server, under its
// real header policy: `make test-browser`.
//
// What only a browser can say: the scripts run at all under
// Content-Security-Policy (a blocked script leaves a page that looks fine
// and does nothing), the banner stays on screen, the role switcher changes
// the menu, the role survives a click without storage, and every request
// stays on this origin, the fonts especially (docs/10-design.md, "Type").
import { after, before, test } from "node:test";
import assert from "node:assert/strict";

import { setUp, visible } from "./browser_setup.mjs";

let t;

before(async () => {
  t = await setUp("shell");
}, { timeout: 300_000 });

after(async () => {
  await t?.close();
});

// check is a test that is skipped, and says so, when setUp found no Chrome.
// The decision is made when the test runs, after before() has.
const check = (name, fn) =>
  test(name, async (ctx) => {
    if (!t) return ctx.skip("no Chrome on this machine");
    return fn(t);
  });

check("the banner is on screen, and the page is not the app", async ({ page, url }) => {
  await page.goto(url(""));

  assert.ok(await page.evaluate(visible(".mockup-banner")));
  assert.match(await page.evaluate(`document.querySelector(".mockup-banner").textContent`), /not the real SUM app/);

  // Scrolled to the foot of the page, the banner is still there.
  await page.evaluate(`window.scrollTo(0, document.body.scrollHeight)`);
  const top = await page.evaluate(`document.querySelector(".mockup-banner").getBoundingClientRect().top`);
  assert.ok(top <= 0.5, `the banner scrolled away (top ${top})`);
});

check("a newcomer has no Apartment tab; a member does", async ({ page, url }) => {

  await page.goto(url("?as=newcomer"));
  await page.waitFor(`document.documentElement.dataset.role === "newcomer"`);
  assert.equal(await page.evaluate(visible(`.sum-tab[href^="apartment.html"]`)), false);

  await page.goto(url("?as=member"));
  await page.waitFor(`document.documentElement.dataset.role === "member"`);
  assert.equal(await page.evaluate(visible(`.sum-tab[href^="apartment.html"]`)), true);
});

check("the switcher changes the role, and a click keeps it", async ({ page, url }) => {

  await page.goto(url("?as=member"));
  await page.evaluate(`(() => { const s = document.getElementById("as"); s.value = "mentor"; s.dispatchEvent(new Event("change")); })()`);
  await page.waitFor(`document.documentElement.dataset.role === "mentor" && location.search.includes("as=mentor")`);

  // With storage cleared, the role still travels in the link.
  await page.evaluate(`localStorage.clear()`);
  await page.evaluate(`document.querySelector('.sum-tab[href^="groups.html"]').click()`);
  await page.waitFor(`location.pathname.endsWith("/groups.html")`);
  await page.waitFor(`document.documentElement.dataset.role === "mentor"`);
  assert.equal(await page.evaluate(`document.getElementById("as").value`), "mentor");
});

check("every page loads only from this server, with no error", async ({ page, url }) => {

  for (const p of ["", "groups.html", "apartment.html", "game.html", "more.html", "sign-in.html"]) {
    page.requests.length = 0;
    page.errors.length = 0;
    await page.goto(url(p));
    await page.waitFor(`document.fonts.status === "loaded"`);

    const origin = new URL(url("")).origin;
    const elsewhere = page.requests.filter((r) => !r.startsWith(origin) && !r.startsWith("data:"));
    assert.deepEqual(elsewhere, [], `${p || "Home"} asked another origin`);
    assert.deepEqual(page.errors, [], `${p || "Home"} had errors (a blocked script or font shows here)`);

    assert.ok(
      await page.evaluate(`document.fonts.check('700 28px Alegreya') && document.fonts.check('17px "Alegreya Sans"')`),
      `${p || "Home"}: the brand's fonts did not load`,
    );
  }
});

check("the icons draw", async ({ page, url }) => {
  await page.goto(url(""));

  // A <use> whose sprite was blocked or missing draws nothing: no box.
  const width = await page.evaluate(`document.querySelector(".sum-tab use").getBBox().width`);
  assert.ok(width > 0, "the tab bar's icons did not draw");
});
