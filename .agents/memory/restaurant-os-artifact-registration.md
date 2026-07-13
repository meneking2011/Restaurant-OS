---
name: RestaurantOS artifact not registered
description: listArtifacts() returns empty for artifacts/restaurant-os despite a valid artifact.toml; no managed workflow exists.
---

`artifacts/restaurant-os` has a valid `artifact.toml` but `listArtifacts()` returns empty and there is no managed `artifacts/restaurant-os: web` workflow. This blocks `Screenshot` with `appPreview` (requires a registered artifact) and blocks proper preview-pane routing.

**Why:** unclear root cause — the artifact was apparently never registered through the artifacts flow, only scaffolded on disk.

**How to apply:** as a stopgap, run `pnpm install` at the workspace root, then manually configure a workflow (e.g. `restaurant-os-web`) running `PORT=<port> BASE_PATH=/ pnpm --filter @workspace/restaurant-os run dev`, and use `Screenshot` with `externalUrl` against the dev domain instead of `appPreview` (note: `externalUrl` ignores `viewportSize`, so true mobile-viewport screenshots aren't obtainable this way). If proper artifact registration is needed, investigate re-running the artifacts skill's registration step rather than continuing to patch around it.
