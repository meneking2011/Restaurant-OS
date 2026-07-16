---
name: RestaurantOS notification/gating patterns
description: activityLog-as-notifications convention, closed-state page gating, keyless map embeds, toggle sync, Firestore undefined fix
---

## Toggle / Quick Controls Sync
All on/off toggles (restaurantOpen, acceptReservations, onlineOrders, whatsapp, maintenanceMode) read from a single `quickControls` object in the Zustand store and call `updateQuickControls`. They are already synced — any change in Dashboard, Website page, or BusinessDetails/Delivery/Reservations tabs is immediately reflected everywhere. No extra wiring needed.

**Why:** The store is the single source of truth; all toggle components subscribe to the same `quickControls` selector.

## Firestore: Never Send Undefined
Firestore throws if any field value is `undefined`. Two defences are in place:
1. `BankAccountForm.handleSave()` — optional fields (sortCode, iban, swiftBic) use `|| ""` not `|| undefined`.
2. `tenantSync.ts` — `sanitizeForFirestore()` recursively strips `undefined` keys from the entire state object before every `setDoc` call.

**Why:** Bank account optional fields were previously saved as `undefined`, causing Firestore write failures.

**How to apply:** Any new optional string field passed to Firestore must use `""` as the empty fallback, never `undefined`. The tenantSync sanitizer catches escapes, but BankAccountForm is the known origin.

## Force Publish
`forceSyncNow()` exported from `tenantSync.ts` writes the current store state to Firestore immediately (no debounce). The AdminWebsite "Publish Changes" button calls it. Individual section save buttons already commit to the store → Firestore via the 600ms debounce in tenantSync; force sync is only needed for explicit user-triggered publish.

## Google Sign-In
`loginWithGoogle` in `auth.tsx`:
- Tries `signInWithPopup` first.
- On `auth/popup-blocked`, falls back to `signInWithRedirect` (popup is blocked in iframes like Replit preview pane).
- `getRedirectResult(auth)` is called on mount to collect redirect sign-in results.
- Shows a clear error for `auth/unauthorized-domain` (Firebase console needs the Replit/production domain added to authorized domains).

## Analytics Removed
`AdminAnalytics.tsx` file still exists but is no longer routed or linked. Route removed from App.tsx, nav item removed from AdminSidebar.tsx, module card removed from AdminWebsite.tsx.

## Activity Log / Notifications Convention
`activityLog` in the store is the single notification/history source. New order, receipt uploaded, payment verified/rejected events are all pushed to activityLog. Admin bell and Dashboard timeline both read from it.

## Closed-State Page Gating
`quickControls.maintenanceMode` gates all non-admin routes in App.tsx Router function — shows MaintenancePage. `quickControls.onlineOrders` gates checkout. `quickControls.acceptReservations` gates the reservation form.

## Keyless Map Embeds
Google Maps URL stored in `config.googleMapsUrl`. The LocateUs page and Contact page render a plain `<a href={googleMapsUrl}>` link — no embed, no API key required.

## Password Manager Support
Login form (`AdminLogin.tsx`) has:
- `<form autoComplete="on">`
- `id="login-email" name="email"` on email input
- `id="login-password" name="password"` on password input
- `autoComplete="email"` / `autoComplete="current-password"` or `"new-password"` depending on mode
