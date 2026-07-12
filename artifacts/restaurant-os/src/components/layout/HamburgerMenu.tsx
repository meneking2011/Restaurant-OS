import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";
import { SiTiktok, SiFacebook, SiInstagram } from "react-icons/si";
import { AnimatePresence, motion } from "framer-motion";
import { restaurantConfig } from "@/data/mockData";
import { cn } from "@/utils/cn";
import { useCartStore } from "@/store/cartStore";
import { Badge } from "@/components/ui/badge";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/menu", label: "MENU" },
  { href: "/about", label: "ABOUT US" },
  { href: "/locate-us", label: "LOCATE US" },
  { href: "/contact", label: "CONNECT WITH US" },
  { href: "/services", label: "OUR SERVICES" },
  { href: "/checkout", label: "ORDER NOW" },
  { href: "/reservations", label: "MAKE RESERVATIONS" },
];

export function HamburgerMenu({ isOpen, onClose }: HamburgerMenuProps) {
  const [location] = useLocation();
  const itemCount = useCartStore(state => state.getItemCount());

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
              {restaurantConfig.name}
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

          {/* Links */}
          <nav className="flex-1 flex flex-col items-center justify-center gap-6 md:gap-8 overflow-y-auto py-8">
            {navLinks.map((link) => {
              const isActive = location === link.href;
              const isOrderNow = link.href === "/checkout";

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "font-serif text-3xl md:text-5xl lg:text-6xl font-medium tracking-wider uppercase transition-all duration-300 relative group flex items-center gap-4",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  data-testid={`link-menu-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <span className="absolute -left-12 top-1/2 -translate-y-1/2 text-primary opacity-50 hidden md:block">✦</span>
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

          {/* Footer area */}
          <div className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative">
            <div className="flex gap-8">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <SiTiktok className="w-6 h-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <SiFacebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <SiInstagram className="w-6 h-6" />
              </a>
            </div>
            
            <div className="text-muted-foreground text-sm uppercase tracking-widest hidden md:block">
              {restaurantConfig.tagline}
            </div>

            <span className="text-primary text-4xl absolute bottom-10 right-10 opacity-30 pointer-events-none hidden md:block">
              ✦
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
