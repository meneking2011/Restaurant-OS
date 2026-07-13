import { Link } from "wouter";
import { Flame } from "lucide-react";
import { useRestaurantStore } from "@/store/restaurantStore";

export function Footer() {
  const config   = useRestaurantStore((s) => s.config);
  const navLinks = useRestaurantStore((s) => s.navLinks);

  const visibleLinks = navLinks.filter((l) => l.visible);

  return (
    <footer className="bg-background border-t border-border py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
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

        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {config.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
