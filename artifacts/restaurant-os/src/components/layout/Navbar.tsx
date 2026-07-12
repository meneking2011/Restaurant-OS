import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Flame, Menu as MenuIcon } from "lucide-react";
import { restaurantConfig } from "@/data/mockData";
import { cn } from "@/utils/cn";
import { HamburgerMenu } from "./HamburgerMenu";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
          scrolled ? "border-b border-border py-4" : "py-6"
        )}
      >
        <div className="container mx-auto px-4 md:px-8 max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Flame className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" data-testid="logo-icon" />
            <span className="font-serif text-2xl font-bold tracking-widest uppercase text-foreground" data-testid="logo-text">
              {restaurantConfig.name}
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="text-foreground hover:text-primary transition-colors focus:outline-none p-2"
            aria-label="Open menu"
            data-testid="button-open-menu"
          >
            <MenuIcon className="w-8 h-8" />
          </button>
        </div>
      </header>

      <HamburgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
