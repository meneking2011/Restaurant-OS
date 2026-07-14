import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRestaurantStore } from "@/store/restaurantStore";
import { PAYMENT_PROVIDERS, PAYMENT_METHODS } from "@/types/restaurant";
import type { PaymentProviderId } from "@/types/restaurant";
import { AdminLayout } from "../layout/AdminLayout";
import { Save, User, CreditCard, Bell, Shield, HardDrive, RefreshCw, Palette, CheckCircle2, Link, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";
import { hexToHsl } from "@/utils/colorUtils";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50";

type Tab = "account" | "general" | "payments" | "notifications" | "security" | "site-theme" | "admin-theme";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "account", label: "Account", icon: User },
  { key: "general", label: "General", icon: Save },
  { key: "payments", label: "Payments & Checkout", icon: CreditCard },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
  { key: "site-theme", label: "Site Theme", icon: Palette },
  { key: "admin-theme", label: "Admin Theme", icon: Palette },
];

const accountSchema = z.object({
  ownerName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "At least 8 characters"),
  confirmPassword: z.string().min(1, "Required"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0", checked ? "bg-primary" : "bg-white/20")}
    >
      <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow", checked ? "translate-x-4.5" : "translate-x-0.5")} />
    </button>
  );
}

function AccountTab() {
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const { register: r1, handleSubmit: h1, formState: { errors: e1 } } = useForm({ resolver: zodResolver(accountSchema), defaultValues: { ownerName: "Alex M.", email: "alex@restaurant.com" } });
  const { register: r2, handleSubmit: h2, formState: { errors: e2 } } = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">1. Owner Profile</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold shrink-0">A</div>
          <button className="text-xs text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">Change Picture</button>
        </div>
        <form onSubmit={h1((d) => { setSaved(true); setTimeout(() => setSaved(false), 2500); })} className="space-y-3">
          <div>
            <label className="text-xs text-foreground/50 mb-1 block">Name</label>
            <input {...r1("ownerName")} className={inputCls} />
            {e1.ownerName && <p className="text-red-400 text-xs mt-1">{e1.ownerName.message}</p>}
          </div>
          <div>
            <label className="text-xs text-foreground/50 mb-1 block">Email Address</label>
            <div className="relative">
              <input {...r1("email")} type="email" className={inputCls + " pr-20"} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-medium">Verified</span>
            </div>
            {e1.email && <p className="text-red-400 text-xs mt-1">{e1.email.message}</p>}
          </div>
          <button type="submit" className="px-4 py-2 bg-primary text-black text-sm font-medium rounded-lg hover:bg-primary/80 transition-colors">
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">2. Password Settings</h3>
        <p className="text-xs text-foreground/40">Ensure a strong password to protect your account.</p>
        <form onSubmit={h2(() => { setPwSaved(true); setTimeout(() => setPwSaved(false), 2500); })} className="space-y-3">
          {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
            <div key={field}>
              <label className="text-xs text-foreground/50 mb-1 block capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
              <input {...r2(field)} type="password" className={inputCls} />
              {e2[field] && <p className="text-red-400 text-xs mt-1">{(e2[field] as { message?: string }).message}</p>}
            </div>
          ))}
          <button type="submit" className="w-full py-2 bg-white/5 border border-white/10 text-foreground/70 text-sm rounded-lg hover:bg-white/10 transition-colors">
            {pwSaved ? "Updated!" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function GeneralTab() {
  const { config, updateConfig } = useRestaurantStore();
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(z.object({
      name: z.string().min(1),
      tagline: z.string().min(1),
      description: z.string().min(1),
      phone: z.string().min(1),
      email: z.string().email(),
      heroImage: z.string().url(),
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zip: z.string().min(1),
      country: z.string().min(1),
    })),
    defaultValues: {
      name: config.name, tagline: config.tagline, description: config.description,
      phone: config.phone, email: config.email, heroImage: config.heroImage,
      street: config.address.street, city: config.address.city,
      state: config.address.state, zip: config.address.zip, country: config.address.country,
    },
  });

  const onSubmit = (d: Record<string, string>) => {
    updateConfig({ name: d.name, tagline: d.tagline, description: d.description, phone: d.phone, email: d.email, heroImage: d.heroImage, address: { street: d.street, city: d.city, state: d.state, zip: d.zip, country: d.country } });
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-5 max-w-2xl">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Restaurant Identity</h3>
        {[{ key: "name", label: "Restaurant Name" }, { key: "tagline", label: "Tagline" }].map(({ key, label }) => (
          <div key={key}>
            <label className="text-xs text-foreground/50 mb-1 block">{label}</label>
            <input {...register(key as "name")} className={inputCls} />
          </div>
        ))}
        <div>
          <label className="text-xs text-foreground/50 mb-1 block">Description</label>
          <textarea {...register("description")} rows={3} className={inputCls + " resize-none"} />
        </div>
        <div>
          <label className="text-xs text-foreground/50 mb-1 block">Hero Image URL</label>
          <input {...register("heroImage")} className={inputCls} />
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Contact & Address</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="text-xs text-foreground/50 mb-1 block">Phone</label><input {...register("phone")} className={inputCls} /></div>
          <div><label className="text-xs text-foreground/50 mb-1 block">Email</label><input {...register("email")} className={inputCls} /></div>
        </div>
        <div><label className="text-xs text-foreground/50 mb-1 block">Street</label><input {...register("street")} className={inputCls} /></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["city", "state", "zip", "country"] as const).map((f) => (
            <div key={f}><label className="text-xs text-foreground/50 mb-1 block capitalize">{f}</label><input {...register(f)} className={inputCls} /></div>
          ))}
        </div>
      </div>
      <button type="submit" className="flex items-center gap-2 px-5 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
        <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Changes"}
      </button>
    </form>
  );
}

