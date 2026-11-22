#!/usr/bin/env bash
#
# deploy/receive.sh, end to end, against a throwaway home directory.
#
# It runs the real receiver, the real supervise.sh and run.sh from the kit,
# and real processes on a loopback port. Only three things are not the
# server's: the releases come from a local directory (file:// URLs, through
# the receiver's RECEIVE_RELEASES_URL), the app is scripts/testdata/fakeapp
# built to claim a chosen commit, and crontab writes a file. A test that faked
# the supervisor would test the fake.
#
# The cases are the receiver's whole contract: refuse anything that is not a
# request; refuse a release that is missing, tampered with, or not the commit
# it claims; deploy onto an empty account, then over a running app; roll a
# broken release back to the last good one; and discard a staged build
# without touching the live app. Along the way it checks that drop-in forms'
# cron line survives every deploy.

set -uo pipefail

repo_root="$(git rev-parse --show-toplevel)"
tmp="$(mktemp -d)"
port="${RECEIVE_TEST_PORT:-18471}"

home="$tmp/home"
app="$home/sum-app"
docroot="$home/public_html/app.sumatx.us/public"
releases="$tmp/releases"

cleanup() {
	if [ -x "$app/supervise.sh" ]; then
		(cd "$app" && ./supervise.sh stop >/dev/null 2>&1) || true
	fi
	rm -rf "$tmp"
}
trap cleanup EXIT

failures=0
pass() { printf 'ok    %s\n' "$*"; }
nope() {
	printf 'FAIL  %s\n' "$*"
	failures=$((failures + 1))
}

mkdir -p "$app" "$docroot" "$releases" "$tmp/bin"
cp "$repo_root/deploy/receive.sh" "$app/receive.sh"
chmod 700 "$app/receive.sh"

cat >"$app/receive.conf" <<EOF
REPO=test/sum-app
APP_PORT=$port
BASE_URL=https://app.sumatx.us
DOCROOT=$docroot
EOF

cat >"$app/config.toml" <<EOF
[server]
addr = "127.0.0.1:$port"
base_url = "https://app.sumatx.us"
EOF

# crontab, as a file, already holding another project's line.
printf '*/5 * * * * cd /home/x/dropin-forms && ./supervise.sh start # dropin-forms (managed by deploy.sh)\n' >"$tmp/crontab"
cat >"$tmp/bin/crontab" <<EOF
#!/usr/bin/env bash
if [ "\${1:-}" = -l ]; then cat "$tmp/crontab" 2>/dev/null || exit 1; else cp "\$1" "$tmp/crontab"; fi
EOF
chmod 755 "$tmp/bin/crontab"

# make_release <commit> [broken] [claimed commit]
make_release() {
	local commit="$1" broken="${2:-}" claims="${3:-$1}"
	local dir="$releases/build-${commit:0:12}"
	mkdir -p "$dir"
	(cd "$repo_root" && CGO_ENABLED=0 go build -o "$dir/sum-app-linux-amd64" \
		-ldflags "-X main.commit=$claims -X main.broken=$broken" ./scripts/testdata/fakeapp) || exit 1
	tar -czf "$dir/deploy-kit.tar.gz" -C "$repo_root/deploy" htaccess.template run.sh supervise.sh
	(cd "$dir" && sha256sum sum-app-linux-amd64 deploy-kit.tar.gz >SHA256SUMS)
}

receive() {
	(cd "$app" && RECEIVE_DIR="$app" RECEIVE_RELEASES_URL="file://$releases" RECEIVE_HEALTH_TRIES=8 \
		PATH="$tmp/bin:$PATH" bash ./receive.sh "$@") >"$tmp/out" 2>&1
}

healthz() { curl -fsS --max-time 2 "http://127.0.0.1:$port/healthz" 2>/dev/null; }

A=$(printf 'a%.0s' {1..40})
B=$(printf 'b%.0s' {1..40})
C=$(printf 'c%.0s' {1..40})
D=$(printf 'd%.0s' {1..40})
E=$(printf 'e%.0s' {1..40})

make_release "$A"
make_release "$B"
make_release "$C" yes
make_release "$D"
make_release "$E" "" "$A" # filed under E, but the binary says it is A

# --- refusals ---------------------------------------------------------------

