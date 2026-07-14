import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cartStore";
import { useRestaurantStore } from "@/store/restaurantStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { ImageComponent } from "@/components/ui/ImageComponent";
import { Link } from "wouter";
import { Minus, Plus, Trash2, Building, ShoppingBag, Clock, ChefHat, PackageCheck, CheckCircle2, XCircle, CreditCard, Wallet, Banknote, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { PAYMENT_METHODS, PAYMENT_PROVIDERS } from "@/types/restaurant";
import type { PaymentMethodId } from "@/types/restaurant";

const ACTIVE_ORDER_KEY = "ros_active_order_id";

const STATUS_META: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  new:       { label: "Order Received",  icon: Clock,          color: "text-primary" },
  preparing: { label: "Being Prepared",  icon: ChefHat,        color: "text-amber-400" },
  ready:     { label: "Ready",           icon: PackageCheck,   color: "text-emerald-400" },
  completed: { label: "Completed",       icon: CheckCircle2,   color: "text-emerald-400" },
  cancelled: { label: "Cancelled",       icon: XCircle,        color: "text-red-400" },
};

const METHOD_ICONS: Record<PaymentMethodId, typeof CreditCard> = {
  card:           CreditCard,
  bankTransfer:   Building,
  mobileWallet:   Wallet,
  cashOnDelivery: Banknote,
};

