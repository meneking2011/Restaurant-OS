import { useEffect } from "react";
import { useLocation } from "wouter";
import { useRestaurantStore } from "@/store/restaurantStore";
import { hexToHsl } from "@/utils/colorUtils";
import { DESIGN_TOKEN_PAGES, SiteTheme } from "@/types/restaurant";

/** Maps the current URL path to the Design-Token page key used for per-page overrides. */
function pathToPageKey(path: string) {
  const match = DESIGN_TOKEN_PAGES.find((p) => p.path !== "/" && path.startsWith(p.path));
  if (match) return match.key;
  if (path === "/") return "home" as const;
  return null;
}

const SPACING_PX: Record<SiteTheme["sectionSpacing"], string> = {
  compact: "3rem",
  comfortable: "5rem",
  spacious: "7rem",
};

const CONTAINER_MAX: Record<SiteTheme["containerWidth"], string> = {
  narrow: "64rem",
  default: "80rem",
  wide: "96rem",
};

const ANIM_DURATION: Record<SiteTheme["animationSpeed"], string> = {
  slow: "1.1",
  normal: "0.7",
  fast: "0.35",
};

const HEADING_WEIGHT: Record<SiteTheme["headingWeight"], string> = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const siteTheme = useRestaurantStore((s) => s.siteTheme);
  const themeOverrides = useRestaurantStore((s) => s.themeOverrides);
  const [location] = useLocation();

  const pageKey = pathToPageKey(location);
  const override = pageKey ? themeOverrides[pageKey] : undefined;
  const theme: SiteTheme = override ? { ...siteTheme, ...override } : siteTheme;

  useEffect(() => {
    const root = document.documentElement;

    // ── Core color palette ──────────────────────────────────────────────────
    if (theme.primaryHex)    root.style.setProperty("--primary",          hexToHsl(theme.primaryHex));
    if (theme.secondaryHex)  root.style.setProperty("--secondary",        hexToHsl(theme.secondaryHex));
    if (theme.accentHex)     root.style.setProperty("--accent",           hexToHsl(theme.accentHex));
    if (theme.backgroundHex) root.style.setProperty("--background",       hexToHsl(theme.backgroundHex));
    if (theme.surfaceHex)    root.style.setProperty("--muted",            hexToHsl(theme.surfaceHex));
    if (theme.cardBgHex)     root.style.setProperty("--card",             hexToHsl(theme.cardBgHex));
    if (theme.borderHex) {
      root.style.setProperty("--border",      hexToHsl(theme.borderHex));
      root.style.setProperty("--card-border", hexToHsl(theme.borderHex));
      root.style.setProperty("--input",       hexToHsl(theme.borderHex));
    }
    if (theme.foregroundHex) root.style.setProperty("--foreground",       hexToHsl(theme.foregroundHex));
    if (theme.foregroundHex) root.style.setProperty("--card-foreground",  hexToHsl(theme.foregroundHex));
    if (theme.mutedFgHex)    root.style.setProperty("--muted-foreground", hexToHsl(theme.mutedFgHex));
    if (theme.navBgHex)      root.style.setProperty("--sidebar",          hexToHsl(theme.navBgHex));
    if (theme.buttonTextColorHex) root.style.setProperty("--primary-foreground", hexToHsl(theme.buttonTextColorHex));

    // ── Buttons (independent from Primary swatch) ───────────────────────────
    if (theme.buttonBgHex)    root.style.setProperty("--btn-bg",    hexToHsl(theme.buttonBgHex));
    if (theme.buttonHoverHex) root.style.setProperty("--btn-hover", hexToHsl(theme.buttonHoverHex));

    // ── Footer ───────────────────────────────────────────────────────────────
    if (theme.footerBgHex)   root.style.setProperty("--footer-bg", hexToHsl(theme.footerBgHex));
    if (theme.footerTextHex) root.style.setProperty("--footer-fg", hexToHsl(theme.footerTextHex));

    // ── Link / ring color (matches primary unless overridden) ───────────────
    if (theme.linkColorHex)  root.style.setProperty("--ring", hexToHsl(theme.linkColorHex));

    // ── Border radius (global) ───────────────────────────────────────────────
    root.style.setProperty("--radius", `${theme.borderRadius}px`);

    // ── Cards: independent radius + shadow ───────────────────────────────────
    root.style.setProperty("--radius-lg", `${theme.cardRadius}px`);
    const shadowAlpha = Math.min(1, Math.max(0, theme.cardShadowIntensity / 100));
    root.style.setProperty("--card-shadow", `0 8px 24px -4px rgba(0,0,0,${shadowAlpha})`);

    // ── Button border width ──────────────────────────────────────────────────
    root.style.setProperty("--btn-border-width", `${theme.buttonBorderWidth}px`);

    // ── Button shape helper consumed by global CSS ──────────────────────────
    const btnRadius =
      theme.buttonStyle === "pill"    ? "9999px" :
      theme.buttonStyle === "sharp"   ? "0px" :
      `${theme.borderRadius}px`;
    root.style.setProperty("--btn-radius", btnRadius);

    // ── Typography ────────────────────────────────────────────────────────────
    root.style.setProperty("--app-font-serif", `"${theme.fontHeading}", serif`);
    root.style.setProperty("--app-font-sans",  `"${theme.fontBody}", sans-serif`);
    root.style.setProperty("--base-font-size", `${theme.baseFontSizePx ?? 16}px`);
    root.style.fontSize = `${theme.baseFontSizePx ?? 16}px`;
    root.style.setProperty("--heading-weight", HEADING_WEIGHT[theme.headingWeight] ?? "500");

    // ── Layout ────────────────────────────────────────────────────────────────
    root.style.setProperty("--container-max-width", CONTAINER_MAX[theme.containerWidth] ?? CONTAINER_MAX.default);
    root.style.setProperty("--section-spacing", SPACING_PX[theme.sectionSpacing] ?? SPACING_PX.comfortable);

    // ── Animations ────────────────────────────────────────────────────────────
    root.style.setProperty("--anim-duration", ANIM_DURATION[theme.animationSpeed] ?? ANIM_DURATION.normal);
    document.body.classList.toggle("animations-disabled", !theme.animationsEnabled);

    // ── Light / dark body class ──────────────────────────────────────────────
    document.body.classList.toggle("light-mode", theme.lightMode);
  }, [theme]);

  return <>{children}</>;
}
