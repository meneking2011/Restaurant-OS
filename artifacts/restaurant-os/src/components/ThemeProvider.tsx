import { useEffect } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { hexToHsl } from "@/utils/colorUtils";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const siteTheme = useRestaurantStore((s) => s.siteTheme);

  useEffect(() => {
    const root = document.documentElement;

    if (siteTheme.primaryHex) {
      root.style.setProperty("--primary", hexToHsl(siteTheme.primaryHex));
    }
    if (siteTheme.secondaryHex) {
      root.style.setProperty("--secondary", hexToHsl(siteTheme.secondaryHex));
    }
    if (siteTheme.accentHex) {
      root.style.setProperty("--accent", hexToHsl(siteTheme.accentHex));
    }
  }, [siteTheme.primaryHex, siteTheme.secondaryHex, siteTheme.accentHex]);

  return <>{children}</>;
}
