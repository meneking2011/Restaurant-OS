import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { StatCard } from "../components/StatCard";
import { Link } from "wouter";
import {
  UtensilsCrossed,
  CalendarCheck,
  ShoppingBag,
  Globe,
  Plus,
  Image,
  Megaphone,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shrink-0",
        checked ? "bg-primary" : "bg-white/20"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow",
          checked ? "translate-x-4.5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboard() {
  const { menuItems, reservations, orders, quickControls, updateQuickControls, activityLog, config } = useRestaurantStore();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayReservations = reservations.filter((r) => r.date === todayStr).length;
  const pendingOrders = orders.filter((o) => o.status === "new").length;
  const availableItems = menuItems.filter((m) => m.available).length;

  const controls = [
    { key: "restaurantOpen" as const, label: "Restaurant Open" },
    { key: "acceptReservations" as const, label: "Accept Reservations" },
    { key: "onlineOrders" as const, label: "Online Orders" },
    { key: "whatsapp" as const, label: "WhatsApp" },
    { key: "maintenanceMode" as const, label: "Maintenance Mode" },
  ];

  const quickActions = [
    { label: "Add Menu Item", icon: UtensilsCrossed, href: "/admin/menu" },
    { label: "Add Gallery Image", icon: Image, href: "/admin/gallery" },
    { label: "View Reservations", icon: CalendarCheck, href: "/admin/reservations" },
    { label: "Create Promotion", icon: Megaphone, href: "/admin/settings" },
  ];

  return (
    <AdminLayout
      title={`Welcome, Chef ${config.name.split(" ")[0] || "Chef"}!`}
      subtitle="Here's what's happening with your restaurant today"
    >
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Today's Reservations"
          value={todayReservations}
          subLabel={`${todayReservations} Today`}
          icon={CalendarCheck}
          trendUp
        />
        <StatCard
          label="Pending Orders"
          value={pendingOrders}
          subLabel={`${pendingOrders} Pending`}
          icon={ShoppingBag}
          trendUp={pendingOrders > 0}
        />
        <StatCard
          label="Total Menu Items"
          value={menuItems.length}
          subLabel={`${availableItems} Available`}
          icon={UtensilsCrossed}
          trendUp
        />
        <StatCard
          label="Website Status"
          value="Online"
          subLabel="Syncing"
          icon={Globe}
          trendUp
          valueClassName="text-emerald-400"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Quick Website Controls</h2>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {controls.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer select-none">
              <Toggle
                checked={quickControls[key]}
                onChange={() => updateQuickControls({ [key]: !quickControls[key] })}
              />
              <span className="text-sm text-foreground/70">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Recent Activity Timeline
          </h2>
          <div className="space-y-4">
            {activityLog.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                  <div className="w-px flex-1 bg-white/10 mt-1" />
                </div>
                <div className="pb-4 min-w-0">
                  <p className="text-sm text-foreground/80">
                    <span className="font-medium text-foreground">{entry.message}</span>
                    {" · "}
                    <span className="text-foreground/40 text-xs">{timeAgo(entry.timestamp)}</span>
                  </p>
                  <p className="text-xs text-foreground/50 mt-0.5 truncate">{entry.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            Quick Access Actions
          </h2>
          <div className="space-y-2.5">
            {quickActions.map(({ label, icon: Icon, href }) => (
              <Link key={href} href={href}>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/30 rounded-lg text-sm text-foreground/70 hover:text-foreground transition-all text-left">
                  <div className="w-7 h-7 rounded-full border border-primary/30 flex items-center justify-center text-primary shrink-0">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {label}
                </button>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Live Website Preview
          </h2>
          <div className="rounded-lg overflow-hidden border border-white/10 mb-3 bg-black/30" style={{ height: 160 }}>
            <iframe
              src="/"
              className="w-full h-full pointer-events-none"
              style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}
              title="Live site preview"
            />
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-foreground/70 hover:text-foreground transition-colors"
          >
            Open Preview
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
