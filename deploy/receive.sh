#!/usr/bin/env bash
#
# The deploy receiver: the one command the deploy key may run.
#
# It is the forced command on the key GitHub holds, written into
# ~/.ssh/authorized_keys by deploy/install.sh:
#
#     restrict,command="<home>/sum-app/receive.sh" ssh-ed25519 AAAA… sum-app-deploy
#
# so whatever the key asks for, sshd runs this script instead, with what was
# asked in $SSH_ORIGINAL_COMMAND. It accepts exactly four requests:
#
#     stage <commit>      fetch that commit's build and prove it against the live config
#     activate <commit>   swap the staged build in, roll back if it does not answer
#     discard <commit>    throw a staged build away; the live app is untouched
#     status              what is live, and whether it answers
#
# and refuses everything else, including a shell.
#
# WHY IT FETCHES RATHER THAN RECEIVES (docs/13-ci-cd.md, "The shared hosting
# account"). This account also runs drop-in forms. A forced command that
# accepted an uploaded binary would narrow the key to "run any program you
# like, as this user", which is everything. So the key can only name a commit,
# and this script downloads that commit's build from the repository's GitHub
# Releases, which only the repository's writers and its own workflows can
# publish. A stolen deploy key can redeploy a build already published from
# main, and nothing more: it cannot read a file, run a command, or bring its
# own code.
#
# This file is installed and replaced only by a person (make prod-install),
# never by a deploy, for the same reason: a deploy that could replace the
# receiver could replace it with one that accepts anything.
#
# THE ORDER (docs/13-ci-cd.md, "What the deploy does"). Everything in `stage`
# leaves the live app exactly as it was, so the deploy can still stop for free
# after it, when a newer commit has reached main. `activate` is the only
# request that changes what answers.

set -euo pipefail
umask 077

# The directory this script lives in is the app's directory. RECEIVE_DIR is for
# scripts/receive-test.sh, which runs it against a throwaway home.
APP_DIR="${RECEIVE_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
cd "$APP_DIR"

APP=sum-app

# receive.conf is written by deploy/install.sh from the person's secrets.env,
# and holds no secret: which repository to fetch from, which port the
# .htaccess proxies to, the public address, and where the docroot is. It is
# parsed, never sourced, so nothing in it can run.
conf() {
	local key="$1" value
	value="$(sed -n "s/^$key=//p" receive.conf 2>/dev/null | tail -n1)"
	if [ -z "$value" ]; then
		echo "receive.conf has no $key; run make prod-install again" >&2
		exit 1
	fi
	printf '%s' "$value"
}

REPO="$(conf REPO)"
PORT="$(conf APP_PORT)"
BASE_URL="$(conf BASE_URL)"
DOCROOT="$(conf DOCROOT)"
RELEASES_URL="${RECEIVE_RELEASES_URL:-https://github.com/$REPO/releases/download}"

# What a request may name: a full commit hash, nothing shorter, nothing else.
# The hash becomes part of a path and a URL below, so this check is also what
# keeps "../" and friends out of both.
valid_commit() {
	[[ "$1" =~ ^[0-9a-f]{40}$ ]]
}

say() { printf '%s\n' "$*"; }
fail() {
	printf 'receive: %s\n' "$*" >&2
	exit 1
}

# One request at a time. The deploy workflow already runs one deploy at a
# time; this holds when a person's make deploy and the workflow overlap.
exec 8>receive.lock
flock -w 120 8 || fail "another deploy is still running on the server; try again when it finishes"

# ------------------------------------------------------------------ stage

# The files a build carries. The kit is extracted only if it holds exactly
# these, so a release cannot drop anything else into the app's directory.
KIT_FILES=(htaccess.template run.sh supervise.sh)

