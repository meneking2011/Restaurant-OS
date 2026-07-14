---
name: RestaurantOS Design Tokens architecture
description: How per-page theme overrides and per-section media backgrounds work, and the button color/hover token trick.
---

RestaurantOS's admin "Design Tokens" page (`AdminDesignTokens.tsx`) replaced the old flat "Theme"
page with two independent, additive mechanisms:

**Per-page theme overrides** — `store.themeOverrides: Partial<Record<DesignTokenPage, Partial<SiteTheme>>>`.
`ThemeProvider` reads the current wouter route, maps it to a `DesignTokenPage` key, and merges
`siteTheme` with that page's override before applying CSS vars. A page with no override falls back
to the global theme automatically — no special-casing needed in components.

**Per-section media** — `store.sectionMedia: Record<SectionKey, SectionMediaConfig>` (fixed keys:
hero, featuredDishes, about, services, gallery, cta, footer). Each section component reads its own
entry and renders an optional background image/color + overlay layer behind existing content via
shared helpers in `utils/sectionMedia.ts` (`sectionBackgroundStyle`, `hasSectionOverlay`). This is
purely additive — it never replaces a section's existing content-level image fields (e.g. Hero
still falls back to `siteTheme.heroImageUrl`/`config.heroImage` if no section media is set).

**Why:** the user wanted independent per-section image management plus live per-page style
previews without rebuilding the site section-by-section. Making both mechanisms generic/keyed
(rather than bespoke per component) kept the change surgical.

**Button color independence trick:** Tailwind's shared `Button` `default` variant used to hardcode
`bg-primary`. To make "Buttons" a truly separate design token from "Primary", the variant was
switched to `bg-[hsl(var(--btn-bg))]` (+ a `.btn-token-hover` class reading `--btn-hover`), with
`ThemeProvider` setting those two CSS vars independently from `--primary`. Same pattern used for
Cards: `--radius-lg` is set directly (higher specificity than the Tailwind `@theme` computed value)
to give "Card Radius" independent control from the global "Border Radius" (`--radius`).
