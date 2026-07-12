import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { StatCard } from "../components/StatCard";
import {
  UtensilsCrossed,
  CalendarCheck,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { menuItems, reservations, testimonials } = useRestaurantStore();

  const pending = reservations.filter((r) => r.status === "pending").length;
  const confirmed = reservations.filter((r) => r.status === "confirmed").length;
  const cancelled = reservations.filter((r) => r.status === "cancelled").length;
  const avgRating =
    testimonials.length > 0
      ? (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1)
      : "—";

  const upcomingReservations = [...reservations]
    .filter((r) => r.status !== "cancelled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const statusColor: Record<string, string> = {
    pending: "text-amber-400 bg-amber-400/10",
    confirmed: "text-emerald-400 bg-emerald-400/10",
    cancelled: "text-red-400 bg-red-400/10",
  };

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of your restaurant's key metrics"
    >
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Menu Items"
          value={menuItems.length}
          icon={UtensilsCrossed}
          trend={`${menuItems.filter((m) => m.available).length} available`}
          trendUp
        />
        <StatCard
          label="Reservations"
          value={reservations.length}
          icon={CalendarCheck}
          trend={`${pending} pending`}
          trendUp={pending > 0}
        />
        <StatCard
          label="Avg Rating"
          value={avgRating}
          icon={Star}
          trend={`from ${testimonials.length} reviews`}
          trendUp
        />
        <StatCard
          label="Confirmed"
          value={confirmed}
          icon={TrendingUp}
          trend={`${cancelled} cancelled`}
          trendUp={confirmed > cancelled}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" />
            Upcoming Reservations
          </h2>
          {upcomingReservations.length === 0 ? (
            <p className="text-sm text-foreground/40 text-center py-6">No upcoming reservations</p>
          ) : (
            <div className="space-y-2">
              {upcomingReservations.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-foreground/50 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {r.date} · {r.time} · {r.guests} guest{r.guests > 1 ? "s" : ""}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                      statusColor[r.status]
                    )}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" />
            Recent Reviews
          </h2>
          {testimonials.length === 0 ? (
            <p className="text-sm text-foreground/40 text-center py-6">No reviews yet</p>
          ) : (
            <div className="space-y-3">
              {[...testimonials].slice(0, 4).map((t) => (
                <div key={t.id} className="py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-3 h-3",
                            i < t.rating ? "text-primary fill-primary" : "text-foreground/20"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-foreground/50 line-clamp-2">{t.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-primary" />
            Menu Snapshot
          </h2>
          {(["starters", "mains", "desserts", "drinks"] as const).map((cat) => {
            const items = menuItems.filter((m) => m.category === cat);
            const avail = items.filter((m) => m.available).length;
            return (
              <div key={cat} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <p className="text-sm capitalize text-foreground">{cat}</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-foreground/50">{items.length} items</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    {avail} on
                  </span>
                  {items.length - avail > 0 && (
                    <span className="flex items-center gap-1 text-red-400">
                      <XCircle className="w-3 h-3" />
                      {items.length - avail} off
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Reservation Status
          </h2>
          <div className="flex flex-col gap-4">
            {[
              { label: "Confirmed", count: confirmed, color: "bg-emerald-400", total: reservations.length },
              { label: "Pending", count: pending, color: "bg-amber-400", total: reservations.length },
              { label: "Cancelled", count: cancelled, color: "bg-red-400", total: reservations.length },
            ].map(({ label, count, color, total }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-foreground/60">{label}</span>
                  <span className="text-foreground">{count}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", color)}
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