function PaymentsTab() {
  const {
    deliverySettings, updateDeliverySettings,
    paymentSettings, updatePaymentMethods, connectPaymentProvider, disconnectPaymentProvider, setActivePaymentProvider,
  } = useRestaurantStore();
  const [fee,      setFee]      = useState(String(deliverySettings.fee));
  const [minOrder, setMinOrder] = useState(String(deliverySettings.minOrder));
  const [taxRate,  setTaxRate]  = useState(String((deliverySettings.taxRate * 100).toFixed(1)));
  const [saved, setSaved] = useState(false);
  const [connecting, setConnecting] = useState<PaymentProviderId | null>(null);

  const handleSave = () => {
    updateDeliverySettings({
      fee:      parseFloat(fee)     || 0,
      minOrder: parseFloat(minOrder) || 0,
      taxRate:  (parseFloat(taxRate) || 0) / 100,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleConnect = async (providerId: PaymentProviderId) => {
    setConnecting(providerId);
    await new Promise((r) => setTimeout(r, 800));
    connectPaymentProvider(providerId, {
      connected: true,
      accountLabel: `${PAYMENT_PROVIDERS.find((p) => p.id === providerId)?.name} Account`,
      connectedAt: new Date().toISOString(),
    });
    setActivePaymentProvider(providerId);
    setConnecting(null);
  };

  const handleDisconnect = (providerId: PaymentProviderId) => {
    disconnectPaymentProvider(providerId);
    if (paymentSettings.activeProvider === providerId) {
      setActivePaymentProvider(null);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Provider Cards */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Payment Providers</h3>
          <p className="text-xs text-foreground/40 mt-0.5">Connect a payment provider to accept online payments. Only one active provider at a time.</p>
        </div>
        {PAYMENT_PROVIDERS.map((provider) => {
          const connection = paymentSettings.connections[provider.id];
          const isConnected = connection?.connected ?? false;
          const isActive = paymentSettings.activeProvider === provider.id;
          const isConnecting = connecting === provider.id;
          return (
            <div
              key={provider.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-colors",
                isActive
                  ? "border-primary/40 bg-primary/5"
                  : "border-white/10 bg-white/3 hover:bg-white/5"
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-foreground">{provider.name}</span>
                  {isConnected ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {isActive ? "Active" : "Connected"}
                    </span>
                  ) : provider.live ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Connect Account
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/5 text-foreground/40 border border-white/10">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/40 truncate">{provider.description}</p>
                {isConnected && connection?.accountLabel && (
                  <p className="text-xs text-primary/80 mt-0.5">{connection.accountLabel}</p>
                )}
              </div>
              <div className="ml-4 shrink-0">
                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(provider.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-400/20 rounded-lg hover:bg-red-400/10 transition-colors"
                  >
                    <Unlink className="w-3 h-3" /> Disconnect
                  </button>
                ) : provider.live ? (
                  <button
                    onClick={() => handleConnect(provider.id)}
                    disabled={isConnecting}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-50"
                  >
                    <Link className="w-3 h-3" />
                    {isConnecting ? "Connecting…" : "Connect"}
                  </button>
                ) : (
                  <span className="text-xs text-foreground/25 px-3 py-1.5">Unavailable</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Methods */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Payment Methods</h3>
          <p className="text-xs text-foreground/40 mt-0.5">Choose which methods customers can select at checkout.</p>
        </div>
        {PAYMENT_METHODS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div>
              <p className="text-sm text-foreground">{label}</p>
              <p className="text-xs text-foreground/40">{description}</p>
            </div>
            <Toggle
              checked={paymentSettings.methodsEnabled[key]}
              onChange={() => updatePaymentMethods({ [key]: !paymentSettings.methodsEnabled[key] })}
            />
          </div>
        ))}
      </div>

      {/* Checkout Settings */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Checkout Settings</h3>
        <p className="text-xs text-foreground/40">These values flow directly to the customer checkout page.</p>
        <div><label className="text-xs text-foreground/50 mb-1 block">Delivery Fee ($)</label><input type="number" step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} className={inputCls} /></div>
        <div><label className="text-xs text-foreground/50 mb-1 block">Minimum Order Amount ($)</label><input type="number" step="0.01" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className={inputCls} /></div>
        <div><label className="text-xs text-foreground/50 mb-1 block">Tax Rate (%)</label><input type="number" step="0.1" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className={inputCls} /></div>
      </div>

      <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
        <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Checkout Settings"}
      </button>
    </div>
  );
}

function NotificationsTab() {
  const prefs = [
    { label: "New Reservation", sub: "Notify when a new booking is made", defaultVal: true },
    { label: "New Order", sub: "Notify when a new order is placed", defaultVal: true },
    { label: "Order Status Update", sub: "Notify when order status changes", defaultVal: false },
    { label: "Low Stock Alert", sub: "Notify when menu items run low", defaultVal: false },
    { label: "Customer Message", sub: "Notify for new contact form submissions", defaultVal: true },
  ];
  const [state, setState] = useState(prefs.map((p) => p.defaultVal));

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
        {prefs.map(({ label, sub }, i) => (
          <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
            <div><p className="text-sm text-foreground">{label}</p><p className="text-xs text-foreground/40">{sub}</p></div>
            <Toggle checked={state[i]} onChange={() => setState(state.map((v, j) => j === i ? !v : v))} />
          </div>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Email Notifications</h3>
        <div><label className="text-xs text-foreground/50 mb-1 block">Notification Email</label><input type="email" defaultValue="admin@restaurant.com" className={inputCls} /></div>
      </div>
      <button className="flex items-center gap-2 px-5 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
        <Save className="w-3.5 h-3.5" /> Save Preferences
      </button>
    </div>
  );
}

function SecurityTab() {
  const store = useRestaurantStore();
  const [restoreStatus, setRestoreStatus] = useState("");
  const restoreRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: "2.0",
      config: store.config,
      menuItems: store.menuItems,
      services: store.services,
      testimonials: store.testimonials,
      reservations: store.reservations,
      galleryImages: store.galleryImages,
      orders: store.orders,
      siteTheme: store.siteTheme,
      adminTheme: store.adminTheme,
      quickControls: store.quickControls,
      navLinks: store.navLinks,
      deliverySettings: store.deliverySettings,
      reservationSettings: store.reservationSettings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `restaurant-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = (file: File | null) => {
    if (!file) return;
    setRestoreStatus("Reading file…");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.config)             store.updateConfig(data.config);
        if (data.siteTheme)          store.updateSiteTheme(data.siteTheme);
        if (data.adminTheme)         store.updateAdminTheme(data.adminTheme);
        if (data.quickControls)      store.updateQuickControls(data.quickControls);
        if (data.navLinks)           store.updateNavLinks(data.navLinks);
        if (data.deliverySettings)   store.updateDeliverySettings(data.deliverySettings);
        if (data.reservationSettings) store.updateReservationSettings(data.reservationSettings);
        setRestoreStatus("✓ Backup restored successfully!");
        setTimeout(() => setRestoreStatus(""), 4000);
      } catch {
        setRestoreStatus("✗ Invalid backup file");
        setTimeout(() => setRestoreStatus(""), 3000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
        <p className="text-xs text-foreground/50">You are currently signed in on 1 device.</p>
        <button
          onClick={() => { window.location.href = "/"; }}
          className="text-xs text-red-400 hover:underline"
        >
          Sign out of all other devices
        </button>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Backup & Restore</h3>
        <p className="text-xs text-foreground/50">
          Export all restaurant data as a JSON file, or restore from a previous backup.
        </p>
        {restoreStatus && (
          <p className={`text-xs font-medium ${restoreStatus.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>
            {restoreStatus}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-foreground/70 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <HardDrive className="w-3.5 h-3.5" /> Export Backup
          </button>
          <button
            onClick={() => restoreRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 text-foreground/70 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restore from File
          </button>
          <input
            ref={restoreRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => handleRestore(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>
    </div>
  );
}

function SiteThemeTab() {
  const { siteTheme, updateSiteTheme } = useRestaurantStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    if (siteTheme.primaryHex) {
      document.documentElement.style.setProperty("--primary", hexToHsl(siteTheme.primaryHex));
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Customer Website Colors</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Primary Color", key: "primaryHex" as const, sub: "Buttons, links, accents" },
            { label: "Secondary Color", key: "secondaryHex" as const, sub: "Backgrounds, cards" },
            { label: "Accent Color", key: "accentHex" as const, sub: "Hover states, borders" },
          ].map(({ label, key, sub }) => (
            <div key={key}>
              <label className="text-xs text-foreground/50 mb-1 block">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={siteTheme[key]}
                  onChange={(e) => updateSiteTheme({ [key]: e.target.value })}
                  className="w-10 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={siteTheme[key]}
                  onChange={(e) => updateSiteTheme({ [key]: e.target.value })}
                  className={inputCls + " font-mono text-xs"}
                />
              </div>
              <p className="text-xs text-foreground/30 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Button Style</h3>
        <div className="flex gap-3">
          {(["rounded", "sharp", "pill"] as const).map((style) => (
            <button
              key={style}
              onClick={() => updateSiteTheme({ buttonStyle: style })}
              className={cn(
                "px-5 py-2 text-sm capitalize border transition-colors",
                style === "rounded" ? "rounded-lg" : style === "pill" ? "rounded-full" : "rounded-none",
                siteTheme.buttonStyle === style
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-white/5 text-foreground/60 border-white/10 hover:bg-white/10"
              )}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Typography</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-foreground/50 mb-1 block">Heading Font</label>
            <select
              value={siteTheme.fontHeading}
              onChange={(e) => updateSiteTheme({ fontHeading: e.target.value })}
              className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option>Cormorant Garamond</option>
              <option>Playfair Display</option>
              <option>Libre Baskerville</option>
              <option>Merriweather</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-foreground/50 mb-1 block">Body Font</label>
            <select
              value={siteTheme.fontBody}
              onChange={(e) => updateSiteTheme({ fontBody: e.target.value })}
              className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option>Inter</option>
              <option>Lato</option>
              <option>Open Sans</option>
              <option>Source Sans 3</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs text-foreground/50 mb-2 block">Border Radius ({siteTheme.borderRadius}px)</label>
            <input type="range" min={0} max={24} value={siteTheme.borderRadius} onChange={(e) => updateSiteTheme({ borderRadius: Number(e.target.value) })} className="w-full accent-primary" />
          </div>
          <div>
            <label className="text-xs text-foreground/50 mb-2 block">Shadow Intensity ({siteTheme.shadowIntensity}%)</label>
            <input type="range" min={0} max={100} value={siteTheme.shadowIntensity} onChange={(e) => updateSiteTheme({ shadowIntensity: Number(e.target.value) })} className="w-full accent-primary" />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
        <Save className="w-3.5 h-3.5" /> {saved ? "Applied!" : "Apply Theme"}
      </button>
    </div>
  );
}

function AdminThemeTab() {
  const { adminTheme, updateAdminTheme } = useRestaurantStore();
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Admin Dashboard Colors</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Primary / Accent Color", key: "primaryHex" as const, sub: "Buttons, active states, highlights" },
            { label: "Sidebar Background", key: "sidebarBgHex" as const, sub: "Left navigation panel" },
            { label: "Main Background", key: "mainBgHex" as const, sub: "Content area background" },
            { label: "Button Color", key: "buttonHex" as const, sub: "Primary action buttons" },
          ].map(({ label, key, sub }) => (
            <div key={key}>
              <label className="text-xs text-foreground/50 mb-1 block">{label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={adminTheme[key]}
                  onChange={(e) => updateAdminTheme({ [key]: e.target.value })}
                  className="w-10 h-8 rounded border border-white/10 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={adminTheme[key]}
                  onChange={(e) => updateAdminTheme({ [key]: e.target.value })}
                  className={inputCls + " font-mono text-xs"}
                />
              </div>
              <p className="text-xs text-foreground/30 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Preview</h3>
        <div className="flex gap-2 p-4 rounded-lg" style={{ backgroundColor: adminTheme.mainBgHex }}>
          <div className="w-20 rounded-lg p-2 text-xs text-white/60" style={{ backgroundColor: adminTheme.sidebarBgHex }}>
            <div className="mb-2 text-[10px] font-bold" style={{ color: adminTheme.primaryHex }}>ADMIN</div>
            {["Dashboard", "Menu", "Orders"].map((item) => (
              <div key={item} className="py-1 text-[10px]">{item}</div>
            ))}
          </div>
          <div className="flex-1 space-y-2">
            <button className="px-3 py-1 rounded text-[10px] text-black font-bold" style={{ backgroundColor: adminTheme.buttonHex }}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
        className="flex items-center gap-2 px-5 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
      >
        <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Admin Theme"}
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("account");

  const tabContent: Record<Tab, React.ReactNode> = {
    account: <AccountTab />,
    general: <GeneralTab />,
    payments: <PaymentsTab />,
    notifications: <NotificationsTab />,
    security: <SecurityTab />,
    "site-theme": <SiteThemeTab />,
    "admin-theme": <AdminThemeTab />,
  };

  return (
    <AdminLayout
      title="System Settings"
      subtitle="Manage your account, restaurant configuration, and appearance"
    >
      <div className="flex gap-6">
        <nav className="shrink-0 w-44 space-y-0.5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-left transition-colors",
                activeTab === key
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-foreground/55 hover:text-foreground hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
        <div className="flex-1 min-w-0">{tabContent[activeTab]}</div>
      </div>
    </AdminLayout>
  );
}
