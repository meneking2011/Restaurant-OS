import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";
import { SiTiktok, SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useCartStore } from "@/store/cartStore";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Badge } from "@/components/ui/badge";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SOCIAL_ICON_MAP: Record<string, React.ElementType> = {
  instagram: SiInstagram,
  facebook:  SiFacebook,
  tiktok:    SiTiktok,
  twitter:   SiX,
  x:         SiX,
};

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const [location] = useLocation();
  const itemCount  = useCartStore((state) => state.getItemCount());
  const config      = useRestaurantStore((s) => s.config);
  const navLinks    = useRestaurantStore((s) => s.navLinks);
  const customPages = useRestaurantStore((s) => s.customPages);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  // Merge store nav links + custom pages that opted into nav
  const customNavLinks = customPages
    .filter((p) => p.visible && p.showInNav && !p.externalUrlEnabled)
    .map((p) => ({ id: p.id, label: p.name, href: p.slug, visible: true, openInNewTab: false }));

  const customExternalLinks = customPages
    .filter((p) => p.visible && p.showInNav && p.externalUrlEnabled && p.externalUrl)
    .map((p) => ({ id: p.id, label: p.name, href: p.externalUrl!, visible: true, openInNewTab: true }));

  const visibleLinks = [
    ...navLinks.filter((l) => l.visible),
    ...customNavLinks,
    ...customExternalLinks,
  ];

  // Resolve social links from store config.socials
  const socialLinks = config.socials.filter((s) => s.url && s.url.trim() !== "");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col justify-between"
          data-testid="hamburger-menu-overlay"
        >
          {/* Header */}
          <div className="p-6 md:p-10 flex justify-between items-center">
            <span className="font-serif text-xl md:text-2xl font-bold tracking-widest text-foreground uppercase">
              {config.name}
            </span>
            <button
              onClick={onClose}
              className="text-foreground hover:text-primary transition-colors p-2"
              aria-label="Close menu"
              data-testid="button-close-menu"
            >
              <X className="w-10 h-10" />
            </button>
          </div>

          {/* Nav links from store */}
          <nav className="flex-1 flex flex-col items-center justify-center gap-5 md:gap-7 overflow-y-auto py-6">
            {visibleLinks.map((link) => {
              const isActive   = location === link.href;
              const isOrderNow = link.href === "/checkout";

              return (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={onClose}
                  {...(link.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={cn(
                    "font-serif text-3xl md:text-5xl lg:text-6xl font-medium tracking-wider uppercase transition-all duration-300 relative group flex items-center gap-4",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`link-menu-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary hidden md:block" />
                  )}
                  {isOrderNow && itemCount > 0 && (
                    <Badge variant="default" className="text-sm rounded-full w-8 h-8 flex items-center justify-center p-0">
                      {itemCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer — socials + tagline */}
          <div className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social icons from store */}
            <div className="flex gap-8">
              {socialLinks.length > 0 ? (
                socialLinks.map((s) => {
                  const platformKey = s.platform.toLowerCase();
                  const Icon = SOCIAL_ICON_MAP[platformKey] ?? SiInstagram;
                  return (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={s.platform}
                    >
                      <Icon className="w-6 h-6" />
                    </a>
                  );
                })
              ) : (
                /* Fallback placeholder icons when no socials configured */
                <>
                  <span className="text-muted-foreground/30"><SiTiktok className="w-6 h-6" /></span>
                  <span className="text-muted-foreground/30"><SiFacebook className="w-6 h-6" /></span>
                  <span className="text-muted-foreground/30"><SiInstagram className="w-6 h-6" /></span>
                </>
              )}
            </div>

            <div className="text-muted-foreground text-sm uppercase tracking-widest hidden md:block">
              {config.tagline}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