cmd_stage() {
	local commit="$1" tag dir tmp listing line
	tag="build-${commit:0:12}"
	dir="releases/$commit"
	tmp="releases/$commit.tmp"

	rm -rf "$tmp"
	mkdir -p "$tmp"

	say "fetching $tag from $REPO"
	for f in SHA256SUMS "$APP-linux-amd64" deploy-kit.tar.gz; do
		curl -fsSL --retry 5 --retry-all-errors --connect-timeout 20 \
			-o "$tmp/$f" "$RELEASES_URL/$tag/$f" ||
			fail "could not download $f from release $tag; was it published by the deploy workflow?"
	done

	# Integrity, against the sums published in the same release. Authenticity
	# is the release itself: TLS to github.com, and a release only the
	# repository's writers can create.
	(cd "$tmp" && sha256sum --check --strict --quiet SHA256SUMS) ||
		fail "the files in release $tag do not match its SHA256SUMS"

	listing="$(tar -tzf "$tmp/deploy-kit.tar.gz" | sort | tr '\n' ' ')"
	if [ "$listing" != "${KIT_FILES[*]} " ]; then
		fail "release $tag's kit holds unexpected files: $listing"
	fi
	tar -xzf "$tmp/deploy-kit.tar.gz" -C "$tmp" "${KIT_FILES[@]}"
	rm "$tmp/deploy-kit.tar.gz"

	mv "$tmp/$APP-linux-amd64" "$tmp/$APP"
	chmod 700 "$tmp/$APP" "$tmp/run.sh" "$tmp/supervise.sh"

	[ -f config.toml ] || fail "there is no config.toml here yet; a person puts it there with make secrets-install"

	# Pre-flight: the NEW binary against the LIVE config, while the old one is
	# still serving. A config missing a key the new binary requires fails here
	# and nothing is swapped. It must say the port the .htaccess proxies to,
	# the public address, and the very commit that was asked for: the binary
	# stamps its own commit (foundation/build), so a release whose binary is
	# not the commit it is filed under fails here.
	local summary
	summary="$("$tmp/$APP" -config config.toml -check 2>&1)" ||
		fail "the new binary refuses the live config.toml: $summary"

	for line in "listening on   127.0.0.1:$PORT" "public address $BASE_URL" "commit         $commit"; do
		grep -qxF "$line" <<<"$summary" ||
			fail "the new binary's -check does not say \"$line\"; it says:
$summary"
	done

	# There is no database yet. The backup (sqlite3 .backup, named by its
	# timestamp and rotated by the name) arrives here with the first store,
	# because docs/13-ci-cd.md puts it before the supersede check: a backup
	# taken by a deploy that then stops costs nothing.

	rm -rf "$dir"
	mv "$tmp" "$dir"

	# Only the newest staged build is kept; an older one was superseded or
	# already activated.
	for old in releases/*; do
		[ "$old" = "$dir" ] || rm -rf "$old"
	done

	say "staged $commit: it accepts the live config"
}

# ------------------------------------------------------------------ activate

running() {
	[ -x ./supervise.sh ] && ./supervise.sh status >/dev/null 2>&1
}

# healthy waits for /healthz on the loopback to name the commit. Naming the
# commit is the point: if the new process failed to bind and an old one is
# somehow still answering, a plain 200 would pass against old code.
healthy() {
	local commit="$1" body
	for _ in $(seq 1 "${RECEIVE_HEALTH_TRIES:-20}"); do
		body="$(curl -fsS --max-time 2 "http://127.0.0.1:$PORT/healthz" 2>/dev/null || true)"
		[ "$body" = "ok $commit" ] && return 0
		sleep 1
	done
	return 1
}

# start is guarded, never left to set -e. In mass-intentions an unguarded
# start that failed under set -e skipped the rollback after it, and four bad
# deploys in a row went through.
#
# 8>&- closes the receiver's own lock (receive.lock, fd 8) for the supervisor
# and so for the app it starts. Without it the app inherits the descriptor and
# holds the receiver's lock for as long as it runs, and every later request
# waits out its two minutes and fails. scripts/receive-test.sh found this: its
# second deploy hung.
start() {
	if ! ./supervise.sh start 8>&-; then
		return 1
	fi
}

install_front_end() {
	local rendered="$DOCROOT/.htaccess.new"

	[ -d "$DOCROOT" ] || fail "the docroot $DOCROOT does not exist; konsoleH creates it when the addon domain is added"

	sed "s/__APP_PORT__/$PORT/g" htaccess.template >"$rendered"
	chmod 644 "$rendered"

	if [ -f "$DOCROOT/.htaccess" ] && cmp -s "$rendered" "$DOCROOT/.htaccess"; then
		rm "$rendered"
		return 0
	fi

	if [ -f "$DOCROOT/.htaccess" ]; then
		cp -p "$DOCROOT/.htaccess" "$DOCROOT/.htaccess.prev"
	fi
	mv "$rendered" "$DOCROOT/.htaccess"
	say "the front end now proxies to 127.0.0.1:$PORT"
}

# The crontab is shared with drop-in forms. Our lines are found by their marker
# and by nothing else, and never look like another project's.
CRON_MARKER='# sum-app'

install_cron() {
	local tmp current
	tmp="$(mktemp)"
	current="$(crontab -l 2>/dev/null || true)"
	{
		grep -v " $CRON_MARKER\$" <<<"$current" || true
		printf '@reboot cd %s && ./supervise.sh start %s\n' "$APP_DIR" "$CRON_MARKER"
		printf '*/5 * * * * cd %s && ./supervise.sh watch %s\n' "$APP_DIR" "$CRON_MARKER"
	} | sed '/^$/d' >"$tmp"

	# Install it only if every line that was not ours is still there: a bug
	# here must not cost drop-in forms its watchdog.
	local theirs_before theirs_after
	theirs_before="$(grep -cv " $CRON_MARKER\$" <<<"$current" || true)"
	theirs_after="$(grep -cv " $CRON_MARKER\$" "$tmp" || true)"
	[ -z "$current" ] && theirs_before=0
	if [ "$theirs_before" != "$theirs_after" ]; then
		rm -f "$tmp"
		fail "refusing to install a crontab that would change another project's lines"
	fi

	crontab "$tmp"
	rm -f "$tmp"
}

