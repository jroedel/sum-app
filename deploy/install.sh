#!/usr/bin/env bash
#
# Install, or reinstall, the deploy receiver on the server. Run by a person,
# through make prod-install, which streams this script over the person's own
# ssh with:
#
#     install.sh <app dir> <docroot> <port> <base url> <repo> <deploy public key>
#
# and has already put deploy/receive.sh at <app dir>/receive.sh.new.
#
# It is the only thing that changes the receiver or the key's restriction, and
# a deploy can never run it (docs/13-ci-cd.md, "The shared hosting account").
# It is safe to run again: every step replaces its own earlier result.

set -euo pipefail
umask 077

app_dir="$1" docroot="$2" port="$3" base_url="$4" repo="$5" pubkey="$6"

say() { printf '%s\n' "$*"; }
fail() {
	printf 'install: %s\n' "$*" >&2
	exit 1
}

cd "$HOME"

# The app's directory must not be inside the web root, or Apache could serve
# config.toml, the log and the database straight off the disk.
case "$app_dir" in
public_html | public_html/*) fail "$app_dir is inside public_html; the app's directory must be outside the web root" ;;
/* | *..*) fail "write the app's directory relative to the home, without ..: $app_dir" ;;
esac

[[ "$port" =~ ^[0-9]+$ ]] || fail "the port must be a number: $port"
[[ "$pubkey" =~ ^ssh-ed25519\ [A-Za-z0-9+/=]+(\ .*)?$ ]] || fail "the deploy public key is not an ssh-ed25519 key"

# `restrict` in authorized_keys needs OpenSSH 7.2 or later. The server side is
# not visible from a shell; the client on the same machine is the best
# evidence there is, and an sshd that did not know the option would refuse the
# key outright rather than let it through unrestricted.
version="$(ssh -V 2>&1 | sed -n 's/^OpenSSH_\([0-9]*\)\.\([0-9]*\).*/\1 \2/p')"
read -r major minor <<<"${version:-0 0}"
if [ "$major" -lt 7 ] || { [ "$major" -eq 7 ] && [ "$minor" -lt 2 ]; }; then
	fail "this server's OpenSSH ($(ssh -V 2>&1)) predates the restrict option"
fi

mkdir -p "$app_dir"
chmod 700 "$app_dir"

[ -f "$app_dir/receive.sh.new" ] || fail "$app_dir/receive.sh.new is missing; run make prod-install, which sends it first"
mv -f "$app_dir/receive.sh.new" "$app_dir/receive.sh"
chmod 700 "$app_dir/receive.sh"

cat >"$app_dir/receive.conf" <<EOF
# Written by make prod-install; run it again rather than editing this file.
REPO=$repo
APP_PORT=$port
BASE_URL=$base_url
DOCROOT=$HOME/$docroot
EOF
chmod 600 "$app_dir/receive.conf"

# The key, behind the receiver. Any earlier line for this key is replaced, so
# the restriction can only ever be the one written here.
mkdir -p .ssh
chmod 700 .ssh
touch .ssh/authorized_keys
chmod 600 .ssh/authorized_keys

key_body="$(cut -d' ' -f1,2 <<<"$pubkey")"
line="restrict,command=\"$HOME/$app_dir/receive.sh\" $key_body sum-app-deploy"

tmp="$(mktemp .ssh/authorized_keys.XXXXXX)"
grep -v ' sum-app-deploy$' .ssh/authorized_keys >"$tmp" || true
printf '%s\n' "$line" >>"$tmp"
chmod 600 "$tmp"
mv "$tmp" .ssh/authorized_keys

say "the receiver is installed at ~/$app_dir/receive.sh"
say "the deploy key can now run only the receiver"

if [ -d "$docroot" ]; then
	say "the docroot ~/$docroot exists"
else
	say "WARNING: ~/$docroot does not exist yet. Add app.sumatx.us as an addon domain in konsoleH with that document root (deploy/README.md); the first deploy needs it"
fi
