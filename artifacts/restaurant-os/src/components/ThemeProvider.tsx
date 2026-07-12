import { useEffect } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { hexToHsl } from "@/utils/colorUtils";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const siteTheme = useRestaurantStore((s) => s.siteTheme);

  useEffect(() => {
    const root = document.documentElement;

    // ── Core color palette ──────────────────────────────────────────────────
    if (siteTheme.primaryHex)    root.style.setProperty("--primary",          hexToHsl(siteTheme.primaryHex));
    if (siteTheme.accentHex)     root.style.setProperty("--accent",           hexToHsl(siteTheme.accentHex));
    if (siteTheme.backgroundHex) root.style.setProperty("--background",       hexToHsl(siteTheme.backgroundHex));
    if (siteTheme.cardBgHex)     root.style.setProperty("--card",             hexToHsl(siteTheme.cardBgHex));
    if (siteTheme.foregroundHex) root.style.setProperty("--foreground",       hexToHsl(siteTheme.foregroundHex));
    if (siteTheme.foregroundHex) root.style.setProperty("--card-foreground",  hexToHsl(siteTheme.foregroundHex));
    if (siteTheme.mutedFgHex)    root.style.setProperty("--muted-foreground", hexToHsl(siteTheme.mutedFgHex));
    if (siteTheme.navBgHex)      root.style.setProperty("--sidebar",          hexToHsl(siteTheme.navBgHex));
    if (siteTheme.buttonTextColorHex) root.style.setProperty("--primary-foreground", hexToHsl(siteTheme.buttonTextColorHex));

    // ── Link / ring color (matches primary unless overridden) ───────────────
    if (siteTheme.linkColorHex)  root.style.setProperty("--ring", hexToHsl(siteTheme.linkColorHex));

    // ── Border radius ────────────────────────────────────────────────────────
    root.style.setProperty("--radius", `${siteTheme.borderRadius}px`);

    // ── Button border width ──────────────────────────────────────────────────
    root.style.setProperty("--btn-border-width", `${siteTheme.buttonBorderWidth}px`);

    // ── Button shape helper consumed by global CSS ──────────────────────────
    const btnRadius =
      siteTheme.buttonStyle === "pill"    ? "9999px" :
      siteTheme.buttonStyle === "sharp"   ? "0px" :
      `${siteTheme.borderRadius}px`;
    root.style.setProperty("--btn-radius", btnRadius);

    // ── Font families ────────────────────────────────────────────────────────
    root.style.setProperty("--app-font-serif", `"${siteTheme.fontHeading}", serif`);
    root.style.setProperty("--app-font-sans",  `"${siteTheme.fontBody}", sans-serif`);

    // ── Light / dark body class ──────────────────────────────────────────────
    document.body.classList.toggle("light-mode", siteTheme.lightMode);
  }, [
    siteTheme.primaryHex, siteTheme.accentHex, siteTheme.backgroundHex,
    siteTheme.cardBgHex, siteTheme.foregroundHex, siteTheme.mutedFgHex,
    siteTheme.navBgHex, siteTheme.linkColorHex, siteTheme.buttonTextColorHex,
    siteTheme.buttonStyle, siteTheme.borderRadius, siteTheme.buttonBorderWidth,
    siteTheme.fontHeading, siteTheme.fontBody, siteTheme.lightMode,
  ]);

  return <>{children}</>;
}
