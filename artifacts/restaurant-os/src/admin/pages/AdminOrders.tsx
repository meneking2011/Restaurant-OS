import { useState, useRef } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Order, OrderStatus } from "@/types/restaurant";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { PrintReceiptModal, ReceiptData } from "../components/PrintReceiptModal";
import {
  ShoppingBag, Clock, CheckCircle, XCircle, ChefHat, Truck,
  Building, X, Download, Search, Printer, RotateCcw,
  Upload, Eye, CheckCircle2, AlertCircle, FileText, Hourglass,
  MessageSquare, MapPin,
} from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { ConfirmDialog } from "../components/ConfirmDialog";

type StatusFilter = "all" | "new" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";
type PaymentFilter = "all" | "pending_receipt" | "pending_verification" | "verified" | "rejected";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  new:             { label: "New",             color: "text-blue-400 bg-blue-400/10 border-blue-400/20",            icon: ShoppingBag },
  preparing:       { label: "Preparing",       color: "text-amber-400 bg-amber-400/10 border-amber-400/20",         icon: ChefHat     },
  ready:           { label: "Ready",           color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",   icon: CheckCircle },
  out_for_delivery:{ label: "Out for Delivery",color: "text-blue-300 bg-blue-300/10 border-blue-300/20",            icon: Truck       },
  delivered:       { label: "Delivered",       color: "text-foreground/40 bg-white/5 border-white/10",              icon: CheckCircle2},
  cancelled:       { label: "Cancelled",       color: "text-red-400 bg-red-400/10 border-red-400/20",               icon: XCircle    },
};

const STATUS_FLOW: Partial<Record<OrderStatus, OrderStatus>> = {
  preparing:       "ready",
  ready:           "out_for_delivery",
  out_for_delivery:"delivered",
};

