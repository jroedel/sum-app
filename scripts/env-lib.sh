# shellcheck shell=bash
#
# Reading and writing secrets.env, shared by scripts/secrets and scripts/prod.
#
# secrets.env is PARSED, never sourced (docs/13-ci-cd.md, "Secrets"): each line
# is KEY=VALUE, taken literally, so a value with a $ or a backtick in it is
# data and not code. Blank lines and lines starting with # are ignored. There
# is no quoting: a value runs to the end of its line, and every value is
# single-line by design (keys are base64), so the file survives a round trip
# through a password vault.

ENV_FILE="${SECRETS_ENV:-secrets.env}"

declare -gA ENV=()

# load_env reads ENV_FILE into the ENV array. A missing file is an empty one;
# callers that need it say so.
load_env() {
	ENV=()
	[ -f "$ENV_FILE" ] || return 0

	local line key
	while IFS= read -r line || [ -n "$line" ]; do
		case "$line" in
		'' | '#'*) continue ;;
		esac
		key="${line%%=*}"
		[[ "$key" =~ ^[A-Z][A-Z0-9_]*$ ]] || continue
		ENV["$key"]="${line#*=}"
	done <"$ENV_FILE"
}

# set_env rewrites one key in ENV_FILE, or appends it, leaving every other line
# (comments included) as it was. The value travels in a variable and a file,
# never on a command line, where ps would show it.
set_env() {
	local key="$1" value="$2" tmp line found=0
	tmp="$(mktemp "${ENV_FILE}.XXXXXX")"
	chmod 600 "$tmp"

	if [ -f "$ENV_FILE" ]; then
		while IFS= read -r line || [ -n "$line" ]; do
			if [[ "$line" == "$key="* ]]; then
				printf '%s=%s\n' "$key" "$value"
				found=1
			else
				printf '%s\n' "$line"
			fi
		done <"$ENV_FILE" >"$tmp"
	fi

	[ "$found" = 1 ] || printf '%s=%s\n' "$key" "$value" >>"$tmp"

	mv "$tmp" "$ENV_FILE"
	ENV["$key"]="$value"
}

# need fails, naming every key in the list that has no value.
need() {
	local missing=() key
	for key in "$@"; do
		[ -n "${ENV[$key]:-}" ] || missing+=("$key")
	done
	if [ "${#missing[@]}" -gt 0 ]; then
		printf 'secrets.env has no value for: %s\n' "${missing[*]}" >&2
		return 1
	fi
}

# prod_ssh runs a command on the server as the PERSON: the account's user,
# host and port from secrets.env, the way the sibling projects reach it, with
# the person's own ssh keys or agent. Never with the sum-app deploy key, which
# lives only in secrets.env and GitHub, is never written to ~/.ssh, and can
# only reach the receiver anyway.
#
# Not BatchMode, so a key passphrase or a password can be typed when ssh asks.
prod_ssh() {
	ssh -o ConnectTimeout=20 -p "${ENV[DEPLOY_SSH_PORT]}" "${ENV[DEPLOY_SSH_USER]}@${ENV[DEPLOY_SSH_HOST]}" "$@"
}
