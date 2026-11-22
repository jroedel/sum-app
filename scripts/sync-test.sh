#!/usr/bin/env bash
#
# scripts/sync and on_latest_main (scripts/env-lib.sh), against a real bare
# repository standing in for GitHub.
#
# The guard is what stands between a stale or half-finished checkout and the
# server, so each way of being "not GitHub's main" is tried: a branch,
# uncommitted changes, behind, ahead, and GitHub unreachable. sync is tried
# for the two things it must never do: switch away from uncommitted work, or
# move a main that has commits of its own.

set -uo pipefail

repo_root="$(git rev-parse --show-toplevel)"
sandbox="$(mktemp -d)"
trap 'rm -rf "$sandbox"' EXIT

failures=0
pass() { printf 'ok    %s\n' "$*"; }
nope() {
	printf 'FAIL  %s\n' "$*"
	failures=$((failures + 1))
}

# guard runs on_latest_main in the work clone, in a subshell so its cd and
# its sourcing stay there.
guard() {
	(cd "$sandbox/work" && source "$repo_root/scripts/env-lib.sh" && on_latest_main) >/dev/null 2>&1
}
sync() {
	(cd "$sandbox/work" && bash "$repo_root/scripts/sync") >"$sandbox/out" 2>&1
}
expect_guard() {
	local want="$1" name="$2" got
	if guard; then got=allowed; else got=refused; fi
	if [ "$got" = "$want" ]; then pass "$name: $got"; else nope "$name: $got, want $want"; fi
}

git init -q --bare -b main "$sandbox/origin.git"
git clone -q "$sandbox/origin.git" "$sandbox/work" 2>/dev/null
git clone -q "$sandbox/origin.git" "$sandbox/other" 2>/dev/null
for d in work other; do
	git -C "$sandbox/$d" config user.email test@example.invalid
	git -C "$sandbox/$d" config user.name test
done

echo one >"$sandbox/work/file"
git -C "$sandbox/work" add file && git -C "$sandbox/work" commit -q -m one && git -C "$sandbox/work" push -q origin main 2>/dev/null

expect_guard allowed "on GitHub's main"

git -C "$sandbox/work" switch -q -c feature
expect_guard refused "on a branch"

if sync && [ "$(git -C "$sandbox/work" symbolic-ref --short HEAD)" = main ]; then pass "sync switches a branch back to main"; else nope "sync from a branch: $(cat "$sandbox/out")"; fi

# GitHub moves on, through another clone.
git -C "$sandbox/other" pull -q origin main 2>/dev/null
echo two >"$sandbox/other/file" && git -C "$sandbox/other" commit -q -am two && git -C "$sandbox/other" push -q origin main 2>/dev/null
expect_guard refused "behind GitHub"

if sync && [ "$(git -C "$sandbox/work" rev-parse HEAD)" = "$(git -C "$sandbox/other" rev-parse HEAD)" ]; then pass "sync fast-forwards to GitHub"; else nope "sync when behind: $(cat "$sandbox/out")"; fi
expect_guard allowed "after sync"

echo edited >"$sandbox/work/file"
expect_guard refused "with uncommitted changes"
git -C "$sandbox/work" switch -q -c elsewhere 2>/dev/null
if sync; then nope "sync went ahead with uncommitted changes"; else pass "sync refuses uncommitted changes"; fi
if [ "$(git -C "$sandbox/work" symbolic-ref --short HEAD)" = elsewhere ] && grep -qx edited "$sandbox/work/file"; then pass "and switched nothing, kept the edit"; else nope "sync touched the work it refused"; fi
git -C "$sandbox/work" checkout -q -- file && git -C "$sandbox/work" switch -q main

ALLOW_BRANCH=1 expect_guard allowed "ALLOW_BRANCH=1 on main" # sanity: still allowed
git -C "$sandbox/work" switch -q elsewhere
if (cd "$sandbox/work" && source "$repo_root/scripts/env-lib.sh" && ALLOW_BRANCH=1 on_latest_main) >/dev/null 2>&1; then pass "ALLOW_BRANCH=1 skips the guard on a branch"; else nope "ALLOW_BRANCH=1 did not skip the guard"; fi
git -C "$sandbox/work" switch -q main

echo three >"$sandbox/work/file" && git -C "$sandbox/work" commit -q -am "local only"
expect_guard refused "ahead of GitHub"
if sync; then nope "sync moved a main with local commits"; else pass "sync refuses a main with commits GitHub lacks"; fi
git -C "$sandbox/work" reset -q --hard origin/main

git -C "$sandbox/work" remote set-url origin "$sandbox/nowhere.git"
expect_guard refused "GitHub unreachable (fails closed)"

if [ "$failures" -gt 0 ]; then
	echo "$failures sync tests failed"
	exit 1
fi
echo "sync and on_latest_main: all cases pass"
