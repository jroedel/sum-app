// Flow 3, dues, clicked through in a real Chrome: `make test-browser`.
//
// The newcomer's first dues, which wait for a mentor's approval and make him
// a member (doc 03, doc 06); a member's overdue semester, shown as out of
// good standing and paid; and the secretary's screen: a payment matched, a
// sweatshirt handed over, a semester settled by hand. And the contacts that
// membership, or mentoring a group, opens (doc 04).
import { after, before, test } from "node:test";
import assert from "node:assert/strict";

import { setUp, visible } from "./browser_setup.mjs";

let t;

before(async () => {
  t = await setUp("dues");
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
const roleIs = (role) => `document.documentElement.dataset.role === ${JSON.stringify(role)}`;

async function fresh(page, url, path) {
  await page.goto(url(path));
  await page.evaluate(`localStorage.clear()`);
  await page.goto(url(path));
}

check("a newcomer cannot pay before a mentor approves him", async ({ page, url }) => {
  await fresh(page, url, "dues.html?as=pending");
  await page.waitFor(roleIs("pending"));
  assert.ok(await page.evaluate(visible("#first-not-yet")));
  assert.equal(await page.evaluate(visible("#first-due")), false);
});

check("approved, he pays his first dues and is a member", async ({ page, url }) => {
  await fresh(page, url, "?as=pending");
  await page.goto(url("requests.html?as=mentor"));
  await page.waitFor(visible("#request-lucas"));
  await page.tap("#request-lucas [data-slot=approve]");
  await page.waitFor(visible("#request-lucas [data-slot=approved]"));

  // Home asks for his first dues; no Apartment tab yet, no contacts.
  await page.goto(url("?as=pending"));
  await page.waitFor(visible("#first-dues-home"));
  assert.equal(await page.evaluate(visible(`.sum-tab[href^="apartment.html"]`)), false);
  await page.goto(url("group.html?g=emmaus&as=pending"));
  await page.waitFor(`document.querySelectorAll("#group .row-link").length > 0`);
  assert.equal(await page.evaluate(`document.querySelectorAll("#group .contact").length`), 0, "no contacts before he is a member");

  await page.goto(url("?as=pending"));
  await page.waitFor(visible("#first-dues-home"));
  await page.tap("#first-dues-home a");
  await page.waitFor(visible("#first-due"));
  await page.tap("#first-due .sum-btn--accent");
  await page.waitFor(`location.pathname.endsWith("/pay.html")`);
  await page.waitFor(`(${text('[data-slot="payer"]')}) === "Lucas"`);
  await page.tap(".apple-pay");

  await page.waitFor(`location.pathname.endsWith("/dues.html") && ${roleIs("pending")}`);
  await page.waitFor(visible("#first-paid"));

  // A member now: the Apartment tab, Home's welcome, and his group's contacts.
  await page.goto(url("?as=pending"));
  await page.waitFor(visible("#member-now-home"));
  assert.ok(await page.evaluate(visible(`.sum-tab[href^="apartment.html"]`)));
  await page.goto(url("group.html?g=emmaus&as=pending"));
  await page.waitFor(`document.querySelectorAll("#group .contact").length === 4`);

  // The secretary sees his first dues and the sweatshirt he is owed.
  await page.goto(url("dues-all.html?as=secretary"));
  await page.waitFor(visible("#sweatshirt-lucas"));
  assert.match(await page.evaluate(text("#person-lucas")), /first dues/);
});

check("a member out of good standing is told so, and nothing else changes; then he pays", async ({ page, url }) => {
  await fresh(page, url, "dues.html?as=member");
  await page.waitFor(visible("#this-semester"));
  assert.match(await page.evaluate(text("#this-semester")), /Overdue[\s\S]*out of good standing\. Nothing changes for you/);
  assert.ok(await page.evaluate(visible(`.sum-tab[href^="apartment.html"]`)), "the apartment stays open");

  await page.tap("#pay-own a");
  await page.waitFor(`location.pathname.endsWith("/pay.html")`);
  await page.waitFor(`(${text('[data-slot="payer"]')}) === "Mateo"`);
  await page.tap("[data-pay]:not(.apple-pay)");
  await page.waitFor(`location.pathname.endsWith("/dues.html")`);
  await page.waitFor(`(${text("#this-semester")}).includes("good standing") && (${text("#this-semester")}).includes("Paid")`);
  assert.equal(await page.evaluate(visible("#pay-own")), false);

  await page.goto(url("?as=member"));
  await page.waitFor(roleIs("member"));
  assert.equal(await page.evaluate(`!!document.getElementById("dues-due")`), false, "Home no longer asks");
});

check("the secretary matches a payment, hands over a sweatshirt, and settles a semester", async ({ page, url }) => {
  await fresh(page, url, "dues-all.html?as=secretary");
  await page.waitFor(visible("#unmatched"));
  assert.match(await page.evaluate(text("#summary")), /out of good standing/);

  await page.evaluate(`document.getElementById("match-who").value = "simon"`);
  await page.tap("#match");
  await page.waitFor(visible("#matched"));
  assert.match(await page.evaluate(text("#person-simon")), /Paid/);

  await page.tap("#sweatshirt-owen [data-slot=action]");
  await page.waitFor(`(${text("#sweatshirt-owen")}).includes("Given")`);

  await page.tap("#person-miles [data-slot=action]");
  await page.waitFor(visible("#person-miles [data-slot=settle]"));
  await page.evaluate(`document.querySelector("#person-miles [name=note]").value = "Paid cash"`);
  await page.tap("#person-miles [data-slot=settle] button");
  await page.waitFor(`(${text("#person-miles")}).includes("Settled") && (${text("#person-miles")}).includes("Paid cash")`);
});

check("a mentor sees contacts in the groups he mentors only; a newcomer never", async ({ page, url }) => {
  await page.goto(url("group.html?g=emmaus&as=mentor"));
  await page.waitFor(`document.querySelectorAll("#group .contact").length === 4`);
  assert.match(await page.evaluate(text("#group .contact")), /@example\.org · \(512\) 555-01\d\d/);

  await page.goto(url("group.html?g=cana&as=mentor"));
  await page.waitFor(`document.querySelectorAll("#group .row-link").length === 5`);
  assert.equal(await page.evaluate(`document.querySelectorAll("#group .contact").length`), 0);

  await page.goto(url("group.html?g=cana&as=newcomer"));
  await page.waitFor(`document.querySelectorAll("#group .row-link").length === 5`);
  assert.equal(await page.evaluate(`document.querySelectorAll("#group .contact").length`), 0);
});

check("the dues screens run without errors, for everyone", async ({ page, url }) => {
  for (const p of ["dues.html?as=newcomer", "dues.html?as=mentor", "dues.html?as=secretary", "dues-all.html?as=member", "pay.html?as=member"]) {
    page.errors.length = 0;
    await page.goto(url(p));
    await page.waitFor(`document.readyState === "complete"`);
    await new Promise((d) => setTimeout(d, 100));
    assert.deepEqual(page.errors, [], p);
  }
});
