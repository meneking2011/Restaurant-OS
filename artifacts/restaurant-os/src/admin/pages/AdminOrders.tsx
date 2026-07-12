import { useState } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Order } from "@/types/restaurant";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Truck,
  CreditCard,
  Building,
  X,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

type StatusFilter = "all" | "new" | "preparing" | "ready" | "completed" | "cancelled";

const STATUS_CONFIG: Record<Order["status"], { label: string; color: string; icon: React.ElementType }> = {
  new: { label: "New", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: ShoppingBag },
  preparing: { label: "Preparing", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: ChefHat },
  ready: { label: "Ready", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: Truck },
  completed: { label: "Completed", color: "text-foreground/50 bg-white/5 border-white/10", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20", icon: XCircle },
};

const STATUS_FLOW: Partial<Record<Order["status"], Order["status"]>> = {
  new: "preparing",
  preparing: "ready",
  ready: "completed",
};

function OrderDetailPanel({ order, onClose }: { order: Order; onClose: () => void }) {
  const { updateOrderStatus } = useRestaurantStore();
  const cfg = STATUS_CONFIG[order.status];
  const nextStatus = STATUS_FLOW[order.status];

  return (
    <div className="bg-[hsl(15,13%,7%)] border border-white/10 rounded-xl p-5 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Order Details #{order.id.replace("ord-", "")}</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-foreground/50 hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Customer & Delivery</p>
        <p className="text-sm font-medium text-foreground">{order.customerName}</p>
        <p className="text-xs text-foreground/50">{order.email}</p>
        <p className="text-xs text-foreground/50">{order.phone}</p>
        <p className="text-xs text-foreground/50 mt-1">{order.deliveryAddress}</p>
      </div>

      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Ordered Items</p>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-foreground/80">{item.name} <span className="text-foreground/40">×{item.quantity}</span></span>
              <span className="text-foreground">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Financials</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-foreground/60">
            <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-foreground/60">
            <span>Delivery Fee</span><span>{formatCurrency(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-foreground/60">
            <span>Tax</span><span>{formatCurrency(order.tax)}</span>
          </div>
          {order.discount && (
            <div className="flex justify-between text-emerald-400">
              <span>Discount</span><span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold text-foreground border-t border-white/10 pt-2 mt-1">
            <span>Total</span><span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 text-xs text-foreground/50">
          {order.paymentMethod === "card" ? <CreditCard className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />}
          <span>{order.paymentMethod === "card" ? "Credit / Debit Card" : "Bank Transfer"}</span>
        </div>
      </div>

      {order.specialNotes && (
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-xs text-foreground/40 uppercase tracking-widest mb-1">Special Notes</p>
          <p className="text-xs text-foreground/70 italic">{order.specialNotes}</p>
        </div>
      )}

      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Order Status</p>
        <span className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium capitalize", cfg.color)}>
          <cfg.icon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>

      {order.status !== "completed" && order.status !== "cancelled" && (
        <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
          {nextStatus && (
            <button
              onClick={() => updateOrderStatus(order.id, nextStatus)}
              className="w-full px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
            >
              Mark as {STATUS_CONFIG[nextStatus].label}
            </button>
          )}
          <button
            onClick={() => updateOrderStatus(order.id, "cancelled")}
            className="w-full px-4 py-2 bg-red-600/10 text-red-400 border border-red-400/20 rounded-lg text-sm hover:bg-red-600/20 transition-colors"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const { orders } = useRestaurantStore();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts: Record<StatusFilter, number> = {
    all: orders.length,
    new: orders.filter((o) => o.status === "new").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <AdminLayout
      title="Orders"
      subtitle="Manage and track all customer orders"
    >
      <div className="flex gap-2 flex-wrap mb-6">
        {(["all", "new", "preparing", "ready", "completed", "cancelled"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs capitalize transition-colors border",
              filter === s
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-white/5 text-foreground/60 border-white/10 hover:bg-white/10 hover:text-foreground"
            )}
          >
            {s} <span className="ml-1 opacity-60">({counts[s]})</span>
          </button>
        ))}
      </div>

      <div className={cn("grid gap-6", selectedOrder ? "grid-cols-1 xl:grid-cols-5" : "grid-cols-1")}>
        <div className={cn("space-y-2", selectedOrder ? "xl:col-span-3" : "")}>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-foreground/40 text-sm">No orders found.</div>
          )}
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order.id === selectedOrder?.id ? null : order)}
                className={cn(
                  "flex items-start gap-4 bg-white/5 border rounded-xl p-4 cursor-pointer transition-colors",
                  selectedOrder?.id === order.id
                    ? "border-primary/40 bg-primary/5"
                    : "border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-foreground/40 font-mono">#{order.id.replace("ord-", "")}</span>
                      <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                    </div>
                    <span className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium capitalize shrink-0", cfg.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-foreground/50 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(order.orderedAt).toLocaleDateString()} {new Date(order.orderedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                    <span className="font-medium text-foreground/70">{formatCurrency(order.totalAmount)}</span>
                    <span>{order.paymentMethod === "card" ? "Card" : "Bank"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {selectedOrder && (
          <div className="xl:col-span-2">
            <OrderDetailPanel
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
