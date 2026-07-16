# RestaurantOS

A reusable, sellable restaurant website platform: a premium customer-facing site (home, menu/ordering, reservations, locate us, contact, about, services) paired with an admin dashboard ("Restaurant Control Center") for the restaurant owner to manage content, orders, reservations, and settings without touching code.

## Run & Operate

- `pnpm install` — install all workspace dependencies
- `pnpm --filter @workspace/restaurant-os run dev` — customer site + admin panel (workflow: `artifacts/restaurant-os: web`)
- `pnpm --filter @workspace/api-server run dev` — API server (workflow: `artifacts/api-server: API Server`) — currently only exposes a health route; the restaurant app does not call it yet (see Gotchas)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (already provisioned)
- Admin panel: visit `/admin` on the restaurant-os artifact

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Customer/admin app: React + Vite, wouter (routing), Zustand (state, persisted to localStorage), react-hook-form + zod, Tailwind CSS v4, framer-motion
- API: Express 5 (scaffolded, not yet wired to the frontend)
- DB: PostgreSQL + Drizzle ORM (provisioned, not yet used by the frontend)

## Where things live

- `artifacts/restaurant-os/src/pages` — customer-facing pages (Home, Menu, Reservations, Checkout, LocateUs, Contact, About, Services)
- `artifacts/restaurant-os/src/admin/pages` — admin/RCC pages (Dashboard, Website, BusinessDetails, Menu, Reservations, Orders, Gallery, Theme, Navigation, Pages, Services, Testimonials, Analytics, Settings)
- `artifacts/restaurant-os/src/store/restaurantStore.ts` — single source of truth for all restaurant content/settings (config, menu, services, testimonials, reservations, orders, quickControls, activityLog, deliverySettings, reservationSettings, navLinks); persisted via zustand `persist` to localStorage
- `artifacts/restaurant-os/src/store/cartStore.ts` — customer cart state
- `artifacts/restaurant-os/src/data/mockData.ts` — seed/default content (menu items, services, gallery); `testimonials` intentionally seeded empty — reviews come only from real customer submissions

## Architecture decisions

- All restaurant data lives in one Zustand store (`restaurantStore.ts`) persisted to the browser's localStorage — there is no backend persistence yet, so admin edits and customer orders/reservations/reviews are local to each browser and are lost if storage is cleared or another device is used.
- Settings that logically overlap across admin sections (e.g. reservation settings shown in both the Reservations page and Business Details → Reservations tab) read/write the same store fields, so edits in either place stay in sync automatically.
- `quickControls.restaurantOpen` gates only ordering-related actions (add-to-cart on Menu, checkout, and new reservations) — browsing (menu, about, gallery, contact, etc.) always stays available, even when closed.
- The activity log (`activityLog` in the store) doubles as the admin notification feed — new orders, reservations, status changes, contact messages, and reviews all push an entry that the admin bell/dashboard reads directly.

## Product

Customer site: browse menu, place orders (delivery-style checkout), make reservations, view business info/map, contact the restaurant (with a choice to follow up via phone or email), and leave reviews. Admin/RCC: manage menu, services, gallery, testimonials, orders, reservations (with a collapsible settings panel), business details (branding, contact, hours, socials, delivery, reservations), site theme/navigation/custom pages, and view analytics built from real store data (revenue, orders, reservations, ratings, visits).

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The API server (`artifacts/api-server`) and Postgres DB are provisioned but unused — the restaurant app is 100% client-side/localStorage. Don't assume data survives across browsers/devices, or that admin changes are visible to other visitors, until this is wired up.
- Before assuming a requested feature is missing, check `restaurantStore.ts` and the relevant page/admin component first — most "admin control center" features (reviews, notifications, closed-state gating, collapsible reservation settings, contact send options) are already implemented.
- There are no card/wallet/OAuth payment gateways. Payment is exclusively Manual Bank Transfer — customers upload a receipt, admin verifies or rejects it. All payment gateway types (`stripe`, `paystack`, `flutterwave`, `square`, `paypal`) have been fully removed.
- Order status now includes `out_for_delivery` and `delivered` (replaces `completed`). Payment status is its own field: `pending_receipt` → `pending_verification` → `verified` | `rejected`.
- Bank accounts are managed in the store as `bankAccounts: BankAccount[]` (not as `config.bankAccount`). The admin can add/edit/delete/enable/disable multiple accounts in Settings → Payments & Checkout.
- Receipt files are stored as base64 data URLs inside the order object in localStorage. This works for small receipts but will balloon storage for many high-res uploads — a backend upload solution is the right long-term fix.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
