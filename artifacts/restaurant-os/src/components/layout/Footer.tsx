import { Link } from "wouter";
import { Flame } from "lucide-react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { sectionBackgroundStyle, hasSectionOverlay } from "@/utils/sectionMedia";

export function Footer() {
  const config      = useRestaurantStore((s) => s.config);
  const navLinks    = useRestaurantStore((s) => s.navLinks);
  const customPages = useRestaurantStore((s) => s.customPages);
  const media       = useRestaurantStore((s) => s.sectionMedia.footer);

  // Merge store footer links + custom pages that opted into footer
  const customFooterLinks = customPages
    .filter((p) => p.visible && p.showInFooter && !p.externalUrlEnabled)
    .map((p) => ({ id: p.id, label: p.name, href: p.slug, visible: true, openInNewTab: false }));

  const customExternalFooterLinks = customPages
    .filter((p) => p.visible && p.showInFooter && p.externalUrlEnabled && p.externalUrl)
    .map((p) => ({ id: p.id, label: p.name, href: p.externalUrl!, visible: true, openInNewTab: true }));

  const visibleLinks = [
    ...navLinks.filter((l) => l.visible),
    ...customFooterLinks,
    ...customExternalFooterLinks,
  ];

  return (
    <footer
      className="relative border-t py-12 md:py-16 overflow-hidden"
      style={{
        backgroundColor: "hsl(var(--footer-bg, var(--background)))",
        color: "hsl(var(--footer-fg, var(--muted-foreground)))",
        borderColor: "hsl(var(--border))",
        ...sectionBackgroundStyle(media),
      }}
    >
      {hasSectionOverlay(media) && (
        <div className="absolute inset-0" style={{ backgroundColor: media.overlayColor, opacity: media.overlayOpacity / 100 }} />
      )}
      <div className="relative container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

          <div className="flex justify-center md:justify-start">
            <Link href="/" className="flex items-center gap-2 group">
              <Flame className="w-6 h-6 text-primary group-hover:text-foreground transition-colors" />
              <span className="font-serif text-xl font-bold tracking-widest uppercase text-foreground">
                {config.name}
              </span>
            </Link>
          </div>

          <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 md:gap-x-8">
            {visibleLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                {...(link.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-sm font-medium tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase"
              >
                {link.label}
              </Link>
            ))}
          </nav>

        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-xs" style={{ color: "hsl(var(--footer-fg, var(--muted-foreground)))" }}>
          &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
