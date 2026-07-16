import { useState, useMemo, useCallback, useRef } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  DollarSign, ShoppingBag, Users, CalendarCheck, TrendingUp,
  Star, CheckCircle2, XCircle, Clock, Package, Truck, ChevronDown,
  Download, FileText, FileSpreadsheet, Printer, X, ArrowUpRight,
  BarChart2, AlertCircle, RefreshCw, ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DateFilter = "today" | "week" | "month" | "year" | "custom";

interface DetailModal {
  type: string;
  title: string;
}

// ─── Date Utilities ───────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const r = new Date(d); r.setHours(0, 0, 0, 0); return r;
}
function endOfDay(d: Date): Date {
  const r = new Date(d); r.setHours(23, 59, 59, 999); return r;
}
function startOfWeek(d: Date): Date {
  const r = new Date(d); r.setDate(r.getDate() - r.getDay()); r.setHours(0, 0, 0, 0); return r;
}
function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

function getRange(filter: DateFilter, cs?: string, ce?: string): { start: Date; end: Date } {
  const now = new Date();
  if (filter === "today")  return { start: startOfDay(now),   end: endOfDay(now) };
  if (filter === "week")   return { start: startOfWeek(now),  end: endOfDay(now) };
  if (filter === "month")  return { start: startOfMonth(now), end: endOfDay(now) };
  if (filter === "year")   return { start: startOfYear(now),  end: endOfDay(now) };
  if (filter === "custom" && cs && ce) {
    return { start: startOfDay(new Date(cs)), end: endOfDay(new Date(ce)) };
  }
  return { start: startOfMonth(now), end: endOfDay(now) };
}

