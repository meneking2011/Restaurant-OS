import { ReactNode, useState, useRef, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search, Menu as MenuIcon, X, ShoppingBag, CalendarCheck, Clock, Undo2, Redo2 } from "lucide-react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationsPanel({ onClose }: { onClose: () => void }) {
  const orders       = useRestaurantStore((s) => s.orders);
  const reservations = useRestaurantStore((s) => s.reservations);
  const activityLog  = useRestaurantStore((s) => s.activityLog);
  const { updateOrderStatus, updateReservationStatus } = useRestaurantStore();

  const newOrders       = orders.filter((o) => o.status === "new");
  const pendingRes      = reservations.filter((r) => r.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-[hsl(15,13%,9%)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <p className="text-sm font-semibold text-foreground">Notifications</p>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {newOrders.length > 0 && (
          <div className="px-4 py-2 border-b border-white/5">
            <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-2">New Orders</p>
            {newOrders.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-blue-400/15 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-3 h-3 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground truncate">{o.customerName}</p>
                    <p className="text-[10px] text-foreground/40">{timeAgo(o.orderedAt)}</p>
                  </div>
                </div>
                <Link href="/admin/orders" onClick={onClose}>
                  <button
                    onClick={() => updateOrderStatus(o.id, "preparing")}
                    className="shrink-0 text-[10px] px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                  >
                    Accept
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {pendingRes.length > 0 && (
          <div className="px-4 py-2 border-b border-white/5">
            <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-2">Pending Reservations</p>
            {pendingRes.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-amber-400/15 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-foreground truncate">{r.name} · {r.guests} guests</p>
                    <p className="text-[10px] text-foreground/40">{r.date} at {r.time}</p>
                  </div>
                </div>
                <Link href="/admin/reservations" onClick={onClose}>
                  <button
                    onClick={() => updateReservationStatus(r.id, "confirmed")}
                    className="shrink-0 text-[10px] px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                  >
                    Confirm
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {preparingOrders.length > 0 && (
          <div className="px-4 py-2 border-b border-white/5">
            <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-2">In Preparation</p>
            {preparingOrders.slice(0, 2).map((o) => (
              <div key={o.id} className="flex items-center gap-2 py-2">
                <div className="w-6 h-6 rounded-full bg-emerald-400/15 flex items-center justify-center shrink-0">
                  <Clock className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-foreground truncate">{o.customerName}</p>
                  <p className="text-[10px] text-foreground/40">Preparing · {timeAgo(o.orderedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 py-2">
          <p className="text-[10px] text-foreground/40 uppercase tracking-widest mb-2">Recent Activity</p>
          {activityLog.slice(0, 4).map((entry) => (
            <div key={entry.id} className="flex gap-2 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-foreground/80 truncate">{entry.message}</p>
                <p className="text-[10px] text-foreground/40 truncate">{entry.detail}</p>
                <p className="text-[10px] text-foreground/30">{timeAgo(entry.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>

        {newOrders.length === 0 && pendingRes.length === 0 && preparingOrders.length === 0 && activityLog.length === 0 && (
          <div className="px-4 py-8 text-center text-foreground/30 text-sm">
            No notifications
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-2.5">
        <Link href="/admin/orders" onClick={onClose}>
          <button className="w-full text-center text-xs text-primary hover:underline">View all orders</button>
        </Link>
      </div>
    </div>
  );
}

function SearchPanel({ query, onClose }: { query: string; onClose: () => void }) {
  const [, navigate] = useLocation();
  const { menuItems, orders, reservations, services, testimonials } = useRestaurantStore();
  const q = query.toLowerCase().trim();

  if (!q) return null;

  const menuResults    = menuItems.filter((m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)).slice(0, 3);
  const orderResults   = orders.filter((o) => o.customerName.toLowerCase().includes(q) || o.id.includes(q)).slice(0, 3);
  const resResults     = reservations.filter((r) => r.name.toLowerCase().includes(q) || r.phone.includes(q)).slice(0, 3);
  const serviceResults = services.filter((s) => s.title.toLowerCase().includes(q)).slice(0, 2);

  const total = menuResults.length + orderResults.length + resResults.length + serviceResults.length;
  if (total === 0) {
    return (
      <div className="absolute left-0 top-full mt-1 w-full max-w-md bg-[hsl(15,13%,9%)] border border-white/10 rounded-xl shadow-2xl z-50 px-4 py-6 text-center text-sm text-foreground/40">
        No results for "{query}"
      </div>
    );
  }

  const go = (href: string) => { navigate(href); onClose(); };

  return (
    <div className="absolute left-0 top-full mt-1 w-full max-w-md bg-[hsl(15,13%,9%)] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
      {menuResults.length > 0 && (
        <div className="border-b border-white/5">
          <p className="text-[10px] text-foreground/40 uppercase tracking-widest px-4 pt-3 pb-1">Menu Items</p>
          {menuResults.map((m) => (
            <button key={m.id} onClick={() => go("/admin/menu")} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
              <img src={m.image} alt={m.name} className="w-8 h-8 rounded object-cover shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">{m.name}</p>
                <p className="text-[10px] text-foreground/40">${m.price} · {m.category}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {orderResults.length > 0 && (
        <div className="border-b border-white/5">
          <p className="text-[10px] text-foreground/40 uppercase tracking-widest px-4 pt-3 pb-1">Orders</p>
          {orderResults.map((o) => (
            <button key={o.id} onClick={() => go("/admin/orders")} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
              <ShoppingBag className="w-4 h-4 text-foreground/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">{o.customerName}</p>
                <p className="text-[10px] text-foreground/40">#{o.id.replace("ord-", "")} · {o.status}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {resResults.length > 0 && (
        <div className="border-b border-white/5">
          <p className="text-[10px] text-foreground/40 uppercase tracking-widest px-4 pt-3 pb-1">Reservations</p>
          {resResults.map((r) => (
            <button key={r.id} onClick={() => go("/admin/reservations")} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
              <CalendarCheck className="w-4 h-4 text-foreground/40 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-foreground truncate">{r.name}</p>
                <p className="text-[10px] text-foreground/40">{r.date} · {r.time} · {r.status}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {serviceResults.length > 0 && (
        <div>
          <p className="text-[10px] text-foreground/40 uppercase tracking-widest px-4 pt-3 pb-1">Services</p>
          {serviceResults.map((s) => (
            <button key={s.id} onClick={() => go("/admin/services")} className="w-full px-4 py-2.5 hover:bg-white/5 transition-colors text-left">
              <p className="text-sm text-foreground">{s.title}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const config       = useRestaurantStore((s) => s.config);
  const orders       = useRestaurantStore((s) => s.orders);
  const reservations = useRestaurantStore((s) => s.reservations);
  const { undoChange, redoChange, _historyPast, _historyFuture } = useRestaurantStore();

  const pendingOrders = orders.filter((o) => o.status === "new").length;
  const pendingRes    = reservations.filter((r) => r.status === "pending").length;
  const totalAlerts   = pendingOrders + pendingRes;

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [searchOpen,   setSearchOpen]   = useState(false);

  const notifRef  = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current  && !notifRef.current.contains(e.target as Node))  setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex min-h-screen bg-[hsl(15,13%,6%)] text-foreground">
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 z-10">
            <AdminSidebar onLinkClick={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 flex items-center gap-2 px-3 md:px-6 py-3 bg-[hsl(15,13%,6%)] border-b border-white/10">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-foreground/50 hover:text-foreground transition-colors shrink-0"
            aria-label="Open navigation"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 relative hidden sm:block" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30 pointer-events-none" />
            <input
              className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40"
              placeholder="Search menu, orders, reservations…"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
            />
            {searchOpen && searchQuery && (
              <SearchPanel query={searchQuery} onClose={() => { setSearchOpen(false); setSearchQuery(""); }} />
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Undo / Redo */}
            <button
              onClick={undoChange}
              disabled={_historyPast.length === 0}
              title="Undo last change"
              className={cn(
                "p-2 rounded-lg transition-colors",
                _historyPast.length > 0
                  ? "hover:bg-white/5 text-foreground/60 hover:text-foreground"
                  : "text-foreground/20 cursor-not-allowed"
              )}
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redoChange}
              disabled={_historyFuture.length === 0}
              title="Redo last change"
              className={cn(
                "p-2 rounded-lg transition-colors",
                _historyFuture.length > 0
                  ? "hover:bg-white/5 text-foreground/60 hover:text-foreground"
                  : "text-foreground/20 cursor-not-allowed"
              )}
            >
              <Redo2 className="w-4 h-4" />
            </button>

            {/* Notifications bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className={cn(
                  "relative p-2 rounded-lg hover:bg-white/5 transition-colors",
                  notifOpen ? "text-primary" : "text-foreground/50 hover:text-foreground"
                )}
              >
                <Bell className="w-4 h-4" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalAlerts > 9 ? "9+" : totalAlerts}
                  </span>
                )}
              </button>
              {notifOpen && <NotificationsPanel onClose={() => setNotifOpen(false)} />}
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground/70">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                {config.name.charAt(0)}
              </div>
              <span className="hidden sm:block text-xs truncate max-w-[80px]">{config.name}</span>
            </div>

            <a href="/" target="_blank" rel="noopener noreferrer">
              <button className="px-3 md:px-4 py-1.5 bg-primary text-black text-xs md:text-sm font-semibold rounded-lg hover:bg-primary/80 transition-colors whitespace-nowrap">
                Publish
              </button>
            </a>
          </div>
        </header>

        <div className="px-4 md:px-6 pt-5 pb-1">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">{title}</h1>
              {subtitle && <p className="text-xs md:text-sm text-foreground/50 mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
          </div>
        </div>

        <main className="flex-1 px-4 md:px-6 py-5 overflow-x-hidden">{children}</main>

        <footer className="px-4 md:px-6 py-2.5 border-t border-white/5 flex items-center gap-6 text-xs text-foreground/30">
          <span>RestaurantOS <span className="text-foreground/50">v2.0</span></span>
          <span className="ml-auto">All changes saved automatically</span>
        </footer>
      </div>
    </div>
  );
}
