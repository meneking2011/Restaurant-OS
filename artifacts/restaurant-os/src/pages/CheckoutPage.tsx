import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cartStore";
import { useRestaurantStore } from "@/store/restaurantStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { ImageComponent } from "@/components/ui/ImageComponent";
import { Link } from "wouter";
import {
  Minus, Plus, Trash2, Building, ShoppingBag, Clock, ChefHat,
  PackageCheck, CheckCircle2, XCircle, Upload, AlertCircle,
  Truck, MapPin, MessageCircle, FileText, Eye, X, Hourglass,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { BankAccount } from "@/types/restaurant";

const ACTIVE_ORDER_KEY = "ros_active_order_id";

// ── Status display metadata ──────────────────────────────────────────────────

const ORDER_STATUS_META: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  new:             { label: "Order Received",    icon: Clock,        color: "text-primary" },
  preparing:       { label: "Being Prepared",    icon: ChefHat,      color: "text-amber-400" },
  ready:           { label: "Ready for Pickup",  icon: PackageCheck, color: "text-emerald-400" },
  out_for_delivery:{ label: "Out for Delivery",  icon: Truck,        color: "text-blue-400" },
  delivered:       { label: "Delivered",         icon: CheckCircle2, color: "text-emerald-400" },
  cancelled:       { label: "Cancelled",         icon: XCircle,      color: "text-red-400" },
};

const PAYMENT_STATUS_META: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending_receipt:      { label: "Awaiting Receipt Upload",     color: "text-amber-400",   icon: Upload },
  pending_verification: { label: "Awaiting Payment Confirmation", color: "text-blue-400", icon: Hourglass },
  verified:             { label: "Payment Verified",            color: "text-emerald-400", icon: CheckCircle2 },
  rejected:             { label: "Payment Unsuccessful",        color: "text-red-400",     icon: XCircle },
};

// ── Receipt preview modal ────────────────────────────────────────────────────

