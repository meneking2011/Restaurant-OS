import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search } from "lucide-react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Link } from "wouter";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const config = useRestaurantStore((s) => s.config);
  const orders = useRestaurantStore((s) => s.orders);
  const pendingOrders = orders.filter((o) => o.status === "new").length;

  return (
    <div className="flex min-h-screen bg-[hsl(15,13%,6%)] text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex items-center gap-4 px-6 py-3 bg-[hsl(15,13%,6%)] border-b border-white/10">
          <div className="flex-1 relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
            <input
              className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40"
              placeholder="Search features, reservations, or orders..."
            />
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-lg hover:bg-white/5 text-foreground/50 hover:text-foreground transition-colors">
              <Bell className="w-4 h-4" />
              {pendingOrders > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {pendingOrders}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground/70">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {config.name.charAt(0)}
              </div>
              <span className="hidden sm:block text-xs">{config.name}</span>
            </div>
            <Link href="/" target="_blank">
              <button className="px-4 py-1.5 bg-primary text-black text-sm font-semibold rounded-lg hover:bg-primary/80 transition-colors">
                Publish
              </button>
            </Link>
          </div>
        </header>

        <div className="px-6 pt-5 pb-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
              {subtitle && <p className="text-sm text-foreground/50 mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>
        </div>

        <main className="flex-1 px-6 py-5">{children}</main>

        <footer className="px-6 py-2.5 border-t border-white/5 flex items-center gap-6 text-xs text-foreground/30">
          <span>Website Visits (Month): <span className="text-foreground/50">2,450</span></span>
          <span>Storage Used: <span className="text-foreground/50">68%</span></span>
          <span>Last Published: <span className="text-foreground/50">Jul 12, 2026</span></span>
        </footer>
      </div>
    </div>
  );
}
