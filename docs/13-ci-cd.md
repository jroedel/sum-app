# 13 — CI and CD

The standard for building, checking and shipping this app. Nothing here is
built yet: the workflows, the Makefile and the scripts arrive with the first
code, under the rule in [`CLAUDE.md`](../CLAUDE.md). This document is what
they must meet.

It takes the best of the sibling repositories, each of which paid for its
lessons:

- **[drop-in forms](https://github.com/jroedel/dropin-forms)**: the same
  hosting account, push to deploy, and the newest `go-version.yml`.
- **[stewards](https://github.com/jroedel/stewards)**: the closest sibling.
  JavaScript and browser tests, the locked swap, an end-to-end test of the
  deploy, and `deploy-status`.
- **mass-intentions** (private): superseding a deploy, rollback and upgrade
  rehearsal.
- **eumaeus** (private): the strictest CI. Deploying the exact binary CI
  built, script checks, pre-commit hooks, and a daily vulnerability scan.

## Principles

1. **A merge to `main` is a deploy.** The pull request is the decision and
   the review; there is no second ceremony (`CLAUDE.md` §6).
2. **What deploys is exactly what CI tested**: the same commit and the same
   binary, not a rebuild.
3. **A deploy that has been overtaken stops itself** at the last moment when
   stopping costs nothing ([below](#superseding-a-deploy)).
4. **Nothing on the server changes until the new release has proven itself**
   against the live config, and a release that does not answer is rolled
   back by itself.
5. **Runtime secrets never pass through GitHub.** A compromise of the
   pipeline stops at "can deploy code".
6. **One file holds every secret on the developer's machine**, and a copy of
   it in the developer's password vault is enough to get a new machine to a
   tested, deployable state.
7. **Every check that can silently pass is made to fail loudly in CI.** A
   check skipped because a tool is missing is a failure there, not a pass.
8. **The pipeline is itself tested.** The deploy script, the secrets script
   and the supersede check each have tests that run in CI.

## The pipeline

```
pull request ──► ci.yml ──► review ──► merge to main
                                            │
                     ci.yml on main (a newer push cancels an older run)
                                            │ success
                                            ▼
                     deploy.yml (workflow_run; queued, one at a time)
                       download CI's binary ─► upload ─► pre-flight
                       ─► back up ─► SUPERSEDED? ─yes─► stop, nothing changed
                                            │ no
                       stop ─► swap ─► start ─► health ─► (rollback on failure)
                       ─► front end, schedule ─► public checks
```

## CI: every pull request, and `main`

`ci.yml`, triggered by `pull_request` (never `pull_request_target`, which
would run a stranger's code with this repository's secrets), by pushes to
`main`, and by `workflow_dispatch` for `go-version.yml`.

**Hygiene, on every workflow:**

- Actions **pinned to a commit SHA**, with the version in a comment.
  Dependabot moves both.
- `permissions: contents: read` at the top, and widened **per job** only
  where a job needs it.
- **`timeout-minutes` on every job.** A browser test with no time limit once
  hung stewards' CI for 42 minutes.
- `concurrency: ci-${{ github.ref }}` with `cancel-in-progress: true`. A newer
  push to the same branch cancels the older run. On `main`, this is the
  first layer of superseding.
- **Steps self-enable as code appears** (`if: hashFiles('**/*.go') != ''`, as
  in stewards), so CI can exist from the first pull request without failing
  for lack of code.
- The CI workflow's **name is load-bearing**: `deploy.yml` follows it by
  name. Renaming it silently stops every deploy, so a test asserts that
  the two agree.

**The checks**, each a separate step so that a red run names what failed:

| Check | Make target | Why |
|---|---|---|
| gofmt, `go vet` | `make lint` | |
| staticcheck, pinned | `make lint` | |
| Unit tests with the race detector | `make test-unit` | |
| Shell tests | `make shell-test` | Globs `scripts/*-test.sh`, so a new test needs no registration |
| JavaScript unit tests | `make test-js` | Node's own test runner; no npm |
| Browser tests, headless Chrome | `make test-browser` | The service worker, saved copies, acting before the server answers ([02](02-architecture.md)) |
| Scripts | `make check-scripts` | Every script parsed by its own shell, and pinned ShellCheck |
| Workflows | `make check-workflows` | Pinned actionlint. In no sibling yet; new here |
| Secrets template | `make secrets-template-check` | `secrets.env.example` and the lists in `scripts/secrets` agree |
| Schema upgrade | `make upgrade-check` | [Below](#upgrading-the-live-database) |
| Static release build | `make release` | The server has no Go and gets one file; a binary linked against the runner's glibc dies on the host |

The release binary is **uploaded as an artifact**, and the deploy uses that
exact file.

**Vulnerabilities: `vuln.yml`**, as in eumaeus. govulncheck runs **daily** and
on pull requests that touch `go.mod`, in its own workflow, and does not gate
deploys. In eumaeus, gating on it once blocked the very Go release that fixed
the advisory. A failing daily run emails the person who last changed the
workflow.

**Tests of the database upgrade.** `CLAUDE.md` "When there is a database"
records how mass-intentions' production went down through four deploys
because an index referred to a column that existing databases did not have
yet, and no test could see it. So:

### Upgrading the live database

`make upgrade-check` builds **the commit that is live** (read from
`/healthz`, which reports it), lets it create a database, then starts the
new build against that database and runs its schema check. mass-intentions
does this by hand (`upgrade-rehearsal.sh`). Here it runs in CI on every pull
request that touches a store. New here, and the highest-value check on the
list.

**On the developer's machine**, a pre-commit hook (`make hooks`, from eumaeus)
refuses to commit `secrets.env`, `config.toml`, keys, databases, and anything
shaped like a private key or an API key. This repository is public.
GitHub's own **secret scanning with push protection**, free on a public
repository, is turned on as a second net.

## CD: push to deploy

`deploy.yml` runs on **`workflow_run`: CI completed on `main` with
success**, and checks out `workflow_run.head_sha`, the commit CI tested. It
downloads CI's binary rather than building one. It can also be started by
hand (`workflow_dispatch`); a hand-started deploy runs the full test suite
first, because it may name a commit CI never saw.

It runs in the **`production` environment**, so a required reviewer can be
added for a single risky change without editing a file. Before the server
exists, it stays grey rather than red (`if: vars.APP_HOST != ''`).

The first step checks **every required secret and variable at once**, and
names every missing one together, never a value.

### What `deploy/deploy.sh` does, in order

Everything before the supersede check leaves the live app exactly as it was.

1. **Refuse** to deploy anything but `main`, unless `DEPLOY_ALLOW_BRANCH=1`.
2. **Upload** the binary as `sum-app.new`.
3. **Pre-flight.** The *new* binary runs `-check` against the *live*
   `config.toml`: a config missing a newly required key fails here, and
   nothing is swapped. It must say it listens on the port Apache proxies to,
   and that its base URL is `https://app.sumatx.us`. A stale base URL once
   sent mass-intentions' sign-in links to a dead host.
4. **Back up** the database with `sqlite3 .backup`, named by timestamp, and
   rotated by the timestamp in the name. Rotating by file time once deleted
   stewards' newest backup.
5. **Superseded?** [Below](#superseding-a-deploy).
6. **Swap, under the supervisor's lock** (stewards' `locked()`): stop, keep
   the current binary as `.prev`, rename `.new` into place, start. Without
   the lock, the cron watchdog can restart the *old* binary mid-deploy, and
   the health check then passes against old code.
7. **Loopback health check.** `/healthz`, which re-checks the schema on
   every call. If it fails, **roll back** to `.last-good` (kept apart from
   `.prev`), keep the failed binary as `.failed`, and fail the run. The start
   is guarded, so `set -e` cannot skip the rollback, which once let four bad
   deploys in a row through in mass-intentions.
8. **Front end and schedule, on every deploy**: `.htaccess` and the cron
   watchdog are reinstalled each time, not once. A cron line that was never
   installed went unnoticed in mass-intentions.
9. **Public checks.** `/` must be answered *by the app* (its security
   headers), not by Apache: stewards once served a 404 at `/` while
   `/healthz` said 200. `config.toml`, the database, the log and
   `secrets.env` must be **unreachable** from the web, and the app's
   directory must not be inside the web root. A failed public check keeps
   the release, since it cannot tell a bad binary from a misconfigured
   Apache, and fails the run.
10. Mark the release `.last-good`, and report what is live.

### Superseding a deploy

When a newer pull request has been merged while a deploy is under way, the
older deploy stops itself at the last moment when stopping costs nothing.
This keeps iteration short: three merges in a minute ship once, not three
times. There are three layers:

1. **CI on `main`** cancels its own older run when a newer push arrives, so
   an overtaken commit usually never reaches the deploy at all (eumaeus).
2. **The deploy's concurrency group** (`deploy-production`,
   `cancel-in-progress: false`) runs one deploy at a time. GitHub replaces a
   pending run with a newer one, so at most one waits.
3. **The deploy checks for itself** (mass-intentions and stewards). After
   building, uploading, pre-flighting and backing up, and immediately before
   the swap, it compares the commit it is deploying with the tip of `main`
   on GitHub (`git ls-remote`). If `main` has moved on, it removes
   `sum-app.new`, says **"a newer commit is already on main; its deploy
   follows this one. Nothing on the server was changed"**, and succeeds.

**Never `cancel-in-progress` on the deploy.** Cancelled between the stop and
the start, it leaves the app down until the watchdog notices. That is why
the third layer is a check inside the script, at the one point where
stopping is free.

The check **fails open**: if GitHub cannot be reached, it deploys. A deploy
that silently does nothing is worse than one extra release. A deliberate
branch deploy is never superseded.

Its test (`scripts/deploy-supersede-test.sh`) uses a real bare repository
and covers five cases: fresh, behind, caught up, unreachable, and a branch
deploy. It calls the real function from `deploy.sh`, not a copy. The first
draft in mass-intentions called it through `bash -c`, where it was "command
not found", so four of five assertions passed whatever the code did.

### The deploy is tested end to end

`scripts/deploy-e2e-test.sh` (stewards) runs the real `deploy.sh` against a
fake home directory with fake `ssh`, `scp` and `curl`, three times: onto an
empty account, over a running app, and with a broken binary that must be
rolled back. It runs in CI with the shell tests.

## Dependencies and Go itself

**`.github/dependabot.yml`**: `gomod` and `github-actions`, weekly on Monday,
**grouped** into one pull request per ecosystem, so the week's bumps cannot
conflict with each other on `go.mod`. There is no npm, so there is nothing
else to bump.

**`go-version.yml`**: Dependabot does not bump the `go` line in `go.mod`,
and a Go patch release is where the standard library's security fixes
arrive. Daily at 05:00 UTC, this opens a `go-x.y.z` pull request for a new
patch release and dispatches CI on it. It takes:

- drop-in forms' version, with its fix to how the release list is parsed;
- from mass-intentions: it closes and reopens its own pull request if that
  pull request conflicts, and closes older `go-x.y.z` pull requests as
  superseded;
- a new **minor** release opens an issue for a person instead; it changes
  the language.

**`dependabot-merge.yml`**: daily at 05:30 UTC, merges Dependabot's and
`go-version.yml`'s pull requests once they are **a day old, mergeable, and
every check green**, then dispatches the deploy and waits for it. A merge
made with the workflow's token cannot trigger a deploy by itself. A failed
deploy makes this run red, which is the one email worth getting. From the
siblings:

- its own concurrency group, **never `deploy-production`**. In eumaeus, the
  merge run waited on a deploy that was queued behind it, until GitHub's
  six-hour limit cancelled both;
- the green verdict **leaves out the vulnerability scan**, so a bump that
  fixes an advisory is not blocked by that advisory;
- `gh run watch` is **retried**, then the conclusion read directly. A
  GitHub error once reported a successful deploy as failed;
- `timeout-minutes: 60`, so a hang is an email the same morning;
- once, by hand: Settings → Actions → General → "Allow GitHub Actions to
  create and approve pull requests".

This is the one exception to "people merge" in `CLAUDE.md` §6, as in
stewards: dependency bumps are security fixes, and no agent merges them
either. The workflow does.

## Secrets

### One file, three destinations

`secrets.env` in the repository root, gitignored, mode 600, documented key by
key in the tracked `secrets.env.example`. `scripts/secrets` sends each key
where it belongs, by **explicit lists**. A key on no list goes nowhere, and
`check` says so.

| Group | Goes to | Holds | How |
|---|---|---|---|
| `DEPLOY_*` | GitHub **secrets**, scoped to the `production` environment | the ssh host, user, port, deploy key, pinned host key | `make secrets-push` |
| `APP_*` | GitHub **variables**, repository level | host name, port, directory: nothing secret, and readable in a log, which makes a failed deploy debuggable | `make secrets-push` |
| everything else | `config.toml` on the server, mode 600, over ssh from the developer's machine, then a restart | Twilio, the drop-in forms API key, the identity-signing key, web push keys, the session key | `make secrets-install` |

Variables stay at **repository level**: a job-level `if: vars.X` cannot see
environment variables, and eumaeus's deploy was skipped silently because of
it.

`make secrets-push` sends the whole deploy block in one command, but **one
GitHub secret per key**, each value on standard input. stewards once ran
`gh secret set --body -`, which stored a literal `-` in every secret, and its
check still passed. So `push` reads the values back, waiting for GitHub's
list to catch up.

**Runtime secrets never reach GitHub.** `push` refuses `--env-file`, so the
runtime block cannot be sent there even by mistake.

**A value is never printed**, by any command: `check` and `status` report
missing keys by name and say nothing about present ones. `secrets.env` is
**parsed, never `source`d**, so a value with a `$` in it is data, not code.

### The password vault

The developer's password vault (Bitwarden, as for mass-intentions) holds
**the whole `secrets.env` as one note**. That is the backup. Every value in
it is single-line: the deploy key and the signing key are base64-encoded, so
pasting it into a vault and out again cannot mangle a newline.

After any change to `secrets.env`, `make secrets-check` ends by reminding
the developer to update the vault copy, and shows the file's
fingerprint so the two can be compared.

### A new machine, from nothing

The test of the arrangement: with the repository and the vault note, a new
machine reaches a tested, deployable state with no other source.

```sh
git clone git@github.com:jroedel/sum-app.git && cd sum-app
# paste the vault note into secrets.env
chmod 600 secrets.env
make dev-tools          # pinned Go tools
make hooks              # the pre-commit hook
make secrets-check      # every key present; nothing printed
make test               # everything CI runs
make deploy-status      # this machine, GitHub, the server, the public site: one verdict
```

`make deploy-status` (stewards) checks each section in turn and ends with one
line: deployable, or what to do first. From there `make deploy` works by
hand, and a merge deploys as usual.

This is **rehearsed once before launch**, on a clean machine or container,
and again whenever the key list changes.

## Make targets

Taken from stewards, mass-intentions and eumaeus, with one name per job.

| Target | What |
|---|---|
| `help` | every target, grouped |
| `dev-tools`, `tools` | pinned Go tools; pinned ShellCheck and actionlint |
| `hooks`, `check-hooks` | install and verify the pre-commit hook |
| `lint`, `fmt`, `vet` | |
| `test-unit`, `test-js`, `test-browser`, `shell-test` | |
| `test` | everything CI runs, in CI's order |
| `check-scripts`, `check-workflows` | |
| `vuln-check` | govulncheck (needs the network) |
| `upgrade-check` | the live commit's database, opened by this one |
| `release` | the static linux/amd64 binary, asserted static |
| `go-check PKG=` | the after-editing-Go loop on one package (`CLAUDE.md` §0) |
| `sym`, `outline` | find a Go symbol (`CLAUDE.md` §2) |
| `dev` | render a local config from `secrets.env` and run |
| `secrets-check`, `secrets-template-check` | |
| `secrets-keygen` | mint the deploy key and pin the server's host key, into `secrets.env` |
| `secrets-push` | the deploy block to GitHub |
| `secrets-install` | the runtime block to the server, and restart |
| `deploy-status` | one verdict across this machine, GitHub, the server and the public site |
| `deploy` | deploy by hand |
| `prod-status`, `prod-logs`, `prod-restart` | |
| `prod-backup`, `prod-pull-backup DEST=` | a backup on the server; a copy on this machine |
| `prod-texts-check` | Twilio reachable, with the right number |

The `deploy` and `prod-*` targets and `secrets-push`/`secrets-install` are
for **a person at a terminal**. `.claude/settings.json` denies them to agents
(`CLAUDE.md` §6).

Every target that is not a file is `.PHONY`. In eumaeus, a target that shared
its name with a directory once ran nothing and reported green.

## The shared hosting account

The app runs on the schoenstatt.link konsoleH account, **which drop-in forms
also runs on**. konsoleH has no root, so a deploy key cannot be narrowed to
one installer command, and whoever holds it has a shell on the account.
drop-in forms accepts that for itself because its runtime secrets (the Stripe
keys) never reach GitHub. On a shared account, though, **sum-app's
`DEPLOY_SSH_KEY_B64` in GitHub would be a shell next to drop-in forms'
`config.toml`**, and the reverse.

Options, to decide before the first deploy:

- a **separate konsoleH account or SSH user** for this app, if the hosting
  plan allows one, which keeps each pipeline's reach to its own app;
- a **forced command** in `authorized_keys` (an OpenSSH option, which needs
  no root): the key can only run one deploy-receiving script, which checks
  what it is asked to do. It narrows the key, at the cost of a deploy
  protocol to maintain;
- accepting the shared reach knowingly, with the `production` environment
  requiring a reviewer.

## Open questions

- The shared account, above.
- Whether the upgrade check may call the live `/healthz` from CI, or reads
  the live commit from somewhere private.
- The merge method for pull requests (squash, as in drop-in forms, or merge
  commits), set once in the repository's settings.
- Whether to require a reviewer on the `production` environment by default,
  or only for a risky change.
