#!/usr/bin/env bash
#
# scripts/secrets keygen, run for real against a throwaway secrets.env.
#
# Its first real run, on a person's machine, saved both keys and then failed
# in its EXIT trap: the trap named a variable local to the function that had
# already returned, and set -u made that an error instead of a cleanup. The
# run went red, and a copy of the new private deploy key stayed in /tmp.
#
# So this checks the three things that went wrong: the command succeeds, both
# keys land in secrets.env and nothing else changes, and the temporary
# directory is gone afterwards. TMPDIR points mktemp at a directory of the
# test's own, which must be empty at the end. ssh-keyscan is faked, so no
# server is contacted.

set -uo pipefail

repo_root="$(git rev-parse --show-toplevel)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

mkdir -p "$tmp/bin" "$tmp/mktemp"

cat >"$tmp/bin/ssh-keyscan" <<'EOF'
#!/usr/bin/env bash
echo "[example.invalid]:222 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl"
EOF
chmod 755 "$tmp/bin/ssh-keyscan"

cat >"$tmp/secrets.env" <<'EOF'
# a comment that must survive
DEPLOY_SSH_HOST=example.invalid
DEPLOY_SSH_PORT=222
APP_HOST=app.sumatx.us
EOF
chmod 600 "$tmp/secrets.env"

failures=0
pass() { printf 'ok    %s\n' "$*"; }
nope() {
	printf 'FAIL  %s\n' "$*"
	failures=$((failures + 1))
}

out="$(cd "$repo_root" && SECRETS_ENV="$tmp/secrets.env" TMPDIR="$tmp/mktemp" PATH="$tmp/bin:$PATH" \
	scripts/secrets keygen 2>&1)"
status=$?

if [ "$status" = 0 ]; then pass "keygen exits 0"; else nope "keygen exited $status: $out"; fi

if grep -q '^DEPLOY_SSH_KEY_B64=..*' "$tmp/secrets.env"; then pass "the deploy key is in secrets.env"; else nope "no deploy key in secrets.env"; fi

if grep -q '^DEPLOY_KNOWN_HOSTS_B64=..*' "$tmp/secrets.env"; then pass "the host key is pinned"; else nope "no host key in secrets.env"; fi

if grep '^DEPLOY_SSH_KEY_B64=' "$tmp/secrets.env" | cut -d= -f2- | base64 -d | grep -q 'BEGIN OPENSSH PRIVATE KEY'; then
	pass "the deploy key is a real ed25519 private key"
else
	nope "the deploy key does not decode to a private key"
fi

if grep -qx '# a comment that must survive' "$tmp/secrets.env" && grep -qx 'APP_HOST=app.sumatx.us' "$tmp/secrets.env"; then
	pass "the other lines are untouched"
else
	nope "keygen changed lines it should have left alone"
fi

if [ -z "$(ls -A "$tmp/mktemp")" ]; then pass "nothing is left in the temporary directory"; else nope "left behind: $(ls -A "$tmp/mktemp")"; fi

if [ "$(stat -c %a "$tmp/secrets.env")" = 600 ]; then pass "secrets.env is still mode 600"; else nope "secrets.env is mode $(stat -c %a "$tmp/secrets.env")"; fi

# secrets check on APP_PORT: the first deploy failed on APP_PORT=222, the SSH
# port. Every key is given a value so that only the port can fail the check.
port_check() {
	local port="$1"
	{
		grep -v '^APP_PORT=' "$tmp/secrets.env"
		printf 'DEPLOY_SSH_USER=u\nAPP_DIR=sum-app\nAPP_DOCROOT=public_html/app.sumatx.us/public\nAPP_PORT=%s\n' "$port"
	} >"$tmp/port.env"
	chmod 600 "$tmp/port.env"
	(cd "$repo_root" && SECRETS_ENV="$tmp/port.env" scripts/secrets check) >"$tmp/port.out" 2>&1
}

if port_check 8460; then pass "secrets check accepts APP_PORT=8460"; else nope "APP_PORT=8460 refused: $(cat "$tmp/port.out")"; fi
if port_check 222; then nope "secrets check accepted APP_PORT=222"; elif grep -q 'from 1024 to 65535' "$tmp/port.out"; then pass "secrets check refuses APP_PORT=222, below 1024"; else nope "APP_PORT=222 refused for another reason: $(cat "$tmp/port.out")"; fi
sed -i 's/^DEPLOY_SSH_PORT=.*/DEPLOY_SSH_PORT=2222/' "$tmp/secrets.env"
if port_check 2222; then nope "secrets check accepted APP_PORT equal to DEPLOY_SSH_PORT"; elif grep -q 'not the SSH port' "$tmp/port.out"; then pass "secrets check refuses APP_PORT equal to DEPLOY_SSH_PORT"; else nope "APP_PORT=DEPLOY_SSH_PORT refused for another reason: $(cat "$tmp/port.out")"; fi

if [ "$failures" -gt 0 ]; then
	echo "$failures keygen tests failed"
	exit 1
fi
echo "secrets keygen: all cases pass"
