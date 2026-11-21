# Every target is here so that there is one command per purpose and no habit of
# piping one through a filter written in a hurry. `make help` lists them.
#
# So far this holds what CLAUDE.md sections 0 and 2 rely on: the check after
# editing Go, finding a symbol, and the tools both need. The test, lint, build,
# deploy and secrets targets arrive with the scaffold, as docs/13-ci-cd.md
# lists them.

GO ?= go

# Pinned, and bumped on purpose. staticcheck 2026.2 (v0.8.x) is the first
# release that reads Go 1.27; 2026.1 fails on every package with "export data
# version 5 is greater than maximum supported version 2", which reads like a
# fault in the code being checked. gopls v0.24 is the first built for 1.27.
STATICCHECK_VERSION := v0.8.2
GOPLS_VERSION       := v0.24.0

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