rollback() {
	local commit="$1"
	say "rolling back: $commit did not answer on /healthz"

	./supervise.sh stop >/dev/null 2>&1 || true
	mv -f "$APP" "$APP.failed"

	local good=""
	if [ -f "$APP.last-good" ]; then
		good="$APP.last-good"
	elif [ -f "$APP.prev" ]; then
		good="$APP.prev"
	fi

	for f in run.sh supervise.sh; do
		if [ -f "$f.prev" ]; then
			cp -p "$f.prev" "$f"
		fi
	done

	if [ -z "$good" ]; then
		fail "$commit did not start and there is no earlier release to go back to; the failed binary is $APP.failed, and the last of the log is:
$(tail -n 20 "$APP.log" 2>/dev/null || true)"
	fi

	cp -p "$good" "$APP"
	if start && healthy "$(cat deployed-commit.txt 2>/dev/null || echo unknown)"; then
		fail "$commit did not answer, so $good is back and answering. The failed binary is kept as $APP.failed. The last of the log:
$(tail -n 20 "$APP.log" 2>/dev/null || true)"
	fi

	fail "$commit did not answer, and neither did $good after the rollback. The app is down; a person should look (make prod-logs)"
}

cmd_activate() {
	local commit="$1" dir="releases/$1"

	[ -x "$dir/$APP" ] || fail "$commit is not staged; stage it first"

	# The swap, under the supervisor's lock (stewards' locked()). Without it
	# the five-minute watchdog can start the OLD binary between the stop and
	# the rename, and the health check then passes against old code. The start
	# is after the lock, because supervise.sh start takes the same lock.
	(
		exec 9>"$APP.lock"
		flock -w 60 9 || fail "could not take the supervisor's lock"

		if running; then
			./supervise.sh stop
		fi

		if [ -f "$APP" ]; then
			cp -p "$APP" "$APP.prev"
		fi
		for f in run.sh supervise.sh; do
			if [ -f "$f" ]; then
				cp -p "$f" "$f.prev"
			fi
			cp -p "$dir/$f" "$f"
		done
		cp -p "$dir/htaccess.template" htaccess.template
		mv -f "$dir/$APP" "$APP"
	) || fail "the swap did not complete; the previous release is $APP.prev"

	if ! start || ! healthy "$commit"; then
		rollback "$commit"
	fi

	# Front end and schedule on every deploy, not once: a cron line that was
	# never installed went unnoticed for weeks in mass-intentions.
	install_front_end
	install_cron

	cp -p "$APP" "$APP.last-good"
	printf '%s\n' "$commit" >deployed-commit.txt
	rm -rf "$dir"

	say "live: $commit"
}

# ------------------------------------------------------------------ discard and status

cmd_discard() {
	rm -rf "releases/$1" "releases/$1.tmp"
	say "discarded $1; nothing on the server was changed"
}

cmd_status() {
	say "deployed  $(cat deployed-commit.txt 2>/dev/null || echo 'nothing yet')"
	if running; then
		say "process   $(./supervise.sh status)"
	else
		say "process   not running"
	fi
	say "healthz   $(curl -fsS --max-time 2 "http://127.0.0.1:$PORT/healthz" 2>/dev/null || echo 'no answer')"
}

# ------------------------------------------------------------------ dispatch

# What sshd passes from the forced command, or, for the tests and for a
# person running this by hand on the server, the arguments.
request="${SSH_ORIGINAL_COMMAND:-$*}"

read -r verb commit extra <<<"$request" || true

if [ -n "${extra:-}" ]; then
	fail "unexpected words after the commit in: $request"
fi

case "$verb" in
stage | activate | discard)
	valid_commit "${commit:-}" || fail "$verb needs a full 40-character commit hash"
	"cmd_$verb" "$commit"
	;;
status)
	[ -z "${commit:-}" ] || fail "status takes nothing after it"
	cmd_status
	;;
*)
	fail "this key may only stage, activate or discard a commit, or ask for status"
	;;
esac