for request in "" "bash" "cat config.toml" "stage ../../etc/passwd" "stage ${A:0:12}" "stage $A extra" "status now"; do
	if SSH_ORIGINAL_COMMAND="$request" receive; then
		nope "the request \"$request\" was accepted"
	else
		pass "refused \"$request\": $(tail -n1 "$tmp/out")"
	fi
done

if receive activate "$A"; then nope "activate before stage was accepted"; else pass "activate needs a staged build"; fi

missing=$(printf 'f%.0s' {1..40})
if receive stage "$missing"; then nope "a commit with no release was staged"; else pass "a commit with no release is refused"; fi

cp -r "$releases/build-${D:0:12}" "$releases/build-${D:0:12}.orig"
printf 'tampered' >>"$releases/build-${D:0:12}/sum-app-linux-amd64"
if receive stage "$D"; then nope "a tampered release was staged"; else pass "a release that does not match its SHA256SUMS is refused"; fi
rm -rf "$releases/build-${D:0:12}" && mv "$releases/build-${D:0:12}.orig" "$releases/build-${D:0:12}"

if receive stage "$E"; then nope "a binary claiming another commit was staged"; else pass "a binary whose -check names another commit is refused"; fi

# --- first deploy, onto an empty account --------------------------------------

if receive stage "$A" && receive activate "$A"; then pass "first deploy of A"; else nope "first deploy of A: $(cat "$tmp/out")"; fi
if [ "$(healthz)" = "ok $A" ]; then pass "A answers /healthz"; else nope "A is not answering: $(healthz)"; fi
if grep -q "http://127.0.0.1:$port/\$1 \[P,QSA,L\]" "$docroot/.htaccess"; then pass "the .htaccess proxies to the port"; else nope "the .htaccess is wrong or missing"; fi
if grep -q 'dropin-forms' "$tmp/crontab"; then pass "drop-in forms' cron line survived"; else nope "drop-in forms' cron line was lost"; fi
if [ "$(grep -c ' # sum-app$' "$tmp/crontab")" = 2 ]; then pass "two cron lines of ours"; else nope "cron: $(cat "$tmp/crontab")"; fi
if [ "$(cat "$app/deployed-commit.txt")" = "$A" ]; then pass "deployed-commit.txt says A"; else nope "deployed-commit.txt is wrong"; fi

# --- second deploy, over a running app ------------------------------------------

if receive stage "$B" && receive activate "$B"; then pass "second deploy of B"; else nope "second deploy of B: $(cat "$tmp/out")"; fi
if [ "$(healthz)" = "ok $B" ]; then pass "B answers /healthz"; else nope "B is not answering: $(healthz)"; fi
if [ "$(grep -c ' # sum-app$' "$tmp/crontab")" = 2 ]; then pass "still two cron lines of ours"; else nope "cron lines multiplied: $(cat "$tmp/crontab")"; fi

# --- a broken release is rolled back ---------------------------------------------

if receive stage "$C"; then pass "the broken C passes -check, as a real broken release would"; else nope "C did not stage: $(cat "$tmp/out")"; fi
if receive activate "$C"; then nope "the broken C was reported live"; else pass "the broken C failed the deploy: $(grep -m1 'did not answer' "$tmp/out" || tail -n1 "$tmp/out")"; fi
if [ "$(healthz)" = "ok $B" ]; then pass "B is back and answering"; else nope "after the rollback: $(healthz)"; fi
if [ -f "$app/sum-app.failed" ]; then pass "the failed binary is kept as sum-app.failed"; else nope "no sum-app.failed"; fi
if [ "$(cat "$app/deployed-commit.txt")" = "$B" ]; then pass "deployed-commit.txt still says B"; else nope "deployed-commit.txt moved"; fi

# --- discard leaves the live app alone ---------------------------------------------

if receive stage "$D" && receive discard "$D"; then pass "staged and discarded D"; else nope "stage/discard D: $(cat "$tmp/out")"; fi
if [ ! -e "$app/releases/$D" ]; then pass "D's staged build is gone"; else nope "D's staged build is still there"; fi
if [ "$(healthz)" = "ok $B" ]; then pass "B is still live after the discard"; else nope "after the discard: $(healthz)"; fi

if receive status && grep -q "deployed  $B" "$tmp/out"; then pass "status reports B"; else nope "status: $(cat "$tmp/out")"; fi

if [ "$failures" -gt 0 ]; then
	echo "$failures receive tests failed"
	exit 1
fi
echo "receive: all cases pass"
