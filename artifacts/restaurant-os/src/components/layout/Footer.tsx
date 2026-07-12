import { Link } from "wouter";
import { Flame, MapPin } from "lucide-react";
import { restaurantConfig } from "@/data/mockData";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          
          <div className="flex justify-center md:justify-start">
            <Link href="/" className="flex items-center gap-2 group">
              <Flame className="w-6 h-6 text-primary group-hover:text-foreground transition-colors" />
              <span className="font-serif text-xl font-bold tracking-widest uppercase text-foreground">
                {restaurantConfig.name}
              </span>
            </Link>
          </div>

          <div className="flex justify-center gap-6 md:gap-8">
            <Link href="/about" className="text-sm font-medium tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase">
              About
            </Link>
            <Link href="/services" className="text-sm font-medium tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase">
              Services
            </Link>
            <Link href="/contact" className="text-sm font-medium tracking-wider text-muted-foreground hover:text-primary transition-colors uppercase">
              Contact
            </Link>
          </div>

          <div className="flex justify-center md:justify-end items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            <MapPin className="w-5 h-5" />
            <Link href="/locate-us" className="text-sm font-medium tracking-wider uppercase">
              Locate Us
            </Link>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {restaurantConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
