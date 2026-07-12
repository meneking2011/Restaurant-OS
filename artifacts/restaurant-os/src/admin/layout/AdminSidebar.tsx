import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ConciergeBell,
  Star,
  CalendarCheck,
  Settings,
  Flame,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/services", label: "Services", icon: ConciergeBell },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/reservations", label: "Reservations", icon: CalendarCheck },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const [location] = useLocation();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[hsl(15,13%,7%)] border-r border-white/10">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/20">
          <Flame className="w-4 h-4 text-primary" />
        </div>
        <div className="leading-tight">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            Restaurant OS
          </p>
          <p className="text-[10px] text-foreground/40 tracking-wide">
            Website Manager
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? location === href
            : location.startsWith(href);
          return (
            <Link key={href} href={href}>
              <span
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer",
                  isActive
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground/40 hover:text-foreground/70 hover:bg-white/5 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Live Site
        </a>
      </div>
    </aside>
  );
}
