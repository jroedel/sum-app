---
name: writing-go
description: The Go rules this project follows — the check to run after every edit, and the modern syntax to use on Go 1.27. Load before reading, writing or modifying any .go file.
---

# Writing Go here

Adapted from [ardanlabs/kronk](https://github.com/ardanlabs/kronk)'s
`.agents/default/skills/writing-go` by way of drop-in forms, mass-intentions
and [stewards](https://github.com/jroedel/stewards), whose copy this is. Where
this file and kronk differ, the difference is about this repository and is
marked **Here:**.

## The version

**Go 1.27.** It belongs in `go.mod` as one directive with no separate
`toolchain` line. That is deliberate and it is worth the sentence: with
`go 1.26.5` and `toolchain go1.26.6`, CI installs the first and Go downloads the
second into the module cache, after which every cache restore unpacks a
toolchain that is already on disk and emits one tar warning per file. In
eumaeus that was 11,541 of 11,958 lines in a deploy log, which is how a log
stops being read.

**Here:** the sibling projects are on 1.26. This one starts on 1.27 because it
is new: there is nothing to migrate, and starting a release behind would make
the first `go-version.yml` pull request a minor-version bump instead of a
patch.

Use every feature up to and including 1.27. Never one from a later version, and
never an outdated pattern when a modern one exists. What is new in a release is
in `$(go env GOROOT)/api/go1.NN.txt` and in the spec's "Language versions"
section (`$(go env GOROOT)/doc/go_spec.html`); read those rather than
remembering.

## After editing any `.go` file

Run these against the package you changed. All must pass; fix the code rather
than suppressing the diagnostic.

```sh
make go-check PKG=./business/domain/member/memberbus     # the five below, on one package
```

which is:

```sh
gofmt -s -w <pkg>
go vet <pkg>/...
staticcheck <pkg>/...
go build ./...
scripts/go-test <pkg>/...
```

**Here:**

- `make go-check` takes a package rather than `./...`. This repository is new
  and clean, so the bound costs nothing today; it is kept because the day it
  stops being clean, the rule that makes a new finding in your own code the only
  line you see is already the habit.
- `go vet` and the gofmt check are also in `make lint`, which is what `make
  test` runs. `staticcheck` is not in either, for the reason above.
- `make vuln-check` is separate from `make test` because it needs the network.
  CI runs it as its own step.
- `go fix` is in kronk's list and is not here. It has nothing to do on a module
  this new.
- `make dev-tools` pins `staticcheck` 2026.2 (`v0.8.x`, the first release that
  knows Go 1.27) and `gopls` `v0.24.x`. An older `staticcheck` on the path fails
  on 1.27 syntax with an error that looks like a bug in your code.

## The rules that come up in Go written this way

### `errors.AsType[T](err)`, not `errors.As(err, &target)` — 1.26

```go
// Before
var invalid memberbus.Invalid
if !errors.As(err, &invalid) {
    return err
}

// After
invalid, ok := errors.AsType[memberbus.Invalid](err)
if !ok {
    return err
}
```

This is the one that matters most in a layered service: the app layer's whole
job on a failure is deciding which error type it is looking at, so that it can
choose a status code without knowing a business rule.

### The standard `uuid` package, not a module — 1.27

```go
id := uuid.NewV7() // import "uuid"
```

`uuid.NewV7()` sorts by creation time, which keeps an index on the ID in
insertion order; `uuid.New()` when that doesn't matter. `uuid.Parse` and
`uuid.MustParse` read one back. **Here:** never add `github.com/google/uuid` or
`github.com/gofrs/uuid`. A stored UUID is TEXT in its canonical form, so a row
can be read in `sqlite3` without decoding.

### `strings.CutLast`, not `strings.LastIndex` and slicing — 1.27

```go
// Before
i := strings.LastIndex(path, "/")
if i < 0 {
    return path, ""
}
dir, file := path[:i], path[i+1:]

// After
dir, file, ok := strings.CutLast(path, "/")
```

Also `bytes.CutLast`. Like `strings.Cut`, it says in one line what the index
arithmetic said in four, and it can't be off by one.

### `httptest.NewTestServer(t, h)`, not `httptest.NewServer(h)` and `defer srv.Close()` — 1.27

It shuts itself down when the test ends and uses an in-memory network by
default, so a test of a handler opens no port and can't collide with another
test running in parallel.

### `encoding/json/v2` for new JSON code — 1.27

`json.Marshal`, `json.Unmarshal`, and `json.MarshalWrite` / `json.UnmarshalRead`
for streams, from `encoding/json/v2`. It matches field names case-sensitively
and rejects an object with a duplicate name, which is what a signed webhook
payload from drop-in forms or a token's claims should get: one reading, not the
last of two. **Here:** don't mix v1 and v2 in one package; the tag options mean
different things (`omitempty` especially).

### `omitzero`, not `omitempty`, for a `time.Time`, `time.Duration`, struct, slice or map — 1.24

`omitempty` never worked on a `time.Duration` or a `time.Time`.

`omitempty` stays where it does what it says and where a client's contract
depends on exactly that — on an `int` or a `bool`, where absent and zero are
different answers to the caller. This rule is about the types `omitempty` was
silently wrong for.

### Generic methods — 1.27

A method may declare its own type parameters:
`func (s *Store) Get[T any](ctx context.Context, id uuid.UUID) (T, error)`.
Use one where the alternative was a package-level function taking the
receiver as its first argument only so it could be generic. Don't make a
method generic to save writing two small methods; in a store, two named
methods are easier to find with `make sym` and to read in a stack trace.

### `strings.SplitSeq`, not `strings.Split`, when iterating — 1.24

```go
// Before
for _, part := range strings.Split(s, ",") {

// After
for part := range strings.SplitSeq(s, ",") {
```

Also `strings.FieldsSeq`, `bytes.SplitSeq`, `bytes.FieldsSeq`. A loop that
needs the *index* keeps `strings.Split` — the Seq form has no index to give,
and a hand-kept counter is worse than the allocation it saves.

### `wg.Go(fn)`, not `wg.Add(1)` + `go func() { defer wg.Done() }()` — 1.25

```go
// Before
wg.Add(1)

go func() {
    defer wg.Done()
    process(item)
}()

// After
wg.Go(func() {
    process(item)
})
```

### `t.Context()`, not `context.WithCancel(context.Background())`, in tests — 1.24

It is cancelled when the test ends, which is the thing the deferred `cancel()`
was for.

### `b.Loop()`, not `for i := 0; i < b.N; i++`, in benchmarks — 1.24

**Here:** there are no benchmarks in this repository yet. Write new ones this
way.

## Prefer the modern standard library generally

`slices`, `maps` and `cmp` over hand-written loops and sort helpers — and over
a helper of our own that does the same thing. Verify an API against the
toolchain or the docs (`go doc uuid.NewV7`) rather than from memory;
`make sym NAME=…` answers for anything in this module.

**Here:** that preference extends to the web server itself. `net/http`'s
method-and-wildcard patterns (`mux.HandleFunc("POST /groups/{id}/requests", …)`),
`http.Server` with its timeouts set, and `html/template` are the whole
framework. Reach for a dependency when the standard library genuinely has no
answer, and say in a comment which answer was missing. Two dependencies are
expected: `github.com/BurntSushi/toml` for `config.toml` (the standard library
reads no TOML; the siblings use the same one), and, with the first store, the
SQLite driver `modernc.org/sqlite`, which needs no C compiler and so builds
the same on a laptop, in CI and for the server.
