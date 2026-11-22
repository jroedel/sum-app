// Flow 1, signing in for the first time, clicked through in a real Chrome:
// `make test-browser`.
//
// An address, then the code, then the profile the first time, then Home as a
// newcomer; and each message doc 03's limits can give: a typo in the
// address, a wrong code, five wrong tries, an expired code, too many codes.
// A known address skips the profile and lands as who he is.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";

import { setUp, visible } from "./browser_setup.mjs";

let t;

before(async () => {
  t = await setUp("sign-in");
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

async function start(page, url) {
  await page.goto(url("sign-in.html"));
  await page.evaluate(`localStorage.clear()`);
  await page.goto(url("sign-in.html"));
  await page.waitFor(visible("#step-email"));
}

async function enter(page, selector, value) {
  await page.evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
  await page.evaluate(`document.querySelector(${JSON.stringify(selector)}).value = ""`);
  await page.type(value);
}

check("a new man signs up: address, code, profile, Home as a newcomer", async ({ page, url }) => {
  await start(page, url);
  assert.equal(await page.evaluate(`!!document.querySelector(".tabbar")`), false, "no tabs before signing in");

  await enter(page, "#step-email [name=email]", "lucas");
  await page.tap("#step-email button[type=submit]");
  await page.waitFor(visible("#email-error"));
  assert.match(await page.evaluate(text("#email-error")), /like name@example\.com/);

  await enter(page, "#step-email [name=email]", "Lucas@Example.org");
  await page.tap("#step-email button[type=submit]");
  await page.waitFor(visible("#step-code"));
  assert.equal(await page.evaluate(text("#sent-to")), "lucas@example.org");

  await enter(page, "#step-code [name=code]", "111111");
  await page.tap("#sign-in");
  await page.waitFor(visible("#code-error"));
  assert.equal(await page.evaluate(text("#code-error")), "That code isn't right. 4 tries left.");

  await enter(page, "#step-code [name=code]", "246810");
  await page.tap("#sign-in");
  await page.waitFor(visible("#step-profile"));
  assert.equal(await page.evaluate(`document.querySelector("[name=school]").value`), "UT Austin");
  assert.equal(await page.evaluate(`document.querySelector("[name=texts]").checked`), false, "texts are asked, not assumed");

  await page.tap("#step-profile button[type=submit]");
  await page.waitFor(visible("#profile-error"));

  await enter(page, "#step-profile [name=first]", "Lucas");
  await page.tap("#step-profile button[type=submit]");
  await page.waitFor(`location.pathname.endsWith("/prototype/") && document.documentElement.dataset.role === "newcomer"`);
  await page.waitFor(visible("#find-group"));
});

check("a known address skips the profile", async ({ page, url }) => {
  await start(page, url);
  await enter(page, "#step-email [name=email]", "mateo@example.org");
  await page.tap("#step-email button[type=submit]");
  await page.waitFor(visible("#step-code"));
  await enter(page, "#step-code [name=code]", "246810");
  await page.tap("#sign-in");
  await page.waitFor(`location.pathname.endsWith("/prototype/") && document.documentElement.dataset.role === "member"`);
});

check("five wrong tries use the code up; a new code works", async ({ page, url }) => {
  await start(page, url);
  await enter(page, "#step-email [name=email]", "lucas@example.org");
  await page.tap("#step-email button[type=submit]");
  await page.waitFor(visible("#step-code"));

  for (let i = 0; i < 5; i++) {
    await enter(page, "#step-code [name=code]", "000000");
    await page.tap("#sign-in");
  }
  await page.waitFor(`(${text("#code-error")}).includes("stopped working after 5 tries")`);

  await enter(page, "#step-code [name=code]", "246810");
  await page.tap("#sign-in");
  await page.waitFor(`(${text("#code-error")}).includes("stopped working")`);

  await page.tap("#resend");
  await page.waitFor(visible("#resent"));
  await enter(page, "#step-code [name=code]", "246810");
  await page.tap("#sign-in");
  await page.waitFor(visible("#step-profile"));
});

check("an expired code needs a new one", async ({ page, url }) => {
  await start(page, url);
  await enter(page, "#step-email [name=email]", "lucas@example.org");
  await page.tap("#step-email button[type=submit]");
  await page.waitFor(visible("#step-code"));
  await page.tap("#expire");
  await enter(page, "#step-code [name=code]", "246810");
  await page.tap("#sign-in");
  await page.waitFor(`(${text("#code-error")}).includes("more than 10 minutes old")`);
});

check("too many codes for one address are refused, with what to do", async ({ page, url }) => {
  await start(page, url);
  await enter(page, "#step-email [name=email]", "lucas@example.org");
  await page.tap("#step-email button[type=submit]");
  await page.waitFor(visible("#step-code"));
  for (let i = 0; i < 3; i++) await page.tap("#resend");
  await page.tap("#resend");
  await page.waitFor(`(${text("#code-error")}).includes("Wait a little, then try again")`);
});

check("Sign out in More leads here", async ({ page, url }) => {
  await page.goto(url("more.html?as=member"));
  await page.tap("#sign-out");
  await page.waitFor(`location.pathname.endsWith("/sign-in.html")`);
  await page.waitFor(visible("#step-email"));
});
