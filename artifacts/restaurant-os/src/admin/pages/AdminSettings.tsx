import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { useAuth } from "@/lib/auth";
import {
  Save, User, CreditCard, Bell, Shield, HardDrive, RefreshCw,
  Palette, Loader2, Building, Plus, Pencil, Trash2, CheckCircle2,
  XCircle, ToggleLeft, ToggleRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hexToHsl } from "@/utils/colorUtils";
import type { BankAccount } from "@/types/restaurant";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50";

type Tab = "account" | "general" | "payments" | "notifications" | "security" | "site-theme" | "admin-theme";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "account",      label: "Account",           icon: User      },
  { key: "general",      label: "General",            icon: Save      },
  { key: "payments",     label: "Payments & Checkout",icon: CreditCard},
  { key: "notifications",label: "Notifications",      icon: Bell      },
  { key: "security",     label: "Security",           icon: Shield    },
  { key: "site-theme",   label: "Site Theme",         icon: Palette   },
  { key: "admin-theme",  label: "Admin Theme",        icon: Palette   },
];

const accountSchema = z.object({
  ownerName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
});
void accountSchema;

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

// ── Account tab ──────────────────────────────────────────────────────────────

function AccountTab() {
  const { user } = useAuth();
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError,  setPwError]  = useState("");
  const [pwSuccess,setPwSuccess]= useState("");

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const handlePasswordChange = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (!user || !user.email) { setPwError("No authenticated user found. Please sign in again."); return; }
    setPwSaving(true); setPwError(""); setPwSuccess("");
    try {
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, data.newPassword);
      setPwSuccess("Password updated successfully.");
      reset();
      setTimeout(() => setPwSuccess(""), 5000);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setPwError("Current password is incorrect.");
      } else if (code === "auth/weak-password") {
        setPwError("New password must be at least 6 characters.");
      } else if (code === "auth/too-many-requests") {
        setPwError("Too many attempts. Please wait before trying again.");
      } else {
        setPwError("Failed to update password. Please try again.");
      }
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="max-w-md space-y-5">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Signed-in Account</h3>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold shrink-0">
            {user?.email?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-foreground truncate">{user?.email ?? "Not signed in"}</p>
            <p className="text-xs text-emerald-400">Verified</p>
          </div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
        <p className="text-xs text-foreground/40">Updates your Firebase login password immediately.</p>
        {pwSuccess && <p className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2">{pwSuccess}</p>}
        {pwError   && <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{pwError}</p>}
        <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-3">
          {(["currentPassword", "newPassword", "confirmPassword"] as const).map((field) => (
            <div key={field}>
              <label className="text-xs text-foreground/50 mb-1 block">
                {field === "currentPassword" ? "Current Password" : field === "newPassword" ? "New Password" : "Confirm New Password"}
              </label>
              <input
                {...register(field)}
                type="password"
                autoComplete={field === "currentPassword" ? "current-password" : "new-password"}
                className={inputCls}
              />
              {errors[field] && <p className="text-red-400 text-xs mt-1">{(errors[field] as { message?: string }).message}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={pwSaving}
            className="flex items-center gap-2 w-full justify-center py-2 bg-primary text-black text-sm font-medium rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            {pwSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── General tab ──────────────────────────────────────────────────────────────

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
            {(errors as Record<string, { message?: string }>)[key] && (
              <p className="text-red-400 text-xs mt-1">{(errors as Record<string, { message?: string }>)[key].message}</p>
            )}
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

// ── Bank account form ────────────────────────────────────────────────────────

const emptyBankForm = {
  bankName: "", accountName: "", accountNumber: "", sortCode: "", iban: "", swiftBic: "", enabled: true,
};

function BankAccountForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<typeof emptyBankForm>;
  onSave: (data: Omit<BankAccount, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...emptyBankForm, ...initial });
  const [error, setError] = useState("");

  const update = (key: keyof typeof emptyBankForm, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    if (!form.bankName.trim() || !form.accountName.trim() || !form.accountNumber.trim()) {
      setError("Bank Name, Account Name, and Account Number are required.");
      return;
    }
    setError("");
    onSave({
      bankName:      form.bankName.trim(),
      accountName:   form.accountName.trim(),
      accountNumber: form.accountNumber.trim(),
      sortCode:      form.sortCode.trim()  || undefined,
      iban:          form.iban.trim()      || undefined,
      swiftBic:      form.swiftBic.trim()  || undefined,
      enabled:       form.enabled,
    });
  };

  return (
    <div className="space-y-4 border border-primary/30 rounded-xl p-5 bg-primary/5">
      <h4 className="text-sm font-semibold text-foreground">
        {initial?.bankName ? "Edit Bank Account" : "New Bank Account"}
      </h4>
      <div className="grid sm:grid-cols-2 gap-3">
        {([
          { key: "bankName",      label: "Bank Name",            required: true,  placeholder: "e.g. Chase, Barclays"     },
          { key: "accountName",   label: "Account Holder Name",  required: true,  placeholder: "Legal business name"      },
          { key: "accountNumber", label: "Account Number",       required: true,  placeholder: "e.g. 12345678"           },
          { key: "sortCode",      label: "Sort Code / Routing",  required: false, placeholder: "e.g. 20-00-00"           },
          { key: "iban",          label: "IBAN",                 required: false, placeholder: "e.g. GB29 NWBK …"        },
          { key: "swiftBic",      label: "SWIFT / BIC",          required: false, placeholder: "e.g. NWBKGB2L"           },
        ] as const).map(({ key, label, required, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-foreground/50 mb-1 block">
              {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
              value={form[key] as string}
              onChange={(e) => update(key, e.target.value)}
              placeholder={placeholder}
              className={inputCls}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Toggle checked={form.enabled} onChange={() => update("enabled", !form.enabled)} />
        <span className="text-xs text-foreground/60">Enable this account at checkout</span>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <Save className="w-3.5 h-3.5" /> Save Account
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-white/5 text-foreground/60 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Payments tab ─────────────────────────────────────────────────────────────

function PaymentsTab() {
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount, deliverySettings, updateDeliverySettings } = useRestaurantStore();

  const [showAddForm, setShowAddForm]   = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  const [fee,      setFee]      = useState(String(deliverySettings.fee));
  const [minOrder, setMinOrder] = useState(String(deliverySettings.minOrder));
  const [taxRate,  setTaxRate]  = useState(String((deliverySettings.taxRate * 100).toFixed(1)));
  const [checkoutSaved, setCheckoutSaved] = useState(false);

  const saveCheckout = () => {
    updateDeliverySettings({ fee: parseFloat(fee) || 0, minOrder: parseFloat(minOrder) || 0, taxRate: (parseFloat(taxRate) || 0) / 100 });
    setCheckoutSaved(true); setTimeout(() => setCheckoutSaved(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Bank accounts */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-primary" />
              Bank Transfer Accounts
            </h3>
            <p className="text-xs text-foreground/40 mt-0.5">
              Customers pay directly into your bank. Add multiple accounts and enable/disable individually.
            </p>
          </div>
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-black rounded-lg text-xs font-medium hover:bg-primary/80 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add Account
          </button>
        </div>

        {showAddForm && !editingId && (
          <BankAccountForm
            onSave={(data) => { addBankAccount(data); setShowAddForm(false); }}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {bankAccounts.length === 0 && !showAddForm && (
          <div className="text-xs text-foreground/40 py-4 text-center border border-dashed border-white/10 rounded-lg">
            No bank accounts added yet. Click "Add Account" to set one up.
          </div>
        )}

        <div className="space-y-3">
          {bankAccounts.map((ba) => (
            <div key={ba.id}>
              {editingId === ba.id ? (
                <BankAccountForm
                  initial={{ bankName: ba.bankName, accountName: ba.accountName, accountNumber: ba.accountNumber, sortCode: ba.sortCode ?? "", iban: ba.iban ?? "", swiftBic: ba.swiftBic ?? "", enabled: ba.enabled }}
                  onSave={(data) => { updateBankAccount(ba.id, data); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className={cn(
                  "border rounded-xl p-4 space-y-2 transition-colors",
                  ba.enabled ? "border-white/10 bg-white/3" : "border-white/5 bg-white/[0.02] opacity-60"
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">{ba.bankName}</span>
                      {ba.enabled ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 shrink-0">Active</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-foreground/40 border border-white/10 shrink-0">Disabled</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateBankAccount(ba.id, { enabled: !ba.enabled })}
                        className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"
                        title={ba.enabled ? "Disable" : "Enable"}
                      >
                        {ba.enabled ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => { setEditingId(ba.id); setShowAddForm(false); }}
                        className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(ba.id)}
                        className="p-1.5 rounded hover:bg-red-400/10 text-foreground/40 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {deletingId === ba.id && (
                    <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                      <p className="text-xs text-red-400 flex-1">Delete this account?</p>
                      <button
                        onClick={() => { deleteBankAccount(ba.id); setDeletingId(null); }}
                        className="px-3 py-1 bg-red-500/15 text-red-400 border border-red-400/20 rounded-lg text-xs hover:bg-red-500/25 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-3 py-1 bg-white/5 text-foreground/60 border border-white/10 rounded-lg text-xs hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-foreground/60 pt-1">
                    <div className="flex justify-between sm:block">
                      <span className="text-foreground/40">Account Name</span>
                      <span className="sm:ml-2 text-foreground/80 font-medium">{ba.accountName}</span>
                    </div>
                    <div className="flex justify-between sm:block">
                      <span className="text-foreground/40">Account Number</span>
                      <span className="sm:ml-2 text-foreground/80 font-mono">{ba.accountNumber}</span>
                    </div>
                    {ba.sortCode && (
                      <div className="flex justify-between sm:block">
                        <span className="text-foreground/40">Sort Code</span>
                        <span className="sm:ml-2 text-foreground/80">{ba.sortCode}</span>
                      </div>
                    )}
                    {ba.iban && (
                      <div className="flex justify-between sm:block col-span-full">
                        <span className="text-foreground/40">IBAN</span>
                        <span className="sm:ml-2 text-foreground/80 font-mono break-all">{ba.iban}</span>
                      </div>
                    )}
                    {ba.swiftBic && (
                      <div className="flex justify-between sm:block">
                        <span className="text-foreground/40">SWIFT / BIC</span>
                        <span className="sm:ml-2 text-foreground/80">{ba.swiftBic}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Checkout settings */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Checkout Settings</h3>
        <p className="text-xs text-foreground/40">Applied to every customer order at checkout.</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-foreground/50 mb-1 block">Delivery Fee ($)</label>
            <input type="number" step="0.01" min="0" value={fee} onChange={(e) => setFee(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-foreground/50 mb-1 block">Minimum Order ($)</label>
            <input type="number" step="0.01" min="0" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="text-xs text-foreground/50 mb-1 block">Tax Rate (%)</label>
            <input type="number" step="0.1" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className={inputCls} />
          </div>
        </div>
        <button
          onClick={saveCheckout}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          {checkoutSaved ? "Saved!" : "Save Checkout Settings"}
        </button>
      </div>
    </div>
  );
}

// ── Notifications tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const prefs = [
    { label: "New Reservation",      sub: "Notify when a new booking is made",        defaultVal: true  },
    { label: "New Order",            sub: "Notify when a new order is placed",         defaultVal: true  },
    { label: "Receipt Uploaded",     sub: "Notify when a customer submits a receipt",  defaultVal: true  },
    { label: "Order Status Update",  sub: "Notify when order status changes",          defaultVal: false },
    { label: "Customer Message",     sub: "Notify for new contact form submissions",   defaultVal: true  },
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

// ── Security tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const store = useRestaurantStore();
  const [restoreStatus, setRestoreStatus] = useState("");
  const restoreRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: "3.0",
      config: store.config,
      menuItems: store.menuItems,
      services: store.services,
      testimonials: store.testimonials,
      reservations: store.reservations,
      galleryImages: store.galleryImages,
      orders: store.orders,
      bankAccounts: store.bankAccounts,
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
    a.href = url;
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
        if (data.config)              store.updateConfig(data.config);
        if (data.siteTheme)           store.updateSiteTheme(data.siteTheme);
        if (data.adminTheme)          store.updateAdminTheme(data.adminTheme);
        if (data.quickControls)       store.updateQuickControls(data.quickControls);
        if (data.navLinks)            store.updateNavLinks(data.navLinks);
        if (data.deliverySettings)    store.updateDeliverySettings(data.deliverySettings);
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
        <button onClick={() => { window.location.href = "/"; }} className="text-xs text-red-400 hover:underline">
          Sign out of all other devices
        </button>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Backup & Restore</h3>
        <p className="text-xs text-foreground/50">Export all restaurant data as a JSON file, or restore from a previous backup.</p>
        {restoreStatus && (
          <p className={`text-xs font-medium ${restoreStatus.startsWith("✓") ? "text-emerald-400" : "text-red-400"}`}>{restoreStatus}</p>
        )}
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportBackup} className="flex items-center gap-2 px-4 py-2 bg-white/5 text-foreground/70 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
            <HardDrive className="w-3.5 h-3.5" /> Export Backup
          </button>
          <button onClick={() => restoreRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-white/5 text-foreground/70 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Restore from File
          </button>
          <input ref={restoreRef} type="file" accept=".json" className="hidden" onChange={(e) => handleRestore(e.target.files?.[0] ?? null)} />
        </div>
      </div>
    </div>
  );
}

// ── Site theme tab ───────────────────────────────────────────────────────────

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
            { label: "Primary Color",   key: "primaryHex"   as const, sub: "Buttons, links, accents" },
            { label: "Secondary Color", key: "secondaryHex" as const, sub: "Backgrounds, cards"      },
            { label: "Accent Color",    key: "accentHex"    as const, sub: "Hover states, borders"   },
          ].map(({ label, key, sub }) => (
            <div key={key}>
              <label className="text-xs text-foreground/50 mb-1 block">{label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={siteTheme[key]} onChange={(e) => updateSiteTheme({ [key]: e.target.value })} className="w-10 h-8 rounded border border-white/10 cursor-pointer bg-transparent" />
                <input type="text"  value={siteTheme[key]} onChange={(e) => updateSiteTheme({ [key]: e.target.value })} className={inputCls + " font-mono text-xs"} />
              </div>
              <p className="text-xs text-foreground/30 mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Button Style</h3>
        <div className="flex gap-3 flex-wrap">
          {(["rounded", "sharp", "pill"] as const).map((style) => (
            <button
              key={style}
              onClick={() => updateSiteTheme({ buttonStyle: style })}
              className={cn(
                "px-5 py-2 text-sm capitalize border transition-colors",
                style === "rounded" ? "rounded-lg" : style === "pill" ? "rounded-full" : "rounded-none",
                siteTheme.buttonStyle === style ? "bg-primary/15 text-primary border-primary/30" : "bg-white/5 text-foreground/60 border-white/10 hover:bg-white/10"
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
          {[
            { label: "Heading Font", key: "fontHeading" as const, opts: ["Cormorant Garamond", "Playfair Display", "Libre Baskerville", "Merriweather"] },
            { label: "Body Font",    key: "fontBody"    as const, opts: ["Inter", "Lato", "Open Sans", "Source Sans 3"] },
          ].map(({ label, key, opts }) => (
            <div key={key}>
              <label className="text-xs text-foreground/50 mb-1 block">{label}</label>
              <select value={siteTheme[key]} onChange={(e) => updateSiteTheme({ [key]: e.target.value })} className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none">
                {opts.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
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
        <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Site Theme"}
      </button>
    </div>
  );
}

// ── Admin theme tab ──────────────────────────────────────────────────────────

function AdminThemeTab() {
  const { adminTheme, updateAdminTheme } = useRestaurantStore();
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Admin Panel Colors</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: "Primary / Accent",  key: "primaryHex"   as const },
            { label: "Button Color",      key: "buttonHex"    as const },
            { label: "Sidebar Background",key: "sidebarBgHex" as const },
            { label: "Main Background",   key: "mainBgHex"    as const },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="text-xs text-foreground/50 mb-1 block">{label}</label>
              <div className="flex items-center gap-2">
                <input type="color" value={adminTheme[key]} onChange={(e) => updateAdminTheme({ [key]: e.target.value })} className="w-10 h-8 rounded border border-white/10 cursor-pointer bg-transparent" />
                <input type="text"  value={adminTheme[key]} onChange={(e) => updateAdminTheme({ [key]: e.target.value })} className={inputCls + " font-mono text-xs"} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }} className="flex items-center gap-2 px-5 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
        <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Admin Theme"}
      </button>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<Tab>("payments");

  return (
    <AdminLayout title="Settings" subtitle="Manage your account, payments, and preferences">
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
        {/* Sidebar tabs */}
        <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible lg:w-52 shrink-0 pb-1 lg:pb-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 lg:shrink lg:w-full text-left",
                activeTab === key
                  ? "bg-primary/15 text-primary"
                  : "text-foreground/50 hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {activeTab === "account"       && <AccountTab />}
          {activeTab === "general"       && <GeneralTab />}
          {activeTab === "payments"      && <PaymentsTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "security"      && <SecurityTab />}
          {activeTab === "site-theme"    && <SiteThemeTab />}
          {activeTab === "admin-theme"   && <AdminThemeTab />}
        </div>
      </div>
    </AdminLayout>
  );
}
