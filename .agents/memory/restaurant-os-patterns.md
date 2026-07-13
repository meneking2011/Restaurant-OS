---
name: RestaurantOS notification/gating patterns
description: Conventions for admin notifications, closed-state page gating, and map embeds in the RestaurantOS artifact (and similar admin+customer store-driven apps).
---

**Admin notifications are just `activityLog` entries.** `NotificationsPanel` (in `AdminLayout`) reads `orders`, `reservations`, and `activityLog` from the Zustand store — it has no separate notification system. Any new customer-facing action that should notify the admin (new review, new contact message, etc.) just needs to call `addActivityLog({ message, detail })` or push an entry inline where the record is created.
**Why:** avoids building a parallel notification mechanism; keeps one source of truth for "things the admin should see."
**How to apply:** when adding any new customer-submitted content type, always add an `activityLog` push at the point of creation, not just at read time.

**Closed-state gating uses a per-page early-return pattern, not a global route guard.** `ReservationsPage` and `CheckoutPage` each have an early `if (!quickControls.xxx) return <PausedScreen/>` before their main render, keyed off individual `quickControls` flags (`acceptReservations`, `onlineOrders`, and now `restaurantOpen`). `MenuPage` instead disables just the "Add to Order" buttons + shows a banner, since menu browsing should stay available even when closed.
**Why:** the product requirement was "browse everything except ordering/reservations/menu-ordering" — a global route guard would have over-blocked.
**How to apply:** for a new "gate this page when X" requirement, check the flag inside the page component itself; don't add a router-level guard.

**No paid Maps API is configured, and none should be added without asking.** For "show a map" requirements, use the free/keyless OpenStreetMap iframe embed (`https://www.openstreetmap.org/export/embed.html?bbox=...&marker=lat,lng`) driven by manually-entered `lat`/`lng` on `RestaurantConfig.address`, and use a plain Google Maps URL (`google.com/maps/search` or `/dir`) for "open in Maps" links/buttons.
**Why:** no Maps integration/API key exists in this project; OSM embeds require no key and satisfy "live map preview" asks without new billing.
**How to apply:** reach for the OSM embed + Google Maps deep link pattern first for any future "show/find us on a map" feature, rather than proposing a paid Maps integration.
