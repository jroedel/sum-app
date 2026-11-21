# Working in this repository

This is the app for the day-to-day operations of the Schoenstatt University
Men (SUM) in Austin, Texas. Every member has a login, and alumni may be given
one later; build nothing that assumes members are the only kind of user it
will ever have.

It is a progressive web app: a person installs it from Chrome or Safari
through its `manifest.json`, and from then on it opens like any other app on
their phone. It is served by a Go HTTP server that hosts the app's static
files.

**What the app does is decided in [`docs/`](docs/README.md)**, starting with
the minimum viable product. A question about behaviour is answered there, not
by guessing; when the docs don't answer it, add it to that doc's **Open
questions** rather than inventing a specific. Keep features small enough for a
student branch to maintain: when a design grows, say what it costs and what
could be left out (see `docs/09-checklists-and-milestones.md`, "Deliberately left out").

**This project is in its documentation phase. Only scaffolding code is
allowed so far.** Scaffolding means what is needed to put a plain web server
on the production server and show the mock-ups there: `go.mod`, a `main`
that serves static files and `/healthz`, the Makefile targets this file names,
the CI and deploy files, and the clickable mock-ups under `docs/prototype/`.
It does **not** mean handlers, stores, business rules, or JavaScript that does
more than the mock-ups need: those wait until the docs say what they do. The
work is still mostly the plan and the design documents; the coding rules below
are here so they are settled before the first feature is written.

The scaffold is the first Go in the repository, so rule 0 applies to it in full:
the `writing-go` skill comes over from stewards in the same pull request that
adds the first `.go` file, or before it.

