import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { StatCard } from "../components/StatCard";
import {
  TrendingUp,
  ShoppingBag,
  CalendarCheck,
  Star,
  DollarSign,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Builds the last 7 calendar days (oldest → newest) as ISO date keys + labels,
// so the charts always reflect the current week rather than a fixed demo set.
function lastSevenDays() {
  const days: { key: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: d.toISOString().slice(0, 10), label: DAY_LABELS[d.getDay()] });
  }
  return days;
}

export default function AdminAnalytics() {
  const { orders, reservations, testimonials, visitLog, menuItems } = useRestaurantStore();

  const days = lastSevenDays();

  const ordersPerDay = days.map(({ key }) => orders.filter((o) => o.orderedAt.slice(0, 10) === key).length);
  const visitsPerDay = days.map(({ key }) => visitLog.filter((v) => v.slice(0, 10) === key).length);
  const maxOrder = Math.max(1, ...ordersPerDay);
  const maxVisit = Math.max(1, ...visitsPerDay);
  const totalVisitsThisWeek = visitsPerDay.reduce((a, b) => a + b, 0);

  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const avgOrderValue =
    orders.filter((o) => o.status === "completed").length > 0
      ? totalRevenue / orders.filter((o) => o.status === "completed").length
      : 0;

  const avgRating =
    testimonials.length > 0
      ? testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length
      : 0;

  const totalGuests = reservations
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + r.guests, 0);

  return (
    <AdminLayout
      title="Analytics"
      subtitle="Performance overview — live data from the last 7 days"
    >
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          trend="Completed orders"
          trendUp
        />
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          trend={`${orders.filter((o) => o.status === "completed").length} completed`}
          trendUp
        />
        <StatCard
          label="Total Reservations"
          value={reservations.length}
          icon={CalendarCheck}
          trend={`${totalGuests} guests hosted`}
          trendUp
        />
        <StatCard
          label="Avg Rating"
          value={avgRating.toFixed(1)}
          icon={Star}
          trend={`from ${testimonials.length} reviews`}
          trendUp
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Website Visits (This Week)
          </h2>
          <p className="text-xs text-foreground/40 mb-5">{totalVisitsThisWeek} visits tracked in the last 7 days</p>
          <div className="flex items-end gap-2 h-40">
            {visitsPerDay.map((v, i) => (
              <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-foreground/40">{v}</span>
                <div
                  className="w-full rounded-t-sm bg-primary/30 hover:bg-primary/50 transition-colors min-h-[2px]"
                  style={{ height: `${(v / maxVisit) * 100}%` }}
                />
                <span className="text-[10px] text-foreground/40">{days[i].label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            Orders Per Day (This Week)
          </h2>
          <p className="text-xs text-foreground/40 mb-5">Live count of real orders placed each day</p>
          <div className="flex items-end gap-2 h-40">
            {ordersPerDay.map((v, i) => (
              <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-foreground/40">{v}</span>
                <div
                  className="w-full rounded-t-sm bg-emerald-500/30 hover:bg-emerald-500/50 transition-colors min-h-[2px]"
                  style={{ height: `${(v / maxOrder) * 100}%` }}
                />
                <span className="text-[10px] text-foreground/40">{days[i].label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Revenue by Order Status
          </h2>
          {(["completed", "preparing", "new", "ready", "cancelled"] as const).map((status) => {
            const rev = orders.filter((o) => o.status === status).reduce((s, o) => s + o.totalAmount, 0);
            const pct = totalRevenue > 0 ? (rev / (totalRevenue || 1)) * 100 : 0;
            const colors: Record<string, string> = {
              completed: "bg-primary",
              preparing: "bg-amber-400",
              new: "bg-blue-400",
              ready: "bg-emerald-400",
              cancelled: "bg-red-400",
            };
            return (
              <div key={status} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="capitalize text-foreground/60">{status}</span>
                  <span className="text-foreground">{formatCurrency(rev)}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", colors[status])} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Key Metrics
          </h2>
          <div className="space-y-4">
            {[
              { label: "Average Order Value", value: formatCurrency(avgOrderValue) },
              { label: "Avg Guest Rating", value: `${avgRating.toFixed(1)} / 5.0` },
              { label: "Confirmed Reservations", value: reservations.filter((r) => r.status === "confirmed").length.toString() },
              { label: "Pending Reservations", value: reservations.filter((r) => r.status === "pending").length.toString() },
              { label: "Active Menu Items", value: `${menuItems.filter((m) => m.available).length} items` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-foreground/60">{label}</span>
                <span className="text-sm font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
