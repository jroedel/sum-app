// Flow 4, a member opens a song, clicked through in a real Chrome:
// `make test-browser`.
//
// More → Songs, the list A to Z, a search that narrows it by title and then
// by words, a song's words, and a larger text size that is remembered.
import { after, before, test } from "node:test";
import assert from "node:assert/strict";

import { setUp, visible } from "./browser_setup.mjs";

let t;

before(async () => {
  t = await setUp("songs");
}, { timeout: 300_000 });

after(async () => {
  await t?.close();
});

const check = (name, fn) =>
  test(name, async (ctx) => {
    if (!t) return ctx.skip("no Chrome on this machine");
    return fn(t);
  });

const titles = `[...document.querySelectorAll("#songs [data-slot=title]")].map((e) => e.textContent)`;

check("More leads to the songs, A to Z", async ({ page, url }) => {
  await page.goto(url("more.html?as=newcomer"));
  await page.tap("#songs-row");
  await page.waitFor(`location.pathname.endsWith("/songs.html") && document.querySelectorAll("#songs .row-link").length === 4`);
  assert.deepEqual(await page.evaluate(titles), ["Amazing Grace", "Hail, Holy Queen Enthroned Above", "Holy God, We Praise Thy Name", "Salve Regina"]);
});

check("a search narrows by title first, then by words, with the line it found", async ({ page, url }) => {
  await page.goto(url("songs.html?as=member"));
  await page.waitFor(visible("#q"));
  await page.evaluate(`document.getElementById("q").focus()`);
  await page.type("salve regina");
  await page.waitFor(`document.querySelectorAll("#songs .row-link").length === 2`);
  assert.deepEqual(await page.evaluate(titles), ["Salve Regina", "Hail, Holy Queen Enthroned Above"]);
  assert.match(await page.evaluate(`document.querySelector("#song-hail-holy-queen [data-slot=meta]").textContent`), /Salve, salve, salve, Regina!/);

  await page.evaluate(`(() => { const q = document.getElementById("q"); q.value = "zzz"; q.dispatchEvent(new Event("input")); })()`);
  await page.waitFor(visible("#no-songs"));
});

check("a song opens with its words, and a larger size stays", async ({ page, url }) => {
  await page.goto(url("songs.html?as=member"));
  await page.waitFor(visible("#song-amazing-grace"));
  await page.tap("#song-amazing-grace");
  await page.waitFor(`location.search.includes("s=amazing-grace") && !document.getElementById("song").hidden`);
  assert.match(await page.evaluate(`document.querySelector(".verses").textContent`), /Amazing grace! how sweet the sound/);
  assert.equal(await page.evaluate(`document.querySelectorAll(".verse").length`), 2);

  await page.tap(".large-a");
  await page.waitFor(`getComputedStyle(document.querySelector(".verse")).fontSize === "22px"`);
  await page.goto(url("song.html?s=salve-regina&as=member"));
  await page.waitFor(`!document.getElementById("song").hidden`);
  assert.equal(await page.evaluate(`getComputedStyle(document.querySelector(".verse")).fontSize`), "22px");
});

check("the songs' pages run without errors", async ({ page, url }) => {
  for (const p of ["songs.html?as=newcomer", "song.html?s=holy-god&as=mentor", "song.html?s=nope&as=member"]) {
    page.errors.length = 0;
    await page.goto(url(p));
    await page.waitFor(`document.readyState === "complete"`);
    await new Promise((d) => setTimeout(d, 100));
    assert.deepEqual(page.errors, [], p);
  }
});