It will be written in Go, and is expected to ship the way its siblings do: a
push to `main` that CI deploys, here to the schoenstatt.link account on the
dedicated server in Germany. That distance from Austin shapes the front end:
see `docs/02-architecture.md`, "Latency". The rules below were imported from
[stewards](https://github.com/jroedel/stewards), which took them from mass-intentions; where a rule is
about this repository rather than about Go, it is marked as such.

**How to write Go here** is section 0 below and
`.claude/skills/writing-go/SKILL.md` (to be brought over from stewards before
the first `.go` file), following
[ardanlabs/kronk](https://github.com/ardanlabs/kronk) by way of
drop-in forms and mass-intentions.

Sibling projects are named by repository. stewards and drop-in forms are
public; mass-intentions and eumaeus are private. On the development machine
each is checked out beside this one, as `../<name>`.

**How to move around this repository** is sections 1–5. They close loops that
are a property of Go and of agents rather than of any one repository: a
compiler diagnostic already knows where the problem is, and gopls already knows
where a symbol is declared. When one of them stops paying here, delete it
rather than obey it out of habit.

**Who does what** is section 6, and it is the part that is enforced rather
than asked for.

## 0. Touching Go: load the skill, then run the check

**Before reading, writing or modifying any `.go` file**, load
`.claude/skills/writing-go/SKILL.md` — the modern-Go rules for the version in
`go.mod`. This is kronk's mandatory-skill rule and it is the one directive here
that is not negotiable.

**After modifying any `.go` file**, on the package you changed:

```sh
make go-check PKG=./business/domain/<x>/<x>bus
```

which is `gofmt -s -w`, `go vet`, `staticcheck`, `go build ./...` and the
package's tests. All must pass. **Fix the code; do not suppress the
diagnostic.**

One package rather than `./...`, deliberately. A new module starts with
`staticcheck ./...` clean; keep it that way and the bound costs nothing, and
the day it is not clean the rule is already in place.

`make dev-tools` installs `staticcheck` and `gopls`, both pinned.

Three things kronk says that are worth repeating verbatim: be concise; verify an
API from the live toolchain or the docs rather than from recall; double-check
the arguments of a tool call before submitting it.

## 1. A diagnostic is an address. Go to it.

`go build`, `go vet`, `go test` and `gofmt` all report `file.go:line:col`. That
is the answer to "where", and no search is needed to find it. Read the region
around the reported line directly — `sed -n '<line-8>,<line+8>p'` on the file it
named — rather than grepping for the identifier it mentions.

## 2. Find a Go symbol with `make sym`, not with grep

```sh
make sym NAME=Thing
make sym NAME=Store.ByID
make outline FILE=business/domain/<x>/stores/<x>db/<x>db.go
```

Both are `gopls`, which answers from the same type information the compiler
uses: it knows which `Store` is a method on which type, and it brings the doc
comment with it. There is also a gopls MCP server in some setups
(`mcp__gopls__go_search`, `go_symbol_references`, `go_file_context`); when it is
available it is the same answer without the shell.

**grep is still right** for everything that is not a Go symbol: a config key, a
SQL column, a string in a template, a word in the plan. The rule is about the
declaration of an identifier, which is what gopls is exact about.

## 3. One verify command, and its output is already filtered

```sh
make test-unit     # the tests, with -race. No network.
make lint          # go vet + gofmt check
make test          # both, plus the shell tests and the JavaScript ones below
make vuln-check    # govulncheck. Needs the network.
make go-check PKG= # the after-editing-Go loop, on one package
make test-js       # the JavaScript, under Node's own test runner
make test-browser  # the same in headless Chrome, against a server built for it
```

**JavaScript** has a bigger part here than in the sibling projects (the
service worker, saved copies, acting before the server answers, the daily
game; see `docs/02-architecture.md`), but it is written the same way: plain
ES modules with no build step and no npm, served by the app that owns them.
After changing one, run `make test-js test-browser`. A unit test is
`*_test.mjs` beside the module; a browser test is `*_browser_test.mjs`. Both
follow stewards.

`make test-unit` counts the passing packages instead of listing them, so **there
is nothing to pipe it through**. A filter written in a hurry is one that
eventually hides a `FAIL`; if pass-noise ever comes back, fix `scripts/go-test`
rather than the command line.

## 4. Formatting is part of verifying, not a step of its own

`make lint` fails when something is not gofmt-clean and names the files.
`make fmt` fixes them. Running `gofmt -l` speculatively is not useful.

## 5. Where things live

```
cmd/<app>/                          the server's main, and its config
app/domain/<x>app/                  HTTP handlers and view types. No business rules.
app/sdk/                            the plumbing under them: muxer, page, health, mid
business/domain/<x>/<x>bus/         the rules. This is where behaviour is.
business/domain/<x>/stores/<x>db/   storage, per domain
business/types/                     small value types: ID, Status, Lang
foundation/                         no domain knowledge: web, sqldb, errs, logger
deploy/                             how it reaches the server. Run by CI, not by agents
scripts/                            how this is built and checked
```

The rule that makes the layering worth having: **an App package never imports
another App package, and nothing in `foundation/` knows a domain word.** When
two apps need the same thing it moves down a layer.

A question about *behaviour* starts in `business/domain/…bus`. A question about
*a status code or a form field* starts in `app/domain/…app`. A question about
*how it is stored* starts in the matching `stores/…db`.

## 6. Who does what: agents write PRs, people merge and run production

**Here, and not negotiable.**

- **The human in the loop is the pull request, at a minimum.** Everything in
  `git` is a pull request on a branch. An agent opens it; a person reviews and
  merges it. Nothing is committed or pushed to `main` directly, and an agent
  never merges its own PR.
- **Dependency bumps are the one exception, and they are for security.** A
  Go patch release and a module bump are where security fixes arrive, so
  `dependabot-merge.yml` merges Dependabot's pull requests and
  `go-version.yml`'s once they are a day old with every check green, and
  deploys them. No agent merges these either: the workflow does. See
  `docs/13-ci-cd.md`.
- **A merge to `main` is a deploy.** CI runs the checks and, if they pass,
  ships to the server. So the review is the last gate there is — a PR
  description says what the change does to the running app, not only to the
  code.
- **Agents never touch the production server.** No `ssh`, `scp` or `rsync` to
  it, no `deploy/deploy.sh`, and none of the `make deploy*` or `make prod-*`
  targets. Those exist for a person at a terminal; `make` is how that person
  talks to production, and it is the only way. If a task seems to need
  something from production — a log line, the state of the database — say
  what you need and why, and let the person run the target and paste the
  answer.
- **Agents never set GitHub secrets or variables**, and never read
  `secrets.env`. The split mass-intentions uses applies here: `DEPLOY_*` are
  GitHub secrets, `APP_*` are GitHub variables, and runtime credentials go to
  the server over ssh from a person's machine, never through CI.

`.claude/settings.json` denies these commands, so the rule holds even when it
is forgotten. Do not work around a denial — a denied command is the answer.

## When there is a database

These are the storage conventions from mass-intentions, where each one was
paid for. They apply the day the first store lands (plain SQLite through
`modernc.org/sqlite`, as in the sibling projects, unless decided otherwise).

- **No migration tool.** Each store owns `Init(ctx, db)` holding idempotent
  `CREATE TABLE IF NOT EXISTS … STRICT` DDL, and exports
  `Expected sqldb.Expected`. `main` calls every `Init` in foreign-key order and
  then `sqldb.CheckSchema` once. A later column arrives as an `ALTER … DEFAULT`
  beside the `CREATE`, so a fresh database gets it from one and an existing one
  from the other.
- **Nothing that mentions a later column may sit in the `CREATE` block.** An
  index on one goes in a second `Exec` *after* the `AddColumn` call. On a fresh
  database it builds and every test passes; on a database that predates the
  column it runs against a column that is not there yet. This took
  mass-intentions' production down through four deploys, and no test could see
  it, because every test starts from an empty directory.
- **A constraint removed from a `CREATE` block is still there on every database
  that already exists.** SQLite has no `ALTER` that drops one; removing a
  `CHECK` means rebuilding the table, guarded by a `sqlite_master` lookup.
- **A store with a later column owns a test that runs `Init` over the schema as
  it stood before** — the old DDL written out literally, not derived from the
  new one.
- **`/healthz` re-checks the schema on every call**, rather than pinging. The
  deploy rolls a release back on what it says, and a binary rolled back onto a
  newer schema must report unhealthy.
- **Timestamps are Unix milliseconds in INTEGER columns**, never text.
- **A single-use claim is one statement**, `UPDATE … WHERE x IS NULL` or
  `INSERT … ON CONFLICT DO NOTHING`, never a read followed by a write.

## This repository is public

**Nothing private about the branch or its people is ever committed**: no
member's name, email or phone number, no apartment door code, no real data
copied into a test, and no secret of any kind. Test fixtures are invented.
The branch's own documents (the apartment order, the conduct policy) are
pages in the app's database, not files here. Paths on the development
machine are written relative to the repository (`../stewards`), never
absolute.

## House style, in one paragraph

Comments explain **why**, at length, and in prose — including what was tried and
rejected, and what a reader would otherwise assume. Match the density of the
file being edited rather than the density of a tutorial. Error sentences that
reach a person say what to do about it and never name a Go package.
