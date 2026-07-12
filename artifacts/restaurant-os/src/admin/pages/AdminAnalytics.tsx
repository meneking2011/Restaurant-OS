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

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MOCK_VISITS = [120, 145, 98, 210, 340, 480, 390];
const MOCK_ORDERS = [4, 6, 3, 9, 14, 20, 16];
const maxVisit = Math.max(...MOCK_VISITS);
const maxOrder = Math.max(...MOCK_ORDERS);

export default function AdminAnalytics() {
  const { orders, reservations, testimonials } = useRestaurantStore();

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
      subtitle="Performance overview — last 7 days (demo data)"
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
          <p className="text-xs text-foreground/40 mb-5">Demo data — connect analytics to see live numbers</p>
          <div className="flex items-end gap-2 h-40">
            {MOCK_VISITS.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-foreground/40">{v}</span>
                <div
                  className="w-full rounded-t-sm bg-primary/30 hover:bg-primary/50 transition-colors"
                  style={{ height: `${(v / maxVisit) * 100}%` }}
                />
                <span className="text-[10px] text-foreground/40">{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-primary" />
            Orders Per Day (This Week)
          </h2>
          <p className="text-xs text-foreground/40 mb-5">Demo data</p>
          <div className="flex items-end gap-2 h-40">
            {MOCK_ORDERS.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-foreground/40">{v}</span>
                <div
                  className="w-full rounded-t-sm bg-emerald-500/30 hover:bg-emerald-500/50 transition-colors"
                  style={{ height: `${(v / maxOrder) * 100}%` }}
                />
                <span className="text-[10px] text-foreground/40">{DAYS[i]}</span>
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
              { label: "Active Menu Items", value: `${useRestaurantStore.getState().menuItems.filter((m) => m.available).length} items` },
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
