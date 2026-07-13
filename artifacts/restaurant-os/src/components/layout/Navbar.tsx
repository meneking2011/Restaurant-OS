import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Flame, Menu as MenuIcon } from "lucide-react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/utils/cn";
import { HamburgerMenu } from "./HamburgerMenu";

const PAGE_NAMES: Record<string, string> = {
  "/menu": "Menu",
  "/about": "About Us",
  "/services": "Our Services",
  "/reservations": "Reservations",
  "/locate-us": "Locate Us",
  "/contact": "Connect With Us",
  "/checkout": "Checkout",
};

export function Navbar() {
  const { config } = useRestaurantStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  const currentPageName = PAGE_NAMES[location] ?? null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-background/80 backdrop-blur-md",
          scrolled ? "border-b border-border py-3" : "py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-8 max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" data-testid="link-home-logo">
            <Flame className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" data-testid="logo-icon" />
            <span className="font-serif text-xl md:text-2xl font-bold tracking-widest uppercase text-foreground" data-testid="logo-text">
              {config.name}
            </span>
          </Link>

          {currentPageName && (
            <span className="hidden md:block absolute left-1/2 -translate-x-1/2 font-serif text-xs tracking-[0.3em] uppercase text-primary/80 pointer-events-none select-none">
              {currentPageName}
            </span>
          )}

          <button
            onClick={() => setMenuOpen(true)}
            className="relative text-foreground hover:text-primary transition-colors focus:outline-none p-2"
            aria-label="Open menu"
            data-testid="button-open-menu"
          >
            <MenuIcon className="w-7 h-7" />
            {itemCount > 0 && (
              <span
                className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center leading-none"
                data-testid="badge-cart-count"
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
