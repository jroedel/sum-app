// What every mock-up browser test starts with: the real server, built from
// the working tree, and a phone-sized Chrome pointed at it. Not served (the
// embed takes no .mjs), and not a test itself.
import { launch, skip, stage } from "../../scripts/browser.mjs";
import { startServer } from "../../scripts/testserver.mjs";

// setUp gives {page, url(path), close()}, or undefined when there is no
// Chrome on this machine (never in CI; scripts/browser.mjs, skip).
export async function setUp(name) {
  if (skip()) return undefined;

  const server = await startServer(name);
  let browser;
  try {
    stage("starting Chrome");
    browser = await launch();
    const page = await browser.page();

    return {
      page,
      url: (path) => `${server.base}/prototype/${path}`,
      async close() {
        await browser.close();
        server.stop();
      },
    };
  } catch (err) {
    await browser?.close();
    server.stop();
    throw err;
  }
}

// visible is an expression for the page: whether selector is on screen,
// rather than hidden by a role.
export const visible = (selector) =>
  `(() => { const e = document.querySelector(${JSON.stringify(selector)}); return !!e && e.checkVisibility(); })()`;
