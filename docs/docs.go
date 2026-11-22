// Package docs carries into the binary the two things in this folder that are
// pages rather than prose: the clickable mock-ups (prototype/) and the brand
// sheet (design/brand.html). app/domain/docsapp serves them.
//
// A Go file among the documents is unusual, and it is here for one reason: an
// embed pattern cannot reach outside its own package's directory, and CLAUDE.md
// puts the mock-ups under docs/prototype/. The rejected alternative was a
// Makefile step copying them into app/, which is two copies that drift. When
// the real app replaces the mock-ups (prototype/README.md), the Prototype
// variable and its pattern go, and this file goes with the last of them.
//
// The patterns name what is served, so nothing else in docs/ (the documents,
// the whiteboard photo, the mock-ups' *_test.mjs files) is in the binary.
package docs

import "embed"

// Prototype is the mock-ups: pages, styles, scripts, the icon sprite, the
// placeholder seal, the fonts and their licences.
//
//go:embed prototype/*.html prototype/*.css prototype/*.js prototype/*.svg prototype/*.txt prototype/fonts
var Prototype embed.FS

// Brand is the brand sheet and its one script. Its stylesheets and fonts are
// the mock-ups', which it reaches as ../prototype/.
//
//go:embed design/brand.html design/brand.js
var Brand embed.FS