const PAYMENT_STATUS_CONFIG = {
  pending_receipt:      { label: "Awaiting Receipt",        color: "text-amber-400 bg-amber-400/10 border-amber-400/20",    icon: Upload    },
  pending_verification: { label: "Pending Verification",    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",       icon: Hourglass },
  verified:             { label: "Payment Verified",        color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",icon: CheckCircle2 },
  rejected:             { label: "Payment Rejected",        color: "text-red-400 bg-red-400/10 border-red-400/20",          icon: XCircle   },
};

function exportOrdersCSV(orders: Order[]) {
  const header = ["Order ID","Customer","Email","Phone","Date","Status","Payment Status","Total","Address","Notes"];
  const rows = orders.map((o) => [
    o.id, o.customerName, o.email, o.phone,
    new Date(o.orderedAt).toLocaleString(), o.status, o.paymentStatus,
    o.totalAmount.toFixed(2), o.deliveryAddress ?? "", o.specialNotes ?? "",
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

// ── Receipt preview modal ─────────────────────────────────────────────────────

function ReceiptPreviewModal({ url, fileName, onClose }: { url: string; fileName?: string; onClose: () => void }) {
  const isPdf = fileName?.toLowerCase().endsWith(".pdf") || url.startsWith("data:application/pdf");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[hsl(15,13%,7%)] border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <p className="text-sm font-semibold text-foreground">
            Payment Receipt {fileName && <span className="text-foreground/40 font-normal text-xs ml-2">— {fileName}</span>}
          </p>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-auto p-5 flex items-center justify-center min-h-[200px]">
          {isPdf ? (
            <div className="text-center space-y-4">
              <FileText className="w-16 h-16 text-primary mx-auto" />
              <p className="text-sm text-foreground/60">{fileName ?? "receipt.pdf"}</p>
              <a href={url} download={fileName ?? "receipt.pdf"}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-black text-sm rounded-lg hover:bg-primary/80 transition-colors">
                Download PDF
              </a>
            </div>
          ) : (
            <img src={url} alt="Payment receipt" className="max-w-full max-h-[60vh] object-contain rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reject payment dialog ─────────────────────────────────────────────────────

function RejectPaymentDialog({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { rejectOrderPayment } = useRestaurantStore();
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[hsl(15,13%,7%)] border border-white/10 rounded-xl max-w-md w-full p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Reject Payment</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-foreground/40"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-xs text-foreground/50">
          Provide a reason for rejection (optional). The customer will see this on their order tracking page.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Receipt image is unclear, wrong amount transferred, etc."
          rows={3}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-red-400/50 resize-none"
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-white/5 text-foreground/60 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">Cancel</button>
          <button
            onClick={() => { rejectOrderPayment(orderId, reason.trim()); onClose(); }}
            className="px-4 py-2 bg-red-500/15 text-red-400 border border-red-400/20 rounded-lg text-sm hover:bg-red-500/25 transition-colors"
          >
            Reject Payment
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Order detail panel ────────────────────────────────────────────────────────

function OrderDetailPanel({
  orderId, onClose, onPrint,
}: {
  orderId: string;
  onClose: () => void;
  onPrint: () => void;
}) {
  const order = useRestaurantStore((s) => s.orders.find((o) => o.id === orderId));
  const bankAccounts = useRestaurantStore((s) => s.bankAccounts);
  const { updateOrderStatus, verifyOrderPayment } = useRestaurantStore();

  const [showReceipt, setShowReceipt]   = useState(false);
  const [showReject,  setShowReject]    = useState(false);

  if (!order) return null;

  const cfg        = STATUS_CONFIG[order.status];
  const nextStatus = STATUS_FLOW[order.status];
  const payCfg     = PAYMENT_STATUS_CONFIG[order.paymentStatus];
  const PayIcon    = payCfg.icon;
  const selectedBank = bankAccounts.find((b) => b.id === order.selectedBankAccountId);

  const canAdvance = order.paymentStatus === "verified" && nextStatus && order.status !== "delivered";
  const canVerify  = order.paymentStatus === "pending_verification";
  const canReject  = order.paymentStatus === "pending_verification";

  return (
    <>
      {showReceipt && order.receiptUrl && (
        <ReceiptPreviewModal url={order.receiptUrl} fileName={order.receiptFileName} onClose={() => setShowReceipt(false)} />
      )}
      {showReject && (
        <RejectPaymentDialog orderId={order.id} onClose={() => setShowReject(false)} />
      )}

      <div className="bg-[hsl(15,13%,7%)] border border-white/10 rounded-xl p-5 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-180px)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            Order <span className="text-primary">#{order.id.replace("ord-", "").slice(0, 8)}</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Customer */}
        <div>
          <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Customer & Delivery</p>
          <p className="text-sm font-semibold text-foreground">{order.customerName}</p>
          <p className="text-xs text-foreground/50">{order.email}</p>
          <p className="text-xs text-foreground/50">{order.phone}</p>
          <p className="text-xs text-foreground/50 mt-1">{order.deliveryAddress}</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-foreground/40">
            <Building className="w-3 h-3" />
            <span>Bank Transfer{selectedBank ? ` — ${selectedBank.bankName}` : ""}</span>
          </div>
        </div>

        {/* Payment status */}
        <div className="border border-white/8 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <PayIcon className={cn("w-3.5 h-3.5 shrink-0", payCfg.color.split(" ")[0])} />
            <span className={cn("text-xs font-medium", payCfg.color.split(" ")[0])}>{payCfg.label}</span>
          </div>

          {order.paymentStatus === "rejected" && order.paymentRejectionReason && (
            <p className="text-xs text-red-300/70 bg-red-400/5 border border-red-400/10 rounded px-2 py-1.5">
              Reason: {order.paymentRejectionReason}
            </p>
          )}

          {order.paymentVerifiedAt && (
            <p className="text-xs text-foreground/40">Verified {new Date(order.paymentVerifiedAt).toLocaleString()}</p>
          )}
          {order.paymentRejectedAt && (
            <p className="text-xs text-foreground/40">Rejected {new Date(order.paymentRejectedAt).toLocaleString()}</p>
          )}
          {order.receiptUploadedAt && (
            <p className="text-xs text-foreground/40">Receipt submitted {new Date(order.receiptUploadedAt).toLocaleString()}</p>
          )}

          {/* Receipt preview */}
          {order.receiptUrl && (
            <button
              onClick={() => setShowReceipt(true)}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
            >
              <Eye className="w-3 h-3" />
              View Payment Receipt
              {order.receiptFileName && <span className="text-foreground/40">({order.receiptFileName})</span>}
            </button>
          )}

          {/* Verify / Reject buttons */}
          {(canVerify || canReject) && (
            <div className="flex gap-2 pt-1">
              {canVerify && (
                <button
                  onClick={() => verifyOrderPayment(order.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-400/20 rounded-lg text-xs font-medium hover:bg-emerald-500/25 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verify Payment
                </button>
              )}
              {canReject && (
                <button
                  onClick={() => setShowReject(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-400/20 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject Payment
                </button>
              )}
            </div>
          )}
        </div>

        {/* Items */}
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

        {/* Financials */}
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

        {/* Order status */}
        <div>
          <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Order Status</p>
          <span className={cn("inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium", cfg.color)}>
            <cfg.icon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>

        {/* Order advancement — only after payment verified */}
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            {canAdvance && nextStatus && (
              <button
                onClick={() => updateOrderStatus(order.id, nextStatus)}
                className="w-full px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                Mark as {STATUS_CONFIG[nextStatus].label}
              </button>
            )}
            {!canAdvance && order.paymentStatus !== "verified" && (
              <p className="text-xs text-foreground/40 text-center">
                {order.paymentStatus === "pending_receipt" && "Waiting for customer to upload receipt"}
                {order.paymentStatus === "pending_verification" && "Verify or reject the payment to advance this order"}
                {order.paymentStatus === "rejected" && "Payment was rejected — order cannot advance"}
              </p>
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
    </>
  );
}

// ── Main orders page ──────────────────────────────────────────────────────────

export default function AdminOrders() {
  const { orders, resetOrders } = useRestaurantStore();
  const config = useRestaurantStore((s) => s.config);

  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [search,    setSearch]    = useState("");
  const [printData, setPrintData] = useState<ReceiptData | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const pendingVerificationCount = orders.filter((o) => o.paymentStatus === "pending_verification").length;
  const allDone = orders.length > 0 && orders.every((o) => o.status === "delivered" || o.status === "cancelled");

  const filtered = orders
    .filter((o) => statusFilter  === "all" || o.status        === statusFilter)
    .filter((o) => paymentFilter === "all" || o.paymentStatus === paymentFilter)
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

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: "all",             label: "All" },
    { key: "new",             label: "New" },
    { key: "preparing",       label: "Preparing" },
    { key: "ready",           label: "Ready" },
    { key: "out_for_delivery",label: "Out for Delivery" },
    { key: "delivered",       label: "Delivered" },
    { key: "cancelled",       label: "Cancelled" },
  ];

  const paymentFilters: { key: PaymentFilter; label: string; icon?: React.ElementType }[] = [
    { key: "all",                  label: "All Payments" },
    { key: "pending_receipt",      label: "Awaiting Receipt",     icon: Upload    },
    { key: "pending_verification", label: "Pending Verification", icon: Hourglass },
    { key: "verified",             label: "Verified",             icon: CheckCircle2 },
    { key: "rejected",             label: "Rejected",             icon: XCircle   },
  ];

  return (
    <AdminLayout
      title="Orders Manager"
      subtitle="Manage orders and verify customer payments"
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {pendingVerificationCount > 0 && (
            <button
              onClick={() => setPaymentFilter("pending_verification")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs hover:bg-amber-500/20 transition-colors"
            >
              <Hourglass className="w-3 h-3" />
              {pendingVerificationCount} Pending Verification
            </button>
          )}
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

      <div className={cn("grid gap-5", selectedOrderId ? "grid-cols-1 xl:grid-cols-[1fr_360px]" : "grid-cols-1")}>
        <div>
          {/* Status filters */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex gap-1.5 flex-wrap flex-1">
              {statusFilters.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs capitalize transition-colors border",
                    statusFilter === key
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-white/5 text-foreground/50 border-white/10 hover:bg-white/10 hover:text-foreground"
                  )}
                >
                  {label}
                  <span className="opacity-60 ml-1">
                    {key === "all" ? orders.length : orders.filter((o) => o.status === key).length}
                  </span>
                </button>
              ))}
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

          {/* Payment filters */}
          <div className="flex gap-1.5 flex-wrap mb-4">
            {paymentFilters.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPaymentFilter(key)}
                className={cn(
                  "flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors border",
                  paymentFilter === key
                    ? key === "pending_verification"
                      ? "bg-amber-400/15 text-amber-400 border-amber-400/30"
                      : "bg-primary/15 text-primary border-primary/30"
                    : "bg-white/5 text-foreground/50 border-white/10 hover:bg-white/10 hover:text-foreground"
                )}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {label}
              </button>
            ))}
          </div>

          {/* Orders table */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="hidden lg:grid grid-cols-[1.5fr_1.2fr_1fr_1fr_0.8fr_0.7fr] text-xs text-foreground/40 uppercase tracking-widest px-4 py-3 border-b border-white/10">
              <span>Customer</span>
              <span>Date & Time</span>
              <span>Order Status</span>
              <span>Payment</span>
              <span>Total</span>
              <span>Actions</span>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-14 text-foreground/30 text-sm flex flex-col items-center gap-2">
                <ShoppingBag className="w-8 h-8 opacity-30" />
                {orders.length === 0
                  ? "No orders yet. Orders placed on the customer site will appear here."
                  : "No orders match this filter."}
              </div>
            )}

            {filtered.map((order) => {
              const cfg     = STATUS_CONFIG[order.status];
              const payCfg  = PAYMENT_STATUS_CONFIG[order.paymentStatus];
              const PayIcon = payCfg.icon;
              const isSelected = selectedOrderId === order.id;
              const hasPendingVerification = order.paymentStatus === "pending_verification";

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(isSelected ? null : order.id)}
                  className={cn(
                    "grid grid-cols-1 lg:grid-cols-[1.5fr_1.2fr_1fr_1fr_0.8fr_0.7fr] items-center px-4 py-3.5 border-b border-white/5 last:border-0 cursor-pointer transition-colors hover:bg-white/[0.03] gap-2 lg:gap-0",
                    isSelected && "bg-primary/5",
                    hasPendingVerification && !isSelected && "border-l-2 border-l-amber-400/40"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                    <p className="text-xs text-foreground/40 font-mono">#{order.id.replace("ord-", "").slice(0, 8)}</p>
                  </div>
                  <div className="text-xs text-foreground/60 flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>
                      {new Date(order.orderedAt).toLocaleDateString()}{" "}
                      {new Date(order.orderedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium capitalize w-fit flex items-center gap-1", cfg.color)}>
                    <cfg.icon className="w-2.5 h-2.5" /> {cfg.label}
                  </span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full border font-medium w-fit flex items-center gap-1", payCfg.color.split(" ").slice(0,3).join(" "))}>
                    <PayIcon className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[90px]">{payCfg.label}</span>
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