function inRange(dateStr: string, range: { start: Date; end: Date }): boolean {
  const d = new Date(dateStr);
  return d >= range.start && d <= range.end;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function fmtDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

function daysBetween(start: Date, end: Date): string[] {
  const days: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function monthsBetween(start: Date, end: Date): string[] {
  const months: string[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    months.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`);
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

// ─── Export Utilities ─────────────────────────────────────────────────────────

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows: (string | number)[][]): string {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

// ─── Recharts Custom Tooltip ──────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, currency }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[];
  label?: string; currency?: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[hsl(15,13%,9%)] border border-white/15 rounded-lg p-3 shadow-xl text-xs">
      {label && <p className="text-foreground/50 mb-1.5">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} className="font-medium" style={{ color: p.color }}>
          {p.name}: {currency ? formatCurrency(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
        <Icon className="w-5 h-5 text-foreground/25" />
      </div>
      <p className="text-sm text-foreground/40">{message}</p>
    </div>
  );
}

// ─── Pie chart colours ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  new:             "#60a5fa",
  preparing:       "#fbbf24",
  ready:           "#34d399",
  out_for_delivery:"#a78bfa",
  delivered:       "#d4a853",
  cancelled:       "#f87171",
};
const PIE_COLORS = ["#d4a853", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f87171", "#fb923c"];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminAnalytics() {
  const { orders, reservations, testimonials, activityLog, menuItems } = useRestaurantStore();

  const [filter, setFilter]         = useState<DateFilter>("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd]   = useState("");
  const [detail, setDetail]         = useState<DetailModal | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const range = useMemo(
    () => getRange(filter, customStart, customEnd),
    [filter, customStart, customEnd]
  );

  // ── Filtered data ──────────────────────────────────────────────────────────

  const filteredOrders = useMemo(
    () => orders.filter((o) => inRange(o.orderedAt, range)),
    [orders, range]
  );

  const filteredReservations = useMemo(
    () => reservations.filter((r) => inRange(r.createdAt, range)),
    [reservations, range]
  );

  const allTimeOrders = orders; // for customer new/returning logic

  // ── Revenue Metrics ────────────────────────────────────────────────────────

  const verifiedOrders  = useMemo(() => filteredOrders.filter((o) => o.paymentStatus === "verified"), [filteredOrders]);
  const totalRevenue    = useMemo(() => verifiedOrders.reduce((s, o) => s + o.totalAmount, 0), [verifiedOrders]);

  const todayRange  = getRange("today");
  const weekRange   = getRange("week");
  const monthRange  = getRange("month");

  const todayRevenue  = useMemo(() => orders.filter((o) => o.paymentStatus === "verified" && inRange(o.orderedAt, todayRange)).reduce((s, o) => s + o.totalAmount, 0), [orders]);
  const weekRevenue   = useMemo(() => orders.filter((o) => o.paymentStatus === "verified" && inRange(o.orderedAt, weekRange)).reduce((s, o) => s + o.totalAmount, 0),  [orders]);
  const monthRevenue  = useMemo(() => orders.filter((o) => o.paymentStatus === "verified" && inRange(o.orderedAt, monthRange)).reduce((s, o) => s + o.totalAmount, 0), [orders]);

  const avgOrderValue = verifiedOrders.length > 0 ? totalRevenue / verifiedOrders.length : 0;

  // ── Order Metrics ──────────────────────────────────────────────────────────

  const totalOrders     = filteredOrders.length;
  const pendingOrders   = filteredOrders.filter((o) => o.status === "new" || o.status === "preparing").length;
  const completedOrders = filteredOrders.filter((o) => o.status === "delivered").length;
  const cancelledOrders = filteredOrders.filter((o) => o.status === "cancelled").length;

  // ── Customer Metrics ───────────────────────────────────────────────────────

  const uniqueEmails = useMemo(() => {
    const emails = new Set(filteredOrders.map((o) => o.email.toLowerCase().trim()));
    return [...emails];
  }, [filteredOrders]);

  const allTimeEmails = useMemo(() => {
    const map = new Map<string, string>(); // email → first orderedAt
    [...allTimeOrders].sort((a, b) => a.orderedAt.localeCompare(b.orderedAt))
      .forEach((o) => { if (!map.has(o.email.toLowerCase())) map.set(o.email.toLowerCase(), o.orderedAt); });
    return map;
  }, [allTimeOrders]);

  const newCustomers = useMemo(() =>
    uniqueEmails.filter((e) => {
      const first = allTimeEmails.get(e.toLowerCase());
      return first ? inRange(first, range) : false;
    }).length,
    [uniqueEmails, allTimeEmails, range]
  );
  const returningCustomers = uniqueEmails.length - newCustomers;

  // ── Reservation Metrics ────────────────────────────────────────────────────

  const activeReservations = filteredReservations.filter((r) => r.status === "pending" || r.status === "confirmed").length;
  const confirmedGuests    = filteredReservations.filter((r) => r.status === "confirmed").reduce((s, r) => s + r.guests, 0);

  // ── Payment Stats ──────────────────────────────────────────────────────────

  const payPendingReceipt  = filteredOrders.filter((o) => o.paymentStatus === "pending_receipt").length;
  const payPendingVerify   = filteredOrders.filter((o) => o.paymentStatus === "pending_verification").length;
  const payVerified        = filteredOrders.filter((o) => o.paymentStatus === "verified").length;
  const payRejected        = filteredOrders.filter((o) => o.paymentStatus === "rejected").length;

  // ── Ratings ────────────────────────────────────────────────────────────────

  const ratingAvg  = testimonials.length > 0 ? testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length : 0;
  const ratingDist = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: testimonials.filter((t) => t.rating === r).length,
  }));

  // ── Best / Least Selling ───────────────────────────────────────────────────

  const itemSales = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prev = map.get(item.menuItemId) ?? { name: item.name, qty: 0, revenue: 0 };
        map.set(item.menuItemId, { name: item.name, qty: prev.qty + item.quantity, revenue: prev.revenue + item.price * item.quantity });
      });
    });
    return [...map.values()].sort((a, b) => b.qty - a.qty);
  }, [filteredOrders]);

  const bestSelling  = itemSales.slice(0, 8);
  const leastSelling = [...itemSales].sort((a, b) => a.qty - b.qty).slice(0, 5);

  // ── Revenue Trend Chart ────────────────────────────────────────────────────

  const revenueTrend = useMemo(() => {
    const diffDays = Math.ceil((range.end.getTime() - range.start.getTime()) / 86400000);
    if (diffDays <= 31) {
      // Daily granularity
      return daysBetween(range.start, range.end).map((day) => ({
        label: fmtDate(day + "T00:00:00"),
        revenue: orders.filter((o) => o.paymentStatus === "verified" && o.orderedAt.slice(0, 10) === day)
          .reduce((s, o) => s + o.totalAmount, 0),
        orders: orders.filter((o) => o.orderedAt.slice(0, 10) === day).length,
      }));
    }
    // Monthly granularity
    return monthsBetween(range.start, range.end).map((month) => ({
      label: new Date(month + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      revenue: orders.filter((o) => o.paymentStatus === "verified" && o.orderedAt.startsWith(month))
        .reduce((s, o) => s + o.totalAmount, 0),
      orders: orders.filter((o) => o.orderedAt.startsWith(month)).length,
    }));
  }, [orders, range]);

  // ── Order Status Distribution ──────────────────────────────────────────────

  const statusDist = useMemo(() => {
    const statuses = ["new", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"] as const;
    return statuses
      .map((s) => ({ name: s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), value: filteredOrders.filter((o) => o.status === s).length, color: STATUS_COLORS[s] }))
      .filter((s) => s.value > 0);
  }, [filteredOrders]);

  // ── Top Items Chart ────────────────────────────────────────────────────────

  const topItemsChart = bestSelling.slice(0, 6).map((i) => ({ name: i.name.length > 18 ? i.name.slice(0, 18) + "…" : i.name, qty: i.qty, revenue: Math.round(i.revenue) }));

  // ── Exports ────────────────────────────────────────────────────────────────

  const exportCSV = useCallback(() => {
    const rows: (string | number)[][] = [
      ["Metric", "Value"],
      ["Period", `${fmtDateShort(range.start.toISOString())} – ${fmtDateShort(range.end.toISOString())}`],
      [],
      ["REVENUE"],
      ["Total Revenue (Verified)", totalRevenue],
      ["Today Revenue", todayRevenue],
      ["This Week Revenue", weekRevenue],
      ["This Month Revenue", monthRevenue],
      ["Average Order Value", avgOrderValue],
      [],
      ["ORDERS"],
      ["Total Orders", totalOrders],
      ["Pending Orders", pendingOrders],
      ["Completed (Delivered)", completedOrders],
      ["Cancelled Orders", cancelledOrders],
      [],
      ["CUSTOMERS"],
      ["Total Unique Customers", uniqueEmails.length],
      ["New Customers", newCustomers],
      ["Returning Customers", returningCustomers],
      [],
      ["RESERVATIONS"],
      ["Active Reservations", activeReservations],
      ["Confirmed Guests", confirmedGuests],
      [],
      ["PAYMENT STATUS"],
      ["Awaiting Receipt", payPendingReceipt],
      ["Pending Verification", payPendingVerify],
      ["Verified", payVerified],
      ["Rejected", payRejected],
      [],
      ["RATINGS"],
      ["Average Rating", ratingAvg.toFixed(2)],
      ["Total Reviews", testimonials.length],
      [],
      ["BEST SELLING ITEMS"],
      ["Item", "Qty Sold", "Revenue"],
      ...bestSelling.map((i) => [i.name, i.qty, i.revenue]),
    ];
    downloadBlob(toCSV(rows), `restaurant-analytics-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
  }, [totalRevenue, todayRevenue, weekRevenue, monthRevenue, avgOrderValue, totalOrders, pendingOrders, completedOrders, cancelledOrders, uniqueEmails, newCustomers, returningCustomers, activeReservations, confirmedGuests, payPendingReceipt, payPendingVerify, payVerified, payRejected, ratingAvg, testimonials, bestSelling, range]);

  const exportExcel = useCallback(() => {
    const rows: (string | number)[][] = [
      ["Restaurant Analytics Report"],
      ["Period", `${fmtDateShort(range.start.toISOString())} – ${fmtDateShort(range.end.toISOString())}`],
      ["Generated", new Date().toLocaleString()],
      [],
      ["Revenue Metrics", ""],
      ["Total Verified Revenue", totalRevenue],
      ["Today Revenue", todayRevenue],
      ["This Week Revenue", weekRevenue],
      ["This Month Revenue", monthRevenue],
      ["Avg Order Value", avgOrderValue],
      [],
      ["Order Metrics", ""],
      ["Total Orders", totalOrders],
      ["Pending", pendingOrders],
      ["Completed", completedOrders],
      ["Cancelled", cancelledOrders],
      [],
      ["Customer Metrics", ""],
      ["Total Customers", uniqueEmails.length],
      ["New", newCustomers],
      ["Returning", returningCustomers],
      [],
      ["Revenue Trend", ""],
      ["Date", "Revenue", "Orders"],
      ...revenueTrend.map((r) => [r.label, r.revenue, r.orders]),
      [],
      ["Top Items", ""],
      ["Item Name", "Qty Sold", "Revenue"],
      ...bestSelling.map((i) => [i.name, i.qty, i.revenue]),
    ];
    downloadBlob(toCSV(rows), `restaurant-analytics-${new Date().toISOString().slice(0, 10)}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }, [totalRevenue, todayRevenue, weekRevenue, monthRevenue, avgOrderValue, totalOrders, pendingOrders, completedOrders, cancelledOrders, uniqueEmails, newCustomers, returningCustomers, revenueTrend, bestSelling, range]);

  const exportPDF = useCallback(() => {
    window.print();
  }, []);

  // ── Range label ────────────────────────────────────────────────────────────

  const rangeLabel = filter === "today" ? "Today"
    : filter === "week" ? "This Week"
    : filter === "month" ? "This Month"
    : filter === "year" ? "This Year"
    : customStart && customEnd ? `${fmtDateShort(customStart)} – ${fmtDateShort(customEnd)}`
    : "Custom Range";

  // ── Stat card helper ───────────────────────────────────────────────────────

  function KpiCard({ label, value, sub, icon: Icon, iconColor = "text-primary", bg = "bg-primary/10", onClick, trend }: {
    label: string; value: string | number; sub?: string; icon: React.ElementType;
    iconColor?: string; bg?: string; onClick?: () => void; trend?: { value: string; up: boolean };
  }) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 transition-all",
          onClick && "cursor-pointer hover:border-primary/30 hover:bg-white/8 group"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs text-foreground/50 uppercase tracking-wider">{label}</p>
            <p className="text-xl sm:text-2xl font-semibold text-foreground mt-1 truncate">{value}</p>
            {sub && <p className="text-[10px] text-foreground/40 mt-0.5">{sub}</p>}
            {trend && (
              <p className={cn("text-[10px] mt-1 font-medium", trend.up ? "text-emerald-400" : "text-red-400")}>
                {trend.value}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className={cn("p-2 rounded-lg", bg)}>
              <Icon className={cn("w-4 h-4", iconColor)} />
            </div>
            {onClick && <ChevronRight className="w-3 h-3 text-foreground/20 group-hover:text-primary/60 transition-colors" />}
          </div>
        </div>
      </div>
    );
  }

  // ── Section wrapper ────────────────────────────────────────────────────────

  function Section({ title, icon: Icon, children, className }: {
    title: string; icon: React.ElementType; children: React.ReactNode; className?: string;
  }) {
    return (
      <div className={cn("bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5", className)}>
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-4 h-4 text-primary shrink-0" />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {children}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <AdminLayout
        title="Analytics"
        subtitle={`Business intelligence dashboard — ${rangeLabel}`}
        actions={
          <div className="flex items-center gap-2 no-print flex-wrap">
            {/* Export buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-foreground/70 hover:text-foreground hover:border-white/20 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={exportExcel}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-foreground/70 hover:text-foreground hover:border-white/20 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-white/5 border border-white/10 text-foreground/70 hover:text-foreground hover:border-white/20 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> PDF
              </button>
            </div>
          </div>
        }
      >
        <div id="analytics-print-root" ref={printRef}>
          {/* ── Date Filter ─────────────────────────────────────────────────── */}
          <div className="no-print mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(["today", "week", "month", "year", "custom"] as DateFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                    filter === f
                      ? "bg-primary text-black"
                      : "bg-white/5 border border-white/10 text-foreground/60 hover:text-foreground hover:border-white/20"
                  )}
                >
                  {f === "today" ? "Today" : f === "week" ? "This Week" : f === "month" ? "This Month" : f === "year" ? "This Year" : "Custom"}
                </button>
              ))}
              <span className="text-xs text-foreground/30 ml-auto shrink-0 hidden sm:block">
                Auto-updates with live data
              </span>
            </div>
            {filter === "custom" && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary/50"
                />
                <span className="text-foreground/40 text-xs">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            )}
          </div>

          {/* ── Revenue KPIs ─────────────────────────────────────────────────── */}
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-widest text-foreground/30 mb-2 font-medium">Revenue</p>
            <div className="kpi-grid grid grid-cols-2 lg:grid-cols-5 gap-3">
              <KpiCard
                label="Total Revenue"
                value={formatCurrency(totalRevenue)}
                sub={`${verifiedOrders.length} verified orders`}
                icon={DollarSign}
                onClick={() => setDetail({ type: "revenue", title: "Revenue Breakdown" })}
              />
              <KpiCard
                label="Today"
                value={formatCurrency(todayRevenue)}
                sub="verified, today"
                icon={TrendingUp}
                iconColor="text-emerald-400"
                bg="bg-emerald-400/10"
              />
              <KpiCard
                label="This Week"
                value={formatCurrency(weekRevenue)}
                sub="Mon – now"
                icon={BarChart2}
                iconColor="text-blue-400"
                bg="bg-blue-400/10"
              />
              <KpiCard
                label="This Month"
                value={formatCurrency(monthRevenue)}
                sub="month to date"
                icon={DollarSign}
                iconColor="text-amber-400"
                bg="bg-amber-400/10"
              />
              <KpiCard
                label="Avg Order Value"
                value={formatCurrency(avgOrderValue)}
                sub="verified orders"
                icon={ArrowUpRight}
                iconColor="text-violet-400"
                bg="bg-violet-400/10"
              />
            </div>
          </div>

          {/* ── Orders KPIs ──────────────────────────────────────────────────── */}
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-widest text-foreground/30 mb-2 font-medium">Orders</p>
            <div className="kpi-grid grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard
                label="Total Orders"
                value={totalOrders}
                sub={rangeLabel}
                icon={ShoppingBag}
                onClick={() => setDetail({ type: "orders", title: "All Orders" })}
              />
              <KpiCard
                label="Pending"
                value={pendingOrders}
                sub="new + preparing"
                icon={Clock}
                iconColor="text-amber-400"
                bg="bg-amber-400/10"
                onClick={() => setDetail({ type: "pending_orders", title: "Pending Orders" })}
              />
              <KpiCard
                label="Completed"
                value={completedOrders}
                sub="delivered"
                icon={CheckCircle2}
                iconColor="text-emerald-400"
                bg="bg-emerald-400/10"
              />
              <KpiCard
                label="Cancelled"
                value={cancelledOrders}
                sub={`${totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(0) : 0}% of total`}
                icon={XCircle}
                iconColor="text-red-400"
                bg="bg-red-400/10"
              />
            </div>
          </div>

          {/* ── Customers + Reservations KPIs ───────────────────────────────── */}
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-foreground/30 mb-2 font-medium">Customers & Reservations</p>
            <div className="kpi-grid grid grid-cols-2 lg:grid-cols-4 gap-3">
              <KpiCard
                label="Total Customers"
                value={uniqueEmails.length}
                sub={`${rangeLabel}`}
                icon={Users}
                onClick={() => setDetail({ type: "customers", title: "Customer List" })}
              />
              <KpiCard
                label="New Customers"
                value={newCustomers}
                sub="first order in period"
                icon={Users}
                iconColor="text-emerald-400"
                bg="bg-emerald-400/10"
              />
              <KpiCard
                label="Returning"
                value={returningCustomers}
                sub="ordered before"
                icon={RefreshCw}
                iconColor="text-blue-400"
                bg="bg-blue-400/10"
              />
              <KpiCard
                label="Active Reservations"
                value={activeReservations}
                sub={`${confirmedGuests} confirmed guests`}
                icon={CalendarCheck}
                iconColor="text-violet-400"
                bg="bg-violet-400/10"
                onClick={() => setDetail({ type: "reservations", title: "Active Reservations" })}
              />
            </div>
          </div>

          {/* ── Charts Row 1 ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Revenue Trend Line Chart */}
            <Section title="Revenue Trend" icon={TrendingUp} className="lg:col-span-2">
              {revenueTrend.every((d) => d.revenue === 0) ? (
                <EmptyState icon={DollarSign} message="No verified revenue in this period" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={revenueTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<ChartTooltip currency />} />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#d4a853" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#d4a853" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Section>

            {/* Order Status Pie */}
            <Section title="Order Status" icon={Package}>
              {statusDist.length === 0 ? (
                <EmptyState icon={ShoppingBag} message="No orders in this period" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                        {statusDist.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1 mt-2">
                    {statusDist.map((s) => (
                      <div key={s.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                          <span className="text-foreground/60">{s.name}</span>
                        </div>
                        <span className="font-medium text-foreground">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Section>
          </div>

          {/* ── Charts Row 2 ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Orders per Day Bar */}
            <Section title="Orders Over Time" icon={BarChart2}>
              {revenueTrend.every((d) => d.orders === 0) ? (
                <EmptyState icon={ShoppingBag} message="No orders in this period" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="orders" name="Orders" fill="#60a5fa" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>

            {/* Top Items Bar */}
            <Section title="Best Selling Items" icon={TrendingUp}>
              {topItemsChart.length === 0 ? (
                <EmptyState icon={ShoppingBag} message="No items sold in this period" />
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topItemsChart} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.5)" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="qty" name="Qty Sold" fill="#d4a853" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Section>
          </div>

          {/* ── Payment Pipeline ─────────────────────────────────────────────── */}
          <div className="mb-4">
            <Section title="Payment Verification Pipeline" icon={CheckCircle2}>
              {totalOrders === 0 ? (
                <EmptyState icon={CheckCircle2} message="No orders in this period" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Awaiting Receipt",     count: payPendingReceipt,  color: "text-foreground/60", bg: "bg-white/5"        },
                    { label: "Pending Verification", count: payPendingVerify,   color: "text-amber-400",     bg: "bg-amber-400/10"   },
                    { label: "Verified",             count: payVerified,        color: "text-emerald-400",   bg: "bg-emerald-400/10" },
                    { label: "Rejected",             count: payRejected,        color: "text-red-400",       bg: "bg-red-400/10"     },
                  ].map(({ label, count, color, bg }) => (
                    <div key={label} className={cn("rounded-xl p-4 text-center", bg)}>
                      <p className={cn("text-3xl font-bold", color)}>{count}</p>
                      <p className="text-xs text-foreground/50 mt-1">{label}</p>
                      {totalOrders > 0 && (
                        <p className="text-[10px] text-foreground/30 mt-0.5">
                          {((count / totalOrders) * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* ── Tables Row ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Best Sellers Table */}
            <Section title="Best Selling Items" icon={TrendingUp}>
              {bestSelling.length === 0 ? (
                <EmptyState icon={ShoppingBag} message="No items sold in this period" />
              ) : (
                <div className="space-y-2">
                  {bestSelling.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <span className="text-xs font-bold text-primary w-5 shrink-0">#{i + 1}</span>
                      <span className="flex-1 text-xs text-foreground truncate">{item.name}</span>
                      <span className="text-xs text-foreground/50 shrink-0">{item.qty} sold</span>
                      <span className="text-xs font-medium text-emerald-400 shrink-0 w-20 text-right">{formatCurrency(item.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            {/* Least Sellers Table */}
            <Section title="Least Selling Items" icon={AlertCircle}>
              {leastSelling.length === 0 ? (
                <EmptyState icon={ShoppingBag} message="No items sold in this period" />
              ) : (
                <div className="space-y-2">
                  {leastSelling.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                      <span className="text-xs font-bold text-foreground/30 w-5 shrink-0">#{i + 1}</span>
                      <span className="flex-1 text-xs text-foreground truncate">{item.name}</span>
                      <span className="text-xs text-foreground/50 shrink-0">{item.qty} sold</span>
                      <span className="text-xs font-medium text-foreground/40 shrink-0 w-20 text-right">{formatCurrency(item.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {/* ── Ratings ─────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Section title="Customer Ratings" icon={Star}>
              {testimonials.length === 0 ? (
                <EmptyState icon={Star} message="No reviews yet" />
              ) : (
                <div className="flex items-center gap-6">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-bold text-primary">{ratingAvg.toFixed(1)}</p>
                    <div className="flex justify-center gap-0.5 mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={cn("w-3.5 h-3.5", s <= Math.round(ratingAvg) ? "text-primary fill-primary" : "text-foreground/20")} />
                      ))}
                    </div>
                    <p className="text-xs text-foreground/40 mt-1">{testimonials.length} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {ratingDist.map(({ stars, count }) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="text-[10px] text-foreground/50 w-4 shrink-0">{stars}★</span>
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: testimonials.length > 0 ? `${(count / testimonials.length) * 100}%` : "0%" }}
                          />
                        </div>
                        <span className="text-[10px] text-foreground/40 w-4 text-right shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* Recent Activity */}
            <Section title="Recent Activity" icon={Clock}>
              {activityLog.length === 0 ? (
                <EmptyState icon={Clock} message="No activity yet" />
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {activityLog.slice(0, 10).map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-foreground font-medium truncate">{entry.message}</p>
                        <p className="text-[10px] text-foreground/40 truncate">{entry.detail}</p>
                      </div>
                      <span className="text-[10px] text-foreground/30 shrink-0 whitespace-nowrap">
                        {new Date(entry.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </div>
      </AdminLayout>

      {/* ── Detail Modals ─────────────────────────────────────────────────────── */}
      {detail && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-[hsl(15,13%,9%)] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="font-semibold text-foreground">{detail.title}</h3>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              {detail.type === "revenue" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Total Verified Revenue", value: formatCurrency(totalRevenue) },
                      { label: "Today", value: formatCurrency(todayRevenue) },
                      { label: "This Week", value: formatCurrency(weekRevenue) },
                      { label: "This Month", value: formatCurrency(monthRevenue) },
                      { label: "Average Order Value", value: formatCurrency(avgOrderValue) },
                      { label: "Verified Orders", value: verifiedOrders.length },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/5 rounded-xl p-3">
                        <p className="text-xs text-foreground/50">{label}</p>
                        <p className="text-lg font-semibold text-foreground mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground/60 mb-2 uppercase tracking-wider">Top Earners</p>
                    {bestSelling.slice(0, 5).map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between py-2 border-b border-white/5 text-sm">
                        <span className="text-foreground/60">{i + 1}. {item.name}</span>
                        <span className="font-medium text-primary">{formatCurrency(item.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detail.type === "orders" && (
                <div className="space-y-2">
                  {filteredOrders.length === 0 ? (
                    <EmptyState icon={ShoppingBag} message="No orders in this period" />
                  ) : filteredOrders.slice(0, 30).map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-white/5 text-xs gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{o.customerName}</p>
                        <p className="text-foreground/40">{new Date(o.orderedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-foreground">{formatCurrency(o.totalAmount)}</p>
                        <p className={cn("capitalize", o.status === "delivered" ? "text-emerald-400" : o.status === "cancelled" ? "text-red-400" : "text-amber-400")}>{o.status.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {detail.type === "pending_orders" && (
                <div className="space-y-2">
                  {filteredOrders.filter((o) => o.status === "new" || o.status === "preparing").length === 0 ? (
                    <EmptyState icon={Clock} message="No pending orders" />
                  ) : filteredOrders.filter((o) => o.status === "new" || o.status === "preparing").map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-white/5 text-xs gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{o.customerName}</p>
                        <p className="text-foreground/40">{o.items.length} items · {new Date(o.orderedAt).toLocaleTimeString("en-GB")}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-foreground">{formatCurrency(o.totalAmount)}</p>
                        <p className="capitalize text-amber-400">{o.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {detail.type === "customers" && (
                <div className="space-y-2">
                  {uniqueEmails.length === 0 ? (
                    <EmptyState icon={Users} message="No customers in this period" />
                  ) : uniqueEmails.map((email) => {
                    const customerOrders = filteredOrders.filter((o) => o.email.toLowerCase() === email);
                    const customerName   = filteredOrders.find((o) => o.email.toLowerCase() === email)?.customerName ?? email;
                    const total          = customerOrders.filter((o) => o.paymentStatus === "verified").reduce((s, o) => s + o.totalAmount, 0);
                    return (
                      <div key={email} className="flex items-center justify-between py-2.5 border-b border-white/5 text-xs gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">{customerName}</p>
                          <p className="text-foreground/40 truncate">{email}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-semibold text-foreground">{customerOrders.length} orders</p>
                          <p className="text-primary">{formatCurrency(total)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {detail.type === "reservations" && (
                <div className="space-y-2">
                  {filteredReservations.filter((r) => r.status === "pending" || r.status === "confirmed").length === 0 ? (
                    <EmptyState icon={CalendarCheck} message="No active reservations" />
                  ) : filteredReservations.filter((r) => r.status === "pending" || r.status === "confirmed").map((r) => (
                    <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-white/5 text-xs gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{r.name}</p>
                        <p className="text-foreground/40">{r.date} at {r.time} · {r.guests} guests</p>
                      </div>
                      <span className={cn("capitalize shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium",
                        r.status === "confirmed" ? "bg-emerald-400/10 text-emerald-400" : "bg-amber-400/10 text-amber-400"
                      )}>{r.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
