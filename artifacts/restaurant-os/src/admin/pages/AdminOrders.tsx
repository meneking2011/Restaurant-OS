import { useState } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Order } from "@/types/restaurant";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { PrintReceiptModal, ReceiptData } from "../components/PrintReceiptModal";
import {
  ShoppingBag, Clock, CheckCircle, XCircle, ChefHat, Truck,
  CreditCard, Building, X, Download, Search, Printer, RotateCcw,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { ConfirmDialog } from "../components/ConfirmDialog";

type StatusFilter = "all" | "new" | "preparing" | "ready" | "completed" | "cancelled";

const STATUS_CONFIG: Record<Order["status"], { label: string; color: string; icon: React.ElementType }> = {
  new:       { label: "New",       color: "text-blue-400 bg-blue-400/10 border-blue-400/20",          icon: ShoppingBag },
  preparing: { label: "Preparing", color: "text-amber-400 bg-amber-400/10 border-amber-400/20",       icon: ChefHat     },
  ready:     { label: "Ready",     color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: Truck       },
  completed: { label: "Completed", color: "text-foreground/40 bg-white/5 border-white/10",            icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-400/10 border-red-400/20",             icon: XCircle    },
};

const STATUS_FLOW: Partial<Record<Order["status"], Order["status"]>> = {
  new:       "preparing",
  preparing: "ready",
  ready:     "completed",
};

function exportOrdersCSV(orders: Order[]) {
  const header = ["Order ID","Customer","Email","Phone","Date","Status","Payment","Subtotal","Delivery","Tax","Total","Address","Notes"];
  const rows = orders.map((o) => [
    o.id, o.customerName, o.email, o.phone,
    new Date(o.orderedAt).toLocaleString(), o.status, o.paymentMethod,
    o.subtotal.toFixed(2), o.deliveryFee.toFixed(2), o.tax.toFixed(2),
    o.totalAmount.toFixed(2), o.deliveryAddress ?? "", o.specialNotes ?? "",
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function OrderDetailPanel({ orderId, onClose, onPrint }: { orderId: string; onClose: () => void; onPrint: () => void }) {
  const order = useRestaurantStore((s) => s.orders.find((o) => o.id === orderId));
  const { updateOrderStatus } = useRestaurantStore();

  if (!order) return null;

  const cfg        = STATUS_CONFIG[order.status];
  const nextStatus = STATUS_FLOW[order.status];

  return (
    <div className="bg-[hsl(15,13%,7%)] border border-white/10 rounded-xl p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-180px)]">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Order <span className="text-primary">#{order.id.replace("ord-", "")}</span>
        </h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Customer & Delivery</p>
        <p className="text-sm font-semibold text-foreground">{order.customerName}</p>
        <p className="text-xs text-foreground/50">{order.email}</p>
        <p className="text-xs text-foreground/50">{order.phone}</p>
        <p className="text-xs text-foreground/50 mt-1">{order.deliveryAddress}</p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-foreground/40">
          {order.paymentMethod === "card" ? <CreditCard className="w-3 h-3" /> : <Building className="w-3 h-3" />}
          <span>{order.paymentMethod === "card" ? "Credit / Debit Card" : "Bank Transfer"}</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Ordered Items</p>
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 text-xs">
              <span className="text-foreground/80 truncate">{item.name}</span>
              <span className="text-foreground/40">×{item.quantity}</span>
              <span className="text-foreground">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 pt-3">
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Financials</p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-foreground/60"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          <div className="flex justify-between text-foreground/60"><span>Delivery</span><span>{formatCurrency(order.deliveryFee)}</span></div>
          <div className="flex justify-between text-foreground/60"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
          {order.discount ? <div className="flex justify-between text-emerald-400"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div> : null}
          <div className="flex justify-between text-sm font-semibold text-foreground border-t border-white/10 pt-2 mt-1">
            <span>Total</span><span>{formatCurrency(order.totalAmount)}</span>
          </div>
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
        <span className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium", cfg.color)}>
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

      <button
        onClick={onPrint}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-foreground/60 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
      >
        <Printer className="w-3.5 h-3.5" /> Print Receipt
      </button>
    </div>
  );
}

export default function AdminOrders() {
  const { orders, resetOrders } = useRestaurantStore();
  const config = useRestaurantStore((s) => s.config);
  const [filter,          setFilter]          = useState<StatusFilter>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [search,          setSearch]          = useState("");
  const [printData,       setPrintData]       = useState<ReceiptData | null>(null);
  const [resetOpen,       setResetOpen]       = useState(false);

  const allDone = orders.length > 0 && orders.every((o) => o.status === "completed" || o.status === "cancelled");

  const counts: Record<StatusFilter, number> = {
    all:       orders.length,
    new:       orders.filter((o) => o.status === "new").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready:     orders.filter((o) => o.status === "ready").length,
    completed: orders.filter((o) => o.status === "completed").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const filtered = orders
    .filter((o) => filter === "all" || o.status === filter)
    .filter((o) => !search || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search))
    .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());

  const openPrintModal = (order: Order) => {
    setPrintData({
      type: "order",
      id: order.id.replace("ord-", ""),
      restaurantName: config.name,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      date: new Date(order.orderedAt).toLocaleString(),
      items: order.items,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      tax: order.tax,
      discount: order.discount,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      deliveryAddress: order.deliveryAddress,
      specialNotes: order.specialNotes,
    });
  };

  return (
    <AdminLayout
      title="Orders Manager"
      subtitle="Manage and track all customer orders"
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {allDone && (
            <button
              onClick={() => setResetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/20 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset Orders
            </button>
          )}
          <button
            onClick={() => exportOrdersCSV(filtered)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors"
          >
            <Download className="w-3 h-3" /> Export CSV
          </button>
        </div>
      }
    >
      {printData && <PrintReceiptModal data={printData} onClose={() => setPrintData(null)} />}

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all orders?"
        description="This will permanently delete all orders from the orders list. This cannot be undone."
        onConfirm={() => { resetOrders(); setSelectedOrderId(null); setResetOpen(false); }}
      />

      <div className={cn("grid gap-5", selectedOrderId ? "grid-cols-1 xl:grid-cols-[1fr_340px]" : "grid-cols-1")}>
        <div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex gap-1.5 flex-wrap flex-1">
              {(["all","new","preparing","ready","completed","cancelled"] as StatusFilter[]).map((s) => {
                const cfg = s === "all" ? null : STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs capitalize transition-colors border",
                      filter === s
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-white/5 text-foreground/50 border-white/10 hover:bg-white/10 hover:text-foreground"
                    )}
                  >
                    {s === "all" ? "All Orders" : cfg?.label} <span className="opacity-60 ml-1">{counts[s]}</span>
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders…"
                className="pl-8 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40 w-44"
              />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="hidden lg:grid grid-cols-[1.8fr_1.2fr_0.8fr_0.9fr_0.9fr_0.8fr] text-xs text-foreground/40 uppercase tracking-widest px-4 py-3 border-b border-white/10">
              <span>Customer</span>
              <span>Date & Time</span>
              <span>Payment</span>
              <span>Status</span>
              <span>Total</span>
              <span>Actions</span>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-14 text-foreground/30 text-sm flex flex-col items-center gap-2">
                <ShoppingBag className="w-8 h-8 opacity-30" />
                {orders.length === 0 ? "No orders yet. Orders placed on the customer site will appear here." : "No orders match this filter."}
              </div>
            )}

            {filtered.map((order) => {
              const cfg        = STATUS_CONFIG[order.status];
              const isSelected = selectedOrderId === order.id;
              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(isSelected ? null : order.id)}
                  className={cn(
                    "grid grid-cols-1 lg:grid-cols-[1.8fr_1.2fr_0.8fr_0.9fr_0.9fr_0.8fr] items-center px-4 py-3.5 border-b border-white/5 last:border-0 cursor-pointer transition-colors hover:bg-white/[0.03] gap-2 lg:gap-0",
                    isSelected && "bg-primary/5"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                    <p className="text-xs text-foreground/40 font-mono">#{order.id.replace("ord-", "")}</p>
                  </div>
                  <div className="text-xs text-foreground/60 flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>
                      {new Date(order.orderedAt).toLocaleDateString()}{" "}
                      {new Date(order.orderedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <span className="text-xs text-foreground/60">{order.paymentMethod === "card" ? "Card" : "Bank"}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium capitalize w-fit", cfg.color)}>
                    {cfg.label}
                  </span>
                  <span className="text-sm font-medium text-foreground">{formatCurrency(order.totalAmount)}</span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedOrderId(isSelected ? null : order.id)}
                      className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"
                      title="View details"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openPrintModal(order)}
                      className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"
                      title="Print receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom print button — only when selected */}
          {selectedOrderId && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  const order = orders.find((o) => o.id === selectedOrderId);
                  if (order) openPrintModal(order);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-foreground/60 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                <Printer className="w-4 h-4" /> Print Selected Receipt
              </button>
            </div>
          )}
        </div>

        {selectedOrderId && (
          <OrderDetailPanel
            orderId={selectedOrderId}
            onClose={() => setSelectedOrderId(null)}
            onPrint={() => {
              const order = orders.find((o) => o.id === selectedOrderId);
              if (order) openPrintModal(order);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}
