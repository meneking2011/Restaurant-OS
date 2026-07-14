import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, UtensilsCrossed, ConciergeBell, Star,
  CalendarCheck, Settings, Flame, ExternalLink, ShoppingBag,
  Images, BarChart3, Building2, LogOut, Globe, FolderOpen,
  Navigation, FileText, Palette, Library,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRestaurantStore } from "@/store/restaurantStore";

const navItems = [
  { href: "/admin",              label: "Dashboard",       icon: LayoutDashboard, exact: true },
  { href: "/admin/website",      label: "Website",         icon: Globe },
  { href: "/admin/menu",         label: "Menu",            icon: UtensilsCrossed },
  { href: "/admin/reservations", label: "Reservations",    icon: CalendarCheck },
  { href: "/admin/orders",       label: "Orders",          icon: ShoppingBag },
  { href: "/admin/gallery",      label: "Gallery",         icon: Images },
  { href: "/admin/media",        label: "Media Library",   icon: Library },
  { href: "/admin/business",     label: "Restaurant Profile",icon: Building2 },
  { href: "/admin/design-tokens",label: "Design Tokens",   icon: Palette },
  { href: "/admin/navigation",   label: "Navigation",      icon: Navigation },
  { href: "/admin/pages",        label: "Pages",           icon: FileText },
  { href: "/admin/services",     label: "Services",        icon: ConciergeBell },
  { href: "/admin/testimonials", label: "Testimonials",    icon: Star },
  { href: "/admin/analytics",    label: "Analytics",       icon: BarChart3 },
  { href: "/admin/settings",     label: "Settings",        icon: Settings },
];

interface AdminSidebarProps {
  onLinkClick?: () => void;
}

export function AdminSidebar({ onLinkClick }: AdminSidebarProps) {
  const [location] = useLocation();
  const config       = useRestaurantStore((s) => s.config);
  const orders       = useRestaurantStore((s) => s.orders);
  const reservations = useRestaurantStore((s) => s.reservations);

  const pendingOrders = orders.filter((o) => o.status === "new").length;
  const pendingRes    = reservations.filter((r) => r.status === "pending").length;

  const badges: Record<string, number> = {
    "/admin/orders":       pendingOrders,
    "/admin/reservations": pendingRes,
  };

  return (
    <aside className="flex flex-col w-60 h-screen bg-[hsl(15,13%,7%)] border-r border-white/10 shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/20 shrink-0">
          <Flame className="w-4 h-4 text-primary" />
        </div>
        <div className="leading-tight min-w-0">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase truncate">
            {config.name}
          </p>
          <p className="text-[10px] text-foreground/40 tracking-wide">Control Center</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? location === href : location.startsWith(href);
          const badge = badges[href];
          return (
            <Link key={href} href={href} onClick={onLinkClick}>
              <span
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer justify-between",
                  isActive
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-foreground/55 hover:text-foreground hover:bg-white/5"
                )}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </span>
                {badge ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-black font-bold min-w-[18px] text-center shrink-0">
                    {badge}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer links */}
      <div className="px-2 pb-4 border-t border-white/10 pt-2 space-y-0.5 shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground/40 hover:text-foreground/70 hover:bg-white/5 transition-colors"
          onClick={onLinkClick}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Live Site
        </a>
        <Link href="/" onClick={onLinkClick}>
          <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-foreground/40 hover:text-red-400 hover:bg-red-400/5 transition-colors cursor-pointer">
            <LogOut className="w-3.5 h-3.5" />
            Exit Admin
          </span>
        </Link>
      </div>
    </aside>
  );
}
