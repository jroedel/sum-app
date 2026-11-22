#!/usr/bin/env bash
#
# The names the workflows find each other by.
#
# deploy.yml runs on `workflow_run` of the workflow NAMED in its trigger, and
# downloads the artifact NAMED in its step. Rename either in ci.yml and every
# deploy stops, or fails to find its binary, with nothing red to say why.
# GitHub cannot check this; this test does.

set -uo pipefail

cd "$(git rev-parse --show-toplevel)" || exit 1

ci_name="$(sed -n 's/^name: *//p' .github/workflows/ci.yml | head -n1)"
follows="$(sed -n 's/^ *workflows: *\[\(.*\)\] *$/\1/p' .github/workflows/deploy.yml | head -n1)"

uploaded="$(grep -A3 'actions/upload-artifact' .github/workflows/ci.yml | sed -n 's/^ *name: *//p' | head -n1)"
downloaded="$(grep -A3 'actions/download-artifact' .github/workflows/deploy.yml | sed -n 's/^ *name: *//p' | head -n1)"

status=0

if [ -z "$ci_name" ] || [ "$ci_name" != "$follows" ]; then
	echo "FAIL  ci.yml is named \"$ci_name\", but deploy.yml follows \"$follows\""
	status=1
else
	echo "ok    deploy.yml follows the workflow named \"$ci_name\""
fi

if [ -z "$uploaded" ] || [ "$uploaded" != "$downloaded" ]; then
	echo "FAIL  ci.yml uploads \"$uploaded\", but deploy.yml downloads \"$downloaded\""
	status=1
else
	echo "ok    the artifact is \"$uploaded\" on both sides"
fi

exit "$status"