function ReceiptPreviewModal({ url, fileName, onClose }: { url: string; fileName?: string; onClose: () => void }) {
  const isPdf = fileName?.toLowerCase().endsWith(".pdf") || url.startsWith("data:application/pdf");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-card border border-border rounded-sm max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <p className="text-sm font-medium uppercase tracking-widest">Payment Receipt</p>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
          {isPdf ? (
            <div className="text-center space-y-4">
              <FileText className="w-16 h-16 text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">{fileName ?? "receipt.pdf"}</p>
              <a
                href={url}
                download={fileName ?? "receipt.pdf"}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm hover:bg-primary/90"
              >
                Download PDF
              </a>
            </div>
          ) : (
            <img src={url} alt="Payment receipt" className="max-w-full max-h-[60vh] object-contain rounded-sm" />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Order tracking view ──────────────────────────────────────────────────────

function OrderTrackingView({
  orderId,
  customerName,
  onNewOrder,
  restaurantPhone,
  restaurantEmail,
}: {
  orderId: string;
  customerName: string;
  onNewOrder: () => void;
  restaurantPhone: string;
  restaurantEmail: string;
}) {
  const { orders, submitOrderReceipt, bankAccounts } = useRestaurantStore();
  const order = orders.find((o) => o.id === orderId) ?? null;

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const enabledBanks = bankAccounts.filter((b) => b.enabled);

  // Pre-select the bank the customer chose at checkout, or first enabled
  useEffect(() => {
    if (!selectedBankId) {
      const preferred = order?.selectedBankAccountId ?? enabledBanks[0]?.id ?? "";
      setSelectedBankId(preferred);
    }
  }, [enabledBanks.length]);

  if (!order) return null;

  const orderMeta = ORDER_STATUS_META[order.status] ?? ORDER_STATUS_META.new;
  const payMeta   = PAYMENT_STATUS_META[order.paymentStatus] ?? PAYMENT_STATUS_META.pending_receipt;
  const OrderIcon = orderMeta.icon;
  const PayIcon   = payMeta.icon;

  const isFinalOrder = order.status === "delivered" || order.status === "cancelled";
  const selectedBank = bankAccounts.find((b) => b.id === selectedBankId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setUploadError("");
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setUploadError("Only JPG, PNG, WEBP, or PDF files are accepted.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File must be under 10 MB.");
      return;
    }
    setReceiptFile(file);
    const url = URL.createObjectURL(file);
    setReceiptPreviewUrl(url);
  };

  const handleSubmitReceipt = async () => {
    if (!receiptFile) { setUploadError("Please select a receipt file."); return; }
    if (!selectedBankId) { setUploadError("Please select which bank account you transferred to."); return; }
    setUploading(true);
    setUploadError("");
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        submitOrderReceipt(orderId, dataUrl, receiptFile.name, selectedBankId);
        setUploading(false);
      };
      reader.onerror = () => {
        setUploadError("Failed to read the file. Please try again.");
        setUploading(false);
      };
      reader.readAsDataURL(receiptFile);
    } catch {
      setUploadError("Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <SectionContainer className="bg-background pt-12 md:pt-24 min-h-[70vh] flex flex-col items-center justify-center">
      {showReceiptPreview && order.receiptUrl && (
        <ReceiptPreviewModal
          url={order.receiptUrl}
          fileName={order.receiptFileName}
          onClose={() => setShowReceiptPreview(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-sm max-w-2xl w-full mx-auto overflow-hidden"
      >
        {/* Header */}
        <div className="p-8 text-center border-b border-border">
          <div className="w-20 h-20 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <OrderIcon className={`w-9 h-9 ${orderMeta.color}`} />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl uppercase tracking-widest mb-2">
            {order.status === "cancelled" ? "Order Cancelled" : "Order Tracking"}
          </h1>
          <p className="text-xs uppercase tracking-widest font-medium text-muted-foreground mb-1">
            Order #{order.id.replace("ord-", "").slice(0, 8)}
          </p>
          <p className="text-muted-foreground text-sm">
            Thank you, {customerName || order.customerName}. Total: {formatCurrency(order.totalAmount)}
          </p>
        </div>

        {/* Payment status section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <PayIcon className={`w-4 h-4 shrink-0 ${payMeta.color}`} />
            <span className={`text-sm font-medium uppercase tracking-widest ${payMeta.color}`}>
              {payMeta.label}
            </span>
          </div>

          {/* Pending receipt — show bank details + upload form */}
          {order.paymentStatus === "pending_receipt" && (
            <div className="space-y-5">
              {enabledBanks.length === 0 ? (
                <div className="p-4 border border-border rounded-sm text-sm text-muted-foreground">
                  <AlertCircle className="w-4 h-4 inline mr-2 text-amber-500" />
                  Bank account details are being set up. Please contact us.
                </div>
              ) : (
                <>
                  {/* Bank selection */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                      Transfer payment to one of these accounts:
                    </p>
                    <div className="space-y-2">
                      {enabledBanks.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBankId(bank.id)}
                          className={`w-full text-left p-4 border rounded-sm transition-colors ${
                            selectedBankId === bank.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <p className="text-xs uppercase tracking-widest text-primary mb-2 font-medium">
                            {bank.bankName}
                          </p>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex justify-between">
                              <span className="opacity-70">Account Name</span>
                              <span className="font-medium text-foreground">{bank.accountName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="opacity-70">Account Number</span>
                              <span className="font-medium text-foreground font-mono">{bank.accountNumber}</span>
                            </div>
                            {bank.sortCode && (
                              <div className="flex justify-between">
                                <span className="opacity-70">Sort Code / Routing</span>
                                <span className="font-medium text-foreground">{bank.sortCode}</span>
                              </div>
                            )}
                            {bank.iban && (
                              <div className="flex justify-between">
                                <span className="opacity-70">IBAN</span>
                                <span className="font-medium text-foreground">{bank.iban}</span>
                              </div>
                            )}
                            {bank.swiftBic && (
                              <div className="flex justify-between">
                                <span className="opacity-70">SWIFT / BIC</span>
                                <span className="font-medium text-foreground">{bank.swiftBic}</span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-2">
                      Use your order number <span className="font-mono text-primary">#{order.id.replace("ord-", "").slice(0, 8)}</span> as the payment reference.
                    </p>
                  </div>

                  {/* Receipt upload */}
                  <div className="border-t border-border pt-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                      Upload your payment receipt
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-border rounded-sm p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      {receiptFile ? (
                        <div className="space-y-1">
                          <FileText className="w-8 h-8 text-primary mx-auto" />
                          <p className="text-sm text-foreground font-medium">{receiptFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(receiptFile.size / 1024).toFixed(0)} KB — click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                          <p className="text-sm text-muted-foreground">Click to upload receipt</p>
                          <p className="text-xs text-muted-foreground/60">JPG, PNG, WEBP or PDF · max 10 MB</p>
                        </div>
                      )}
                    </div>

                    {receiptPreviewUrl && receiptFile && !receiptFile.name.endsWith(".pdf") && (
                      <div className="mt-3">
                        <img src={receiptPreviewUrl} alt="Receipt preview" className="max-h-40 rounded-sm border border-border mx-auto object-contain" />
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {uploadError}
                      </p>
                    )}

                    <Button
                      onClick={handleSubmitReceipt}
                      disabled={!receiptFile || uploading}
                      className="w-full mt-4 h-12 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none uppercase tracking-widest font-semibold disabled:opacity-50"
                    >
                      {uploading ? "Uploading…" : "Verify Payment"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Pending verification */}
          {order.paymentStatus === "pending_verification" && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-400/5 border border-blue-400/20 rounded-sm text-sm text-blue-300 leading-relaxed">
                <Hourglass className="w-4 h-4 inline mr-2 text-blue-400" />
                Your receipt has been submitted. Our team will review and confirm your payment shortly.
              </div>
              {order.receiptUrl && (
                <button
                  onClick={() => setShowReceiptPreview(true)}
                  className="flex items-center gap-2 text-xs text-primary hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" /> View submitted receipt
                </button>
              )}
              {order.receiptUploadedAt && (
                <p className="text-xs text-muted-foreground/60">
                  Submitted {new Date(order.receiptUploadedAt).toLocaleString()}
                  {order.selectedBankAccountId && selectedBank &&
                    ` · Transferred to ${selectedBank.bankName}`
                  }
                </p>
              )}
            </div>
          )}

          {/* Verified */}
          {order.paymentStatus === "verified" && (
            <div className="space-y-2">
              <div className="p-4 bg-emerald-400/5 border border-emerald-400/20 rounded-sm text-sm text-emerald-300 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 inline mr-2 text-emerald-400" />
                Payment successful. Your order has been accepted and is now being prepared.
              </div>
              {order.paymentVerifiedAt && (
                <p className="text-xs text-muted-foreground/60">Verified {new Date(order.paymentVerifiedAt).toLocaleString()}</p>
              )}
            </div>
          )}

          {/* Rejected */}
          {order.paymentStatus === "rejected" && (
            <div className="space-y-4">
              <div className="p-4 bg-red-400/5 border border-red-400/20 rounded-sm text-sm text-red-300 leading-relaxed">
                <XCircle className="w-4 h-4 inline mr-2 text-red-400" />
                Payment unsuccessful.
                {order.paymentRejectionReason && (
                  <span> Reason: <em>{order.paymentRejectionReason}</em></span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Please contact us for assistance or to re-submit your payment proof.
              </p>
            </div>
          )}
        </div>

        {/* Order progress — only visible after payment verified */}
        {order.paymentStatus === "verified" && order.status !== "cancelled" && (
          <div className="p-6 border-b border-border">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Order Progress</p>
            <div className="flex items-center gap-1 flex-wrap">
              {(["preparing", "ready", "out_for_delivery", "delivered"] as const).map((s, idx, arr) => {
                const meta = ORDER_STATUS_META[s];
                const statuses = ["preparing", "ready", "out_for_delivery", "delivered"];
                const currentIdx = statuses.indexOf(order.status);
                const stepIdx = statuses.indexOf(s);
                const done = currentIdx >= stepIdx;
                const active = order.status === s;
                return (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`flex flex-col items-center gap-1 min-w-[60px]`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                        done ? "bg-primary border-primary" : "border-border bg-background"
                      }`}>
                        <meta.icon className={`w-3.5 h-3.5 ${done ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      </div>
                      <span className={`text-[10px] text-center leading-tight ${active ? "text-primary font-medium" : done ? "text-foreground/60" : "text-muted-foreground/40"}`}>
                        {meta.label}
                      </span>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className={`h-px w-4 sm:w-8 mb-4 ${currentIdx > stepIdx ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact support */}
        <div className="p-6 bg-card/50">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Need help with your order or payment?
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${restaurantPhone}`}
              className="flex items-center gap-2 px-4 py-2.5 border border-primary text-primary rounded-sm text-sm hover:bg-primary hover:text-primary-foreground transition-colors uppercase tracking-widest"
            >
              <MessageCircle className="w-4 h-4" />
              Call Restaurant
            </a>
            <a
              href={`mailto:${restaurantEmail}?subject=Order%20%23${order.id.replace("ord-", "").slice(0, 8)}`}
              className="flex items-center gap-2 px-4 py-2.5 border border-border text-muted-foreground rounded-sm text-sm hover:border-primary hover:text-primary transition-colors uppercase tracking-widest"
            >
              <MapPin className="w-4 h-4" />
              Email Support
            </a>
            <Link
              href="/contact"
              className="flex items-center gap-2 px-4 py-2.5 border border-border text-muted-foreground rounded-sm text-sm hover:border-primary hover:text-primary transition-colors uppercase tracking-widest"
            >
              Contact Page
            </Link>
          </div>
        </div>

        {/* New order button — only when order is fully done */}
        {isFinalOrder && (
          <div className="p-6 text-center border-t border-border">
            <Button
              onClick={onNewOrder}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none uppercase tracking-widest px-10 h-12"
            >
              Place a New Order
            </Button>
          </div>
        )}
      </motion.div>
    </SectionContainer>
  );
}

// ── Main checkout form ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const {
    addOrder, quickControls, config, deliverySettings, bankAccounts,
  } = useRestaurantStore();

  const enabledBanks = bankAccounts.filter((b) => b.enabled);

  const [activeOrderId, setActiveOrderId] = useState<string | null>(
    () => sessionStorage.getItem(ACTIVE_ORDER_KEY)
  );
  const [customerName, setCustomerName] = useState("");

  // Form fields
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [phone,        setPhone]        = useState("");
  const [address,      setAddress]      = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
  const [formError,    setFormError]    = useState("");

  // Auto-select first enabled bank
  useEffect(() => {
    if (enabledBanks.length > 0 && !selectedBank) {
      setSelectedBank(enabledBanks[0]);
    }
  }, [enabledBanks.length]);

  useEffect(() => {
    document.title = `Checkout | ${config.name}`;
  }, [config.name]);

  const taxRate     = deliverySettings?.taxRate   ?? 0.08;
  const feeAmount   = deliverySettings?.fee       ?? 15;
  const subtotal    = getTotal();
  const tax         = subtotal * taxRate;
  const deliveryFee = subtotal > 0 ? feeAmount : 0;
  const total       = subtotal + tax + deliveryFee;
  const taxPct      = Math.round(taxRate * 100);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (enabledBanks.length === 0) {
      setFormError("No bank accounts available. Please contact the restaurant.");
      return;
    }
    setFormError("");

    const newOrderId = addOrder({
      customerName: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      deliveryAddress: address.trim(),
      specialNotes: instructions.trim() || undefined,
      items: items.map((ci) => ({
        menuItemId: ci.menuItem.id,
        name: ci.menuItem.name,
        quantity: ci.quantity,
        price: ci.menuItem.price,
      })),
      paymentMethod: "bankTransfer",
      selectedBankAccountId: selectedBank?.id,
      subtotal,
      deliveryFee,
      tax,
      totalAmount: total,
    });

    sessionStorage.setItem(ACTIVE_ORDER_KEY, newOrderId);
    setActiveOrderId(newOrderId);
    setCustomerName(name.trim());
    clearCart();
    window.scrollTo(0, 0);
  };

  // Restaurant closed / orders paused gate
  if (!quickControls.restaurantOpen || !quickControls.onlineOrders) {
    const closedForBusiness = !quickControls.restaurantOpen;
    return (
      <Layout>
        <SectionContainer className="bg-background pt-12 md:pt-24 min-h-[70vh] flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-card p-12 border border-border rounded-sm max-w-2xl w-full"
          >
            <div className="w-20 h-20 border border-border rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl uppercase tracking-widest mb-4">
              {closedForBusiness ? "We're Currently Closed" : "Online Orders Paused"}
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              {closedForBusiness
                ? "We are closed right now and not accepting online orders. Please check back during our opening hours to order."
                : "We are not accepting online orders at this time. Please call us or visit in person."}
            </p>
            <Button asChild variant="outline" className="rounded-none tracking-widest uppercase border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </motion.div>
        </SectionContainer>
      </Layout>
    );
  }

  // Active order tracking view
  if (activeOrderId) {
    return (
      <Layout>
        <OrderTrackingView
          orderId={activeOrderId}
          customerName={customerName}
          restaurantPhone={config.phone}
          restaurantEmail={config.email}
          onNewOrder={() => {
            sessionStorage.removeItem(ACTIVE_ORDER_KEY);
            setActiveOrderId(null);
          }}
        />
      </Layout>
    );
  }

  // ── Checkout form ────────────────────────────────────────────────────────
  return (
    <Layout>
      <SectionContainer className="bg-background pt-12 md:pt-20">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12">
          <h1 className="font-serif text-3xl md:text-5xl font-medium tracking-widest uppercase mb-4">
            Checkout & Order Summary
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-sm max-w-3xl mx-auto">
            <p className="text-muted-foreground text-xl mb-8">Your order is empty.</p>
            <Button
              asChild
              variant="outline"
              className="rounded-none tracking-widest uppercase border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Link href="/menu">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 max-w-6xl mx-auto">
            {/* Left: Cart Items */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h2 className="text-lg font-serif uppercase tracking-widest text-primary border-b border-border pb-4">
                Your Selection
              </h2>
              <div className="flex flex-col gap-6">
                {items.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex gap-4 p-4 bg-card border border-border/50 items-center"
                  >
                    <div className="w-20 h-20 shrink-0">
                      <ImageComponent
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        aspectRatio="square"
                        className="w-full h-full object-cover rounded-sm"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-center min-w-0">
                      <h3 className="font-serif text-base md:text-lg tracking-widest uppercase text-foreground truncate">
                        {item.menuItem.name}
                      </h3>
                      <div className="text-primary font-medium">
                        {formatCurrency(item.menuItem.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                      <div className="flex items-center border border-border">
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.menuItem.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 transition-colors rounded-sm"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form & Summary */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <form
                onSubmit={handleCheckout}
                className="bg-card border border-border p-5 md:p-8 rounded-sm flex flex-col gap-6"
              >
                {/* Customer Info */}
                <div>
                  <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
                    Your Details
                  </h2>
                  <div className="flex flex-col gap-4">
                    <Input required placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="bg-background border-border rounded-none h-12" />
                    <Input required type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background border-border rounded-none h-12" />
                    <Input required type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-background border-border rounded-none h-12" />
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
                    Delivery Details
                  </h2>
                  <div className="flex flex-col gap-4">
                    <Input required placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-background border-border rounded-none h-12" />
                    <Input placeholder="Delivery Instructions (Optional)" value={instructions} onChange={(e) => setInstructions(e.target.value)} className="bg-background border-border rounded-none h-12" />
                  </div>
                </div>

                {/* Bank Transfer info */}
                <div>
                  <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
                    Payment — Bank Transfer
                  </h2>
                  {enabledBanks.length === 0 ? (
                    <div className="flex items-start gap-3 p-4 border border-border bg-background text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                      <span>Bank transfer accounts are being configured. Please contact us to arrange payment.</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {enabledBanks.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`w-full text-left flex items-center gap-3 p-4 border rounded-none transition-colors ${
                            selectedBank?.id === bank.id
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border text-muted-foreground hover:border-primary/50"
                          }`}
                        >
                          <Building className="w-5 h-5 shrink-0" />
                          <div>
                            <p className="text-xs uppercase tracking-widest font-medium">{bank.bankName}</p>
                            <p className="text-xs opacity-70 mt-0.5">{bank.accountName} · {bank.accountNumber}</p>
                          </div>
                        </button>
                      ))}
                      <p className="text-xs text-muted-foreground/60 pt-1">
                        After placing your order you will be asked to upload your payment receipt for verification before your order is processed.
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Summary */}
                <div className="border-t border-border pt-6">
                  <h2 className="text-sm font-medium tracking-widest uppercase text-primary mb-4">
                    Order Summary
                  </h2>
                  <div className="flex flex-col gap-3 text-sm text-muted-foreground mb-6">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between"><span>Service & Delivery</span><span>{formatCurrency(deliveryFee)}</span></div>
                    <div className="flex justify-between"><span>Tax ({taxPct}%)</span><span>{formatCurrency(tax)}</span></div>
                  </div>
                  <div className="flex justify-between items-center text-lg font-serif uppercase tracking-widest text-foreground border-t border-border pt-4 mb-6">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>

                  {formError && (
                    <p className="text-red-400 text-sm mb-4 text-center">{formError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={enabledBanks.length === 0}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-none tracking-widest uppercase font-semibold disabled:opacity-50"
                    data-testid="button-place-order"
                  >
                    {enabledBanks.length === 0
                      ? "Payment Not Available"
                      : `Place Order — ${formatCurrency(total)}`}
                  </Button>
                </div>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                Need help?{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        )}
      </SectionContainer>
    </Layout>
  );
}
