#!/usr/bin/env bash
#
# superseded(), the third layer of superseding (docs/13-ci-cd.md), against a
# real bare repository standing in for GitHub.
#
# It sources scripts/deploy-ci, which defines the function and runs nothing
# when sourced, so this is the real function and not a copy. In
# mass-intentions the first draft of this test called it through `bash -c`,
# where it was "command not found", and four of five assertions passed
# whatever the code did. So every case here asserts a specific answer, and the
# first one proves the function exists.
#
# Faking git would test the fake: the origin is a real bare repository, and
# "main moved on" is a real push to it.

set -uo pipefail

repo_root="$(git rev-parse --show-toplevel)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# shellcheck source=scripts/deploy-ci
source "$repo_root/scripts/deploy-ci"

failures=0
expect() {
	local want="$1" name="$2" got
	shift 2
	if "$@" >/dev/null 2>&1; then got=superseded; else got="not superseded"; fi
	if [ "$got" = "$want" ]; then
		printf 'ok    %s: %s\n' "$name" "$got"
	else
		printf 'FAIL  %s: %s, want %s\n' "$name" "$got" "$want"
		failures=$((failures + 1))
	fi
}

if ! declare -F superseded >/dev/null; then
	echo "FAIL  scripts/deploy-ci defines no superseded function"
	exit 1
fi

git init -q --bare -b main "$tmp/origin.git"
git clone -q "$tmp/origin.git" "$tmp/work" 2>/dev/null
cd "$tmp/work" || exit 1
git config user.email test@example.invalid
git config user.name test

git commit -q --allow-empty -m one
git push -q origin main
first="$(git rev-parse HEAD)"

expect "not superseded" "deploying main's tip" superseded "$first" "$tmp/work"

git commit -q --allow-empty -m two
git push -q origin main
second="$(git rev-parse HEAD)"

expect superseded "main has moved past it" superseded "$first" "$tmp/work"
expect "not superseded" "the newer commit's own deploy" superseded "$second" "$tmp/work"

DEPLOY_ALLOW_BRANCH=1 expect "not superseded" "a deliberate branch deploy" superseded "$first" "$tmp/work"

git remote set-url origin "$tmp/nowhere.git"
expect "not superseded" "GitHub unreachable fails open" superseded "$first" "$tmp/work"

if [ "$failures" -gt 0 ]; then
	echo "$failures supersede tests failed"
	exit 1
fi
echo "superseded: all cases pass"
