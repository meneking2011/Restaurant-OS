---
name: Store Extensions
description: New fields added to restaurantStore beyond the original spec; always use store values, never hardcode
---

## New Store Fields

### `deliverySettings: DeliverySettings`
- fee, taxRate, minOrder, estimatedTime, radiusKm
- **CheckoutPage** reads `deliverySettings.taxRate` and `deliverySettings.fee` — never hardcode 0.08 or 15
- **AdminSettings PaymentsTab** and **AdminBusinessDetails DeliveryTab** both write to `updateDeliverySettings()`

### `reservationSettings: ReservationSettings`
- maxPartySize, slotDurationMins, advanceNoticeHours, maxAdvanceDays, confirmationMessage
- Written by **AdminBusinessDetails ReservationsTab** via `updateReservationSettings()`

### `navLinks: NavLink[]`
- Array of `{ id, label, href, visible, openInNewTab }`
- Written by **AdminNavigation** via `updateNavLinks()`
- Read by **HamburgerMenu** — it renders only `visible: true` links from store; never uses hardcoded array

## Key rules
- HamburgerMenu uses `useRestaurantStore` for name, tagline, navLinks, and config.socials — never imports from mockData
- Social icons: SiTiktok, SiFacebook, SiInstagram, SiX (NOT SiTwitter — doesn't exist in this react-icons version)
- HeroSection MENU button: do NOT use `variant="destructive"` — use no variant with inline style override for primaryHex color
