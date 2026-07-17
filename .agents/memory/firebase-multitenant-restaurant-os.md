---
name: RestaurantOS Firebase multi-tenant architecture
description: How auth, tenant resolution, and per-tenant data sync are wired for RestaurantOS, and what remains manual (Firestore security rules).
---

RestaurantOS (artifacts/restaurant-os) uses Firebase Auth (Email/Password) + Firestore as its
permanent multi-tenant backend, layered on top of the pre-existing Zustand store rather than
replacing it.

**Architecture**
- `owners/{uid} -> { restaurantId }` maps a Firebase Auth user to exactly one tenant.
- `restaurants/{restaurantId}` holds one document with the tenant's full serialized store state
  (see `TENANT_DATA_FIELDS` in `restaurantStore.ts`).
- The first person ever to sign up claims `restaurantId = "default"` — the tenant this specific
  deployment renders publicly for anonymous visitors. Every subsequent signup is auto-provisioned
  a fresh, fully isolated `restaurantId` (via `crypto.randomUUID()`), ready for a future
  multi-storefront rollout, even though only "default" is served by this app instance today.
- `src/lib/tenantSync.ts` loads a tenant's doc into the Zustand store on login (or seeds it from
  `DEFAULT_TENANT_STATE` if new), then subscribes to store changes and debounce-writes them back.
- Anonymous/public visitors also run tenant sync against the "default" doc so the storefront
  reflects live admin edits without requiring a login.

**Why:** the user explicitly required real per-tenant data isolation and automatic restaurant-ID
resolution post-login, without asking restaurant owners to touch Firebase — but a full rebuild
into a multi-domain/subdomain-routed SaaS (each tenant getting its own live public storefront)
was out of scope for this pass.

**Hosting deploy:** Site is live at https://restaurant-os-88262.web.app. Deploy uses
`GOOGLE_APPLICATION_CREDENTIALS_JSON` Replit Secret (service account JSON for
`firebase-adminsdk-fbsvc@restaurant-os-88262.iam.gserviceaccount.com`). Script at
`scripts/deploy-firebase.sh` writes the JSON to a temp file, runs `PORT=3000 BASE_PATH=/ vite build`,
then deploys. Must blank out `FIREBASE_TOKEN` env var (`FIREBASE_TOKEN=""`) to prevent the old
deprecated token from taking precedence over the service account. firebase.json has `"site":
"restaurant-os-88262"` explicitly set — without it Firebase throws "no site name" assertion error.

**Known gap — Firestore security rules are NOT locked down by the agent.** The project starts in
Firebase's default/test-mode rules (verified via REST: anonymous reads of `restaurants/default`
succeeded with no auth). The agent has no Firebase CLI/service-account access to deploy rules
programmatically. Correct rules (owner-scoped writes, public-only-for-"default" reads) must be
pasted into the Firebase Console by the project owner — see `restaurant-os-firestore-rules.md`
for the exact ruleset. Until that happens, all tenant data in this Firebase project is publicly
readable/writable by anyone with the API key (which itself is not secret and is fine to expose).

**How to apply:** when adding features to RestaurantOS admin that read/write tenant data, always
go through the Zustand store — do not write directly to Firestore from components; `tenantSync`
is the only place that talks to Firestore, keeping the store as the single source of truth.
