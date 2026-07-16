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
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function lastSevenDays() {
  const days: { key: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: d.toISOString().slice(0, 10), label: DAY_LABELS[d.getDay()] });
  }
  return days;
}

function BarChart({
  data,
  days,
  color = "bg-primary/40",
  hoverColor = "bg-primary/60",
}: {
  data: number[];
  days: { label: string }[];
  color?: string;
  hoverColor?: string;
}) {
  const max = Math.max(1, ...data);
  return (
    <div>
      <div className="h-28 flex items-end gap-1 sm:gap-1.5">
        {data.map((v, i) => (
          <div
            key={i}
            title={`${days[i].label}: ${v}`}
            className={cn(
              "flex-1 rounded-t-sm transition-colors cursor-default",
              v > 0 ? `${color} hover:${hoverColor}` : "bg-white/5"
            )}
            style={{ height: v > 0 ? `${Math.max(6, (v / max) * 100)}%` : "3px" }}
          />
        ))}
      </div>
      <div className="flex gap-1 sm:gap-1.5 mt-2 border-t border-white/5 pt-2">
        {days.map(({ label }, i) => (
          <div key={i} className="flex-1 text-center min-w-0">
            <span className="text-[10px] text-foreground/40 block leading-none">{label}</span>
            <span className="text-[10px] text-foreground/25 block mt-0.5 leading-none">
              {data[i] > 0 ? data[i] : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const { orders, reservations, testimonials, visitLog, menuItems } = useRestaurantStore();

  const days = lastSevenDays();

  const ordersPerDay        = days.map(({ key }) => orders.filter((o) => o.orderedAt.slice(0, 10) === key).length);
  const visitsPerDay        = days.map(({ key }) => visitLog.filter((v) => v.slice(0, 10) === key).length);
  const totalVisitsThisWeek = visitsPerDay.reduce((a, b) => a + b, 0);

  const allVerifiedOrders    = orders.filter((o) => o.paymentStatus === "verified");
  const deliveredOrders      = orders.filter((o) => o.status === "delivered" && o.paymentStatus === "verified");
  const totalRevenue         = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalVerifiedRevenue = allVerifiedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const avgOrderValue        = allVerifiedOrders.length > 0 ? totalVerifiedRevenue / allVerifiedOrders.length : 0;

  const avgRating =
    testimonials.length > 0
      ? testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length
      : 0;

  const totalGuests = reservations
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + r.guests, 0);

  const pendingReceiptCount      = orders.filter((o) => o.paymentStatus === "pending_receipt").length;
  const pendingVerificationCount = orders.filter((o) => o.paymentStatus === "pending_verification").length;
  const verifiedCount            = orders.filter((o) => o.paymentStatus === "verified").length;
  const rejectedCount            = orders.filter((o) => o.paymentStatus === "rejected").length;

  type StatusKey = "delivered" | "out_for_delivery" | "ready" | "preparing" | "new" | "cancelled";
  const revenueByStatus: { status: StatusKey; label: string; rev: number }[] = [
    { status: "delivered",        label: "Delivered"       },
    { status: "out_for_delivery", label: "Out for Delivery"},
    { status: "ready",            label: "Ready"           },
    { status: "preparing",        label: "Preparing"       },
    { status: "new",              label: "New"             },
    { status: "cancelled",        label: "Cancelled"       },
  ].map(({ status, label }) => ({
    status: status as StatusKey,
    label,
    rev: orders
      .filter((o) => o.status === status && o.paymentStatus === "verified")
      .reduce((s, o) => s + o.totalAmount, 0),
  }));

  const statusColors: Record<StatusKey, string> = {
    delivered:       "bg-primary",
    out_for_delivery:"bg-blue-400",
    ready:           "bg-emerald-400",
    preparing:       "bg-amber-400",
    new:             "bg-blue-300",
    cancelled:       "bg-red-400",
  };

  return (
    <AdminLayout
      title="Analytics"
      subtitle="Performance overview — live data from the last 7 days"
    >
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="Verified Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          trend={`${deliveredOrders.length} delivered`}
          trendUp
          valueClassName="text-xl sm:text-2xl"
        />
        <StatCard
          label="Total Orders"
          value={orders.length}
          icon={ShoppingBag}
          trend={`${allVerifiedOrders.length} verified`}
          trendUp
          valueClassName="text-xl sm:text-2xl"
        />
        <StatCard
          label="Reservations"
          value={reservations.length}
          icon={CalendarCheck}
          trend={`${totalGuests} guests`}
          trendUp
          valueClassName="text-xl sm:text-2xl"
        />
        <StatCard
          label="Avg Rating"
          value={testimonials.length > 0 ? avgRating.toFixed(1) : "—"}
          icon={Star}
          trend={`${testimonials.length} reviews`}
          trendUp
          valueClassName="text-xl sm:text-2xl"
        />
      </div>

      {/* Payment verification pipeline */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
          <h2 className="text-sm font-semibold text-foreground">Payment Verification Pipeline</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Awaiting Receipt",     count: pendingReceiptCount,      color: "text-foreground/60", bg: "bg-white/5"         },
            { label: "Pending Verification", count: pendingVerificationCount, color: "text-amber-400",     bg: "bg-amber-400/10"    },
            { label: "Verified",             count: verifiedCount,            color: "text-emerald-400",   bg: "bg-emerald-400/10"  },
            { label: "Rejected",             count: rejectedCount,            color: "text-red-400",       bg: "bg-red-400/10"      },
          ].map(({ label, count, color, bg }) => (
            <div key={label} className={cn("rounded-lg p-3 text-center", bg)}>
              <p className={cn("text-2xl font-bold", color)}>{count}</p>
              <p className="text-xs text-foreground/50 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-primary shrink-0" />
            <h2 className="text-sm font-semibold text-foreground">Website Visits</h2>
          </div>
          <p className="text-xs text-foreground/40 mb-4">
            {totalVisitsThisWeek} visits tracked in the last 7 days
          </p>
          <BarChart data={visitsPerDay} days={days} color="bg-primary/35" hoverColor="bg-primary/55" />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
            <h2 className="text-sm font-semibold text-foreground">Orders Per Day</h2>
          </div>
          <p className="text-xs text-foreground/40 mb-4">Live count of orders placed each day</p>
          <BarChart data={ordersPerDay} days={days} color="bg-emerald-500/35" hoverColor="bg-emerald-500/55" />
        </div>
      </div>

      {/* Revenue breakdown + key metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-primary shrink-0" />
            <h2 className="text-sm font-semibold text-foreground">Verified Revenue by Order Status</h2>
          </div>
          <div className="space-y-3">
            {revenueByStatus.map(({ status, label, rev }) => {
              const pct = totalVerifiedRevenue > 0 ? (rev / totalVerifiedRevenue) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-foreground/60">{label}</span>
                    <span className="text-foreground font-medium">{formatCurrency(rev)}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", statusColors[status])}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {totalVerifiedRevenue === 0 && (
              <p className="text-xs text-foreground/30 text-center py-4">No verified payments yet</p>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary shrink-0" />
            <h2 className="text-sm font-semibold text-foreground">Key Metrics</h2>
          </div>
          <div className="space-y-0">
            {[
              { label: "Average Order Value",    value: formatCurrency(avgOrderValue)                                            },
              { label: "Avg Guest Rating",       value: testimonials.length > 0 ? `${avgRating.toFixed(1)} / 5.0` : "No reviews yet" },
              { label: "Confirmed Reservations", value: reservations.filter((r) => r.status === "confirmed").length.toString()   },
              { label: "Pending Reservations",   value: reservations.filter((r) => r.status === "pending").length.toString()     },
              { label: "Active Menu Items",      value: `${menuItems.filter((m) => m.available).length} items`                  },
              { label: "Total Guests Hosted",    value: totalGuests.toString()                                                    },
              { label: "Orders Verified & Paid", value: verifiedCount.toString()                                                 },
              { label: "Pending Verification",   value: pendingVerificationCount.toString()                                      },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
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