export default function CheckoutPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const { addOrder, quickControls, config, deliverySettings, orders, paymentSettings } = useRestaurantStore();
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => sessionStorage.getItem(ACTIVE_ORDER_KEY));
  const [customerName, setCustomerName] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [formError, setFormError] = useState("");

  // Derive enabled payment methods from admin settings
  const enabledMethods = PAYMENT_METHODS.filter((m) => paymentSettings.methodsEnabled[m.key]);
  const activeProvider = paymentSettings.activeProvider
    ? PAYMENT_PROVIDERS.find((p) => p.id === paymentSettings.activeProvider) ?? null
    : null;

  // Online payment methods (card / wallet) require a connected provider
  const availableMethods = enabledMethods.filter((m) => {
    if (m.key === "cashOnDelivery" || m.key === "bankTransfer") return true;
    return activeProvider !== null && activeProvider.supportedMethods.includes(m.key);
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId | null>(null);

  // Auto-select when available methods change
  useEffect(() => {
    if (availableMethods.length > 0 && (paymentMethod === null || !availableMethods.find((m) => m.key === paymentMethod))) {
      setPaymentMethod(availableMethods[0].key);
    } else if (availableMethods.length === 0) {
      setPaymentMethod(null);
    }
  }, [availableMethods.length]);

  useEffect(() => {
    document.title = `Checkout | ${config.name}`;
  }, [config.name]);

  const activeOrder = activeOrderId ? orders.find((o) => o.id === activeOrderId) ?? null : null;

  const taxRate     = deliverySettings?.taxRate     ?? 0.08;
  const feeAmount   = deliverySettings?.fee         ?? 15;
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
    if (!paymentMethod) {
      setFormError("Please select a payment method.");
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
      paymentMethod: paymentMethod,
      paymentStatus: "unpaid" as const,
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

  if (activeOrder) {
    const meta = STATUS_META[activeOrder.status];
    const StatusIcon = meta.icon;
    const isFinal = activeOrder.status === "completed" || activeOrder.status === "cancelled";
    return (
      <Layout>
        <SectionContainer className="bg-background pt-12 md:pt-24 min-h-[70vh] flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center bg-card p-12 border border-border rounded-sm max-w-2xl w-full"
          >
            <div className="w-24 h-24 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-8">
              <StatusIcon className={`w-10 h-10 ${meta.color}`} />
            </div>
            <h1 className="font-serif text-3xl md:text-5xl uppercase tracking-widest mb-4">
              {activeOrder.status === "cancelled" ? "Order Cancelled" : "Order Confirmed"}
            </h1>
            <p className={`text-sm uppercase tracking-widest font-medium mb-6 ${meta.color}`}>
              {meta.label}
            </p>
            <p className="text-muted-foreground text-lg mb-3 leading-relaxed">
              Thank you, {customerName || activeOrder.customerName}. Your order #{activeOrder.id.replace("ord-", "").slice(0, 8)} totals {formatCurrency(activeOrder.totalAmount)}.
            </p>
            <p className="text-muted-foreground text-sm mb-8">
              A confirmation will be sent to <span className="text-primary">{activeOrder.email}</span>. This page will keep showing your order status until you close it.
            </p>
            {isFinal && (
              <Button
                onClick={() => { sessionStorage.removeItem(ACTIVE_ORDER_KEY); setActiveOrderId(null); }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none uppercase tracking-widest px-10 h-14"
              >
                Place a New Order
              </Button>
            )}
          </motion.div>
        </SectionContainer>
      </Layout>
    );
  }

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

                    <div className="flex-grow flex flex-col justify-center">
                      <h3 className="font-serif text-lg tracking-widest uppercase text-foreground">
                        {item.menuItem.name}
                      </h3>
                      <div className="text-primary font-medium">
                        {formatCurrency(item.menuItem.price)}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
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

            {/* Right: Payment & Summary */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <form
                onSubmit={handleCheckout}
                className="bg-card border border-border p-6 md:p-8 rounded-sm flex flex-col gap-6"
              >
                {/* Customer Info */}
                <div>
                  <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
                    Your Details
                  </h2>
                  <div className="flex flex-col gap-4">
                    <Input
                      required
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background border-border rounded-none h-12"
                    />
                    <Input
                      required
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background border-border rounded-none h-12"
                    />
                    <Input
                      required
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-background border-border rounded-none h-12"
                    />
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
                    Delivery Details
                  </h2>
                  <div className="flex flex-col gap-4">
                    <Input
                      required
                      placeholder="Delivery Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-background border-border rounded-none h-12"
                    />
                    <Input
                      placeholder="Delivery Instructions (Optional)"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="bg-background border-border rounded-none h-12"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
                    Payment Method
                  </h2>

                  {availableMethods.length === 0 ? (
                    <div className="flex items-start gap-3 p-4 border border-border bg-background text-sm text-muted-foreground">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                      <span>Online payments are not available at the moment. Please contact us to arrange payment.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 mb-4">
                      {availableMethods.map((method) => {
                        const Icon = METHOD_ICONS[method.key];
                        const isSelected = paymentMethod === method.key;
                        return (
                          <button
                            key={method.key}
                            type="button"
                            onClick={() => setPaymentMethod(method.key)}
                            className={`flex items-center gap-3 p-4 border rounded-none transition-colors text-left ${
                              isSelected
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-border text-muted-foreground hover:border-primary/50"
                            }`}
                          >
                            <Icon className="w-5 h-5 shrink-0" />
                            <div>
                              <p className="text-xs uppercase tracking-widest font-medium">{method.label}</p>
                              <p className="text-xs opacity-70 mt-0.5">{method.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Per-method details */}
                  {paymentMethod === "bankTransfer" && (
                    <div className="text-sm text-muted-foreground bg-background p-4 border border-border">
                      Bank transfer instructions will be sent to your email. Your order will be
                      prepared once payment is confirmed.
                    </div>
                  )}

                  {paymentMethod === "cashOnDelivery" && (
                    <div className="text-sm text-muted-foreground bg-background p-4 border border-border">
                      Please have the exact amount ready when the order arrives.
                    </div>
                  )}

                  {(paymentMethod === "card" || paymentMethod === "mobileWallet") && activeProvider && (
                    <div className="text-sm text-muted-foreground bg-background p-4 border border-border">
                      You will be securely redirected to {activeProvider.name} to complete payment after placing your order.
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="border-t border-border pt-6">
                  <h2 className="text-sm font-medium tracking-widest uppercase text-primary mb-4">
                    Order Summary
                  </h2>
                  <div className="flex flex-col gap-3 text-sm text-muted-foreground mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service & Delivery</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({taxPct}%)</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
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
                    disabled={availableMethods.length === 0 || paymentMethod === null}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 rounded-none tracking-widest uppercase font-semibold disabled:opacity-50"
                    data-testid="button-place-order"
                  >
                    {availableMethods.length === 0 ? "No Payment Method Available" : `Place Order & Pay ${formatCurrency(total)}`}
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
