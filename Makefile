# Every target is here so that there is one command per purpose and no habit of
# piping one through a filter written in a hurry. `make help` lists them.
#
# The CI, deploy and secrets targets arrive with the pull requests that add
# them, as docs/13-ci-cd.md lists them.

GO   ?= go
APP  := sum-app
MAIN := ./cmd/sum-app

# Every Go source, tracked or not, so a new file is checked before it is added.
# Worktrees under .claude are other checkouts and not ours to judge.
GOFILES = $(shell find . -name '*.go' -not -path './.git/*' -not -path './.claude/*')

# Pinned, and bumped on purpose. staticcheck 2026.2 (v0.8.x) is the first
# release that reads Go 1.27; 2026.1 fails on every package with "export data
# version 5 is greater than maximum supported version 2", which reads like a
# fault in the code being checked. gopls v0.24 is the first built for 1.27.
STATICCHECK_VERSION := v0.8.2
GOPLS_VERSION       := v0.24.0

# ShellCheck, which scripts/check-scripts runs over every shell script, and
# those are the scripts that hold the deploy key. Pinned, because a new release
# adds checks and two versions would disagree about what is clean. Its releases
# publish no checksums file, so the archive's SHA-256 is recorded here (the same
# pin as eumaeus). actionlint and govulncheck need no line here: they are `tool`
# lines in go.mod, so `go tool` runs the pinned version and Dependabot bumps it.
SHELLCHECK_VERSION ?= 0.11.0
SHELLCHECK_SHA256  ?= 8c3be12b05d5c177a04c29e3c78ce89ac86f1595681cab149b65b97c4e227198
TOOLS_DIR          ?= $(HOME)/.local/bin
CURL               ?= curl -fsSL --retry 5 --retry-all-errors --connect-timeout 20

.DEFAULT_GOAL := help

