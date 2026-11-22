// This repository's server for a browser test: built from the working tree,
// started on a free loopback port with a config of its own, and stopped.
//
// Cut down from stewards' testserver.mjs, which also makes a database and
// signs in. There is neither here yet; when the first store and sign-in
// arrive, they come back from there.
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { stage } from "./browser.mjs";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const freePort = () =>
  new Promise((done) => {
    const s = createServer();
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => done(port));
    });
  });

// startServer gives back the server's base address, log() for everything it
// has written so far, and stop().
export async function startServer(name) {
  const dir = mkdtempSync(join(tmpdir(), `sum-app-${name}-`));
  let appLog = "";
  let app;

  const stop = () => {
    app?.kill();
    rmSync(dir, { recursive: true, force: true });
  };

  try {
    stage("building the server");
    execFileSync("go", ["build", "-o", join(dir, "sum-app"), "./cmd/sum-app"], { cwd: repo, stdio: "inherit", timeout: 180_000 });

    // localhost rather than 127.0.0.1 in base_url: the config allows http
    // only for this machine, and names it so.
    const port = await freePort();
    const base = `http://localhost:${port}`;
    writeFileSync(join(dir, "config.toml"), `[server]\naddr = "127.0.0.1:${port}"\nbase_url = "${base}"\n`);

    stage("starting it");
    app = spawn(join(dir, "sum-app"), ["-config", join(dir, "config.toml")], { stdio: ["ignore", "pipe", "pipe"] });
    app.stdout.on("data", (d) => (appLog += d));
    app.stderr.on("data", (d) => (appLog += d));

    for (let i = 0; ; i++) {
      try {
        if ((await fetch(`${base}/healthz`, { signal: AbortSignal.timeout(2000) })).ok) break;
      } catch {
        // not listening yet
      }
      if (i > 100) throw new Error(`the server did not start:\n${appLog}`);
      await new Promise((done) => setTimeout(done, 100));
    }

    return { base, log: () => appLog, stop };
  } catch (err) {
    stop();
    throw err;
  }
}