.PHONY: help
help: ## List every target
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[1m%-16s\033[0m %s\n", $$1, $$2}'

# ---------------------------------------------------------------- navigation

.PHONY: sym
sym: ## Where is a Go symbol, and what is its declaration? (make sym NAME=Member)
	@if [ -z "$(NAME)" ]; then echo "usage: make sym NAME=Member" >&2; exit 2; fi
	@scripts/sym "$(NAME)"

.PHONY: outline
outline: ## Every symbol in one file, with line numbers (make outline FILE=path/to/x.go)
	@if [ -z "$(FILE)" ]; then echo "usage: make outline FILE=path/to/x.go" >&2; exit 2; fi
	@gopls symbols "$(FILE)" | awk '{printf "%s:%s\n", "$(FILE)", $$0}'

.PHONY: dev-tools
dev-tools: ## Install the Go tooling this Makefile navigates and checks with, pinned
	$(GO) install golang.org/x/tools/gopls@$(GOPLS_VERSION)
	$(GO) install honnef.co/go/tools/cmd/staticcheck@$(STATICCHECK_VERSION)

.PHONY: tools
tools: ## Install the pinned ShellCheck into $(TOOLS_DIR), checked against its hash
	@mkdir -p $(TOOLS_DIR)
	@tmp=$$(mktemp -d) && trap 'rm -rf "$$tmp"' EXIT && \
		base="shellcheck-v$(SHELLCHECK_VERSION).linux.x86_64.tar.xz" && \
		$(CURL) -o "$$tmp/$$base" "https://github.com/koalaman/shellcheck/releases/download/v$(SHELLCHECK_VERSION)/$$base" && \
		(cd "$$tmp" && echo "$(SHELLCHECK_SHA256)  $$base" | sha256sum -c --quiet -) && \
		tar xJf "$$tmp/$$base" -C "$$tmp" "shellcheck-v$(SHELLCHECK_VERSION)/shellcheck" && \
		install -m 0755 "$$tmp/shellcheck-v$(SHELLCHECK_VERSION)/shellcheck" $(TOOLS_DIR)/shellcheck
	@echo "installed $(TOOLS_DIR)/shellcheck $$($(TOOLS_DIR)/shellcheck --version | sed -n 's/^version: *//p')"
	@command -v shellcheck >/dev/null || echo "NOTE: $(TOOLS_DIR) is not on your PATH"

# ---------------------------------------------------------------- the checks

# One package rather than ./..., deliberately. The module is new and clean, so
# the bound costs nothing today; it is here because the day staticcheck stops
# being clean, the rule that makes a new finding in your own code the only line
# you see is already the habit.
.PHONY: go-check
go-check: ## Format, vet, staticcheck, build and test one package (make go-check PKG=./business/domain/member/memberbus)
	@if [ -z "$(PKG)" ]; then echo "usage: make go-check PKG=./business/domain/member/memberbus" >&2; exit 2; fi
	@if [ ! -f go.mod ]; then echo "there is no go.mod yet: the scaffold adds it" >&2; exit 2; fi
	@gofmt -s -w $(PKG)
	@$(GO) vet $(PKG)/...
	@if command -v staticcheck >/dev/null 2>&1; then \
		staticcheck $(PKG)/...; \
	else \
		echo "staticcheck is not installed; run make dev-tools" >&2; exit 1; \
	fi
	@$(GO) build ./...
	@GO=$(GO) scripts/go-test $(PKG)/...

.PHONY: lint
lint: vet fmt-check ## go vet and the gofmt check, on the whole module

.PHONY: vet
vet: ## go vet the whole module
	@$(GO) vet ./...

.PHONY: fmt
fmt: ## Format all Go sources in place
	@gofmt -s -w $(GOFILES)

# Lists the files rather than only failing, so the fix is one `make fmt` away
# and nobody has to run gofmt -l to find out what it meant.
.PHONY: fmt-check
fmt-check: ## Fail, naming the files, if any Go source is not gofmt -s clean
	@out="$$(gofmt -s -l $(GOFILES))"; \
	if [ -n "$$out" ]; then echo "not gofmt -s clean (run make fmt):"; echo "$$out"; exit 1; fi

.PHONY: test-unit
test-unit: ## The Go tests, with the race detector. No network
	@GO=$(GO) scripts/go-test -race ./...

.PHONY: shell-test
shell-test: ## Every scripts/*-test.sh; a new one runs with nothing to register
	@scripts/shell-test

# The JavaScript, as stewards runs it: plain ES modules, no npm, Node's own
# test runner (scripts/js-test). Today that is the mock-ups' scripts under
# docs/prototype/; the browser tests build this server and drive a headless
# Chrome against it, so they see the real header policy.
.PHONY: test-js
test-js: ## The JavaScript's unit tests, under Node's own test runner. No browser
	@scripts/js-test unit

.PHONY: test-browser
test-browser: ## The pages with scripts, in headless Chrome against a server built for it
	@scripts/js-test browser

.PHONY: check-scripts
check-scripts: ## Every shell script parsed by its own shell, then the pinned ShellCheck
	@SHELLCHECK_VERSION=$(SHELLCHECK_VERSION) scripts/check-scripts

# actionlint knows GitHub's expression syntax and each action's inputs, so a
# misspelt `if:` or a `needs:` naming a job that does not exist fails here
# rather than in a run that silently skips the step. It runs ShellCheck over
# every `run:` block too, when ShellCheck is on the path.
.PHONY: check-workflows
check-workflows: ## The workflows, checked by the pinned actionlint
	@$(GO) tool actionlint

.PHONY: vuln-check
vuln-check: ## Dependencies and the standard library against the Go vulnerability database (needs network)
	@$(GO) tool govulncheck ./...

.PHONY: secrets-template-check
secrets-template-check: ## secrets.env.example documents exactly the keys scripts/secrets sends
	@scripts/secrets template-check

.PHONY: test
test: lint test-unit shell-test test-js test-browser check-scripts check-workflows secrets-template-check ## Everything CI runs that needs no network, in CI's order

# ---------------------------------------------------------------- build and run

# Static, because the server has no Go and gets this one file: a binary linked
# against the build machine's glibc dies on the host with a loader error. The
# check is on the file itself, so a cgo dependency that sneaks in later fails
# here and not on the server. -trimpath keeps this machine's paths out of the
# binary. The commit is stamped by the go command (foundation/build), so there
# are no -X flags to forget.
.PHONY: release
release: ## The static linux/amd64 binary the server runs, checked static
	@CGO_ENABLED=0 GOOS=linux GOARCH=amd64 $(GO) build -trimpath -ldflags='-s -w' -o $(APP)-linux-amd64 $(MAIN)
	@file $(APP)-linux-amd64 | grep -q 'statically linked' \
		|| { echo "$(APP)-linux-amd64 is not statically linked:"; file $(APP)-linux-amd64; exit 1; }
	@echo "built $(APP)-linux-amd64 ($$(du -h $(APP)-linux-amd64 | cut -f1))"

# config.toml is gitignored; the example is a working local config.
.PHONY: dev
dev: ## Run the app on this machine, from config.toml (made from the example if missing)
	@[ -f config.toml ] || { cp config.example.toml config.toml && chmod 600 config.toml && echo "made config.toml from config.example.toml"; }
	@$(GO) run $(MAIN) -config config.toml

# The scripts and template a release carries beside the binary. Exactly these
# three names: deploy/receive.sh refuses a kit holding anything else.
.PHONY: deploy-kit
deploy-kit: ## The deploy kit a release carries (deploy.yml runs this)
	@tar -czf deploy-kit.tar.gz -C deploy htaccess.template run.sh supervise.sh

# ---------------------------------------------------------------- secrets and production
#
# For a person at a terminal. .claude/settings.json denies every target below
# except secrets-check to agents (CLAUDE.md section 6). The first-time order is
# in deploy/README.md.

# The commands below that send something from this checkout (prod-install,
# secrets-install, secrets-push, deploy) refuse unless it is GitHub's main;
# this is the fix they name. It never discards uncommitted work.
.PHONY: sync
sync: ## Switch to main and fast-forward it to GitHub's (refuses if there are uncommitted changes)
	@scripts/sync

.PHONY: secrets-check
secrets-check: ## Is secrets.env complete and private? Names what is missing; shows no value
	@scripts/secrets check

.PHONY: secrets-keygen
secrets-keygen: ## Mint the deploy key and pin the server's host key, into secrets.env
	@scripts/secrets keygen

.PHONY: secrets-push
secrets-push: ## The deploy secrets and variables to GitHub, read back
	@scripts/secrets push

.PHONY: secrets-install
secrets-install: ## config.toml to the server, checked by the live binary, over your own ssh
	@scripts/secrets install

.PHONY: prod-install
prod-install: ## Install or reinstall the deploy receiver, and restrict the deploy key to it
	@scripts/prod install

.PHONY: prod-ports
prod-ports: ## Free loopback ports on the shared account, to choose APP_PORT
	@scripts/prod ports

.PHONY: prod-status
prod-status: ## What is live on the server, and whether it answers
	@scripts/prod status

.PHONY: prod-logs
prod-logs: ## The end of the app's log on the server (LINES=200 for more)
	@scripts/prod logs

.PHONY: prod-restart
prod-restart: ## Stop and start the app on the server
	@scripts/prod restart

.PHONY: deploy-status
deploy-status: ## One verdict across this machine, GitHub, the server and the public site
	@scripts/prod deploy-status

# By hand, through the same receiver and the same supersede check as the
# workflow. The commit's build must already be published as build-<sha12>,
# which the workflow does; normally just re-run the workflow instead.
.PHONY: deploy
deploy: ## Deploy a published build by hand (make deploy SHA=<40-character commit>)
	@if [ -z "$(SHA)" ]; then echo "usage: make deploy SHA=<40-character commit>" >&2; exit 2; fi
	@scripts/prod deploy "$(SHA)"
