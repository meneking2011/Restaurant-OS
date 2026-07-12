import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { Save, Truck, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["Branding", "Contact", "Business Hours", "Social Media", "Delivery", "Reservations"] as const;
type Tab = typeof TABS[number];

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-foreground/60 mb-1 block">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0",
        checked ? "bg-primary" : "bg-white/20"
      )}
    >
      <span
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow",
          checked ? "translate-x-4.5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

// ── Branding Tab ──────────────────────────────────────────────────────────────
const brandingSchema = z.object({
  name:        z.string().min(1, "Required"),
  tagline:     z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  heroImage:   z.string().url("Must be a valid URL"),
});

function BrandingTab() {
  const { config, updateConfig } = useRestaurantStore();
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      name:        config.name,
      tagline:     config.tagline,
      description: config.description,
      heroImage:   config.heroImage,
    },
  });
  const onSubmit = (data: any) => {
    updateConfig(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <Field label="Restaurant Name" error={errors.name?.message as string}>
        <input {...register("name")} className={inputCls} />
      </Field>
      <Field label="Tagline / Slogan" error={errors.tagline?.message as string}>
        <input {...register("tagline")} className={inputCls} />
      </Field>
      <Field label="Short Description" error={errors.description?.message as string}>
        <textarea {...register("description")} rows={3} className={inputCls + " resize-none"} />
      </Field>
      <Field label="Hero Image URL" error={errors.heroImage?.message as string}>
        <input {...register("heroImage")} className={inputCls} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
        <div>
          <label className="text-xs text-foreground/50 mb-2 block">Logo</label>
          <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
            {config.logo && config.logo !== "flame" ? (
              <img src={config.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <span className="text-xs text-foreground/30">Upload</span>
            )}
          </div>
        </div>
        <div>
          <label className="text-xs text-foreground/50 mb-2 block">Favicon</label>
          <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
            <span className="text-xs text-foreground/30">Upload</span>
          </div>
        </div>
      </div>
      <button
        type="submit"
        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        {saved ? "Saved!" : "Save Changes"}
      </button>
    </form>
  );
}

// ── Contact Tab ───────────────────────────────────────────────────────────────
const contactSchema = z.object({
  phone:   z.string().min(1, "Required"),
  email:   z.string().email("Valid email required"),
  street:  z.string().min(1, "Required"),
  city:    z.string().min(1, "Required"),
  state:   z.string().min(1, "Required"),
  zip:     z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
});

function ContactTab() {
  const { config, updateConfig } = useRestaurantStore();
  const [saved, setSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone:   config.phone,
      email:   config.email,
      street:  config.address.street,
      city:    config.address.city,
      state:   config.address.state,
      zip:     config.address.zip,
      country: config.address.country,
    },
  });
  const onSubmit = (data: any) => {
    updateConfig({
      phone: data.phone,
      email: data.email,
      address: {
        street:  data.street,
        city:    data.city,
        state:   data.state,
        zip:     data.zip,
        country: data.country,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Phone" error={errors.phone?.message as string}>
          <input {...register("phone")} className={inputCls} />
        </Field>
        <Field label="Email" error={errors.email?.message as string}>
          <input {...register("email")} type="email" className={inputCls} />
        </Field>
      </div>
      <Field label="Street Address" error={errors.street?.message as string}>
        <input {...register("street")} className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="City" error={errors.city?.message as string}>
          <input {...register("city")} className={inputCls} />
        </Field>
        <Field label="State/Province" error={errors.state?.message as string}>
          <input {...register("state")} className={inputCls} />
        </Field>
        <Field label="ZIP / Postal" error={errors.zip?.message as string}>
          <input {...register("zip")} className={inputCls} />
        </Field>
        <Field label="Country" error={errors.country?.message as string}>
          <input {...register("country")} className={inputCls} />
        </Field>
      </div>
      <button
        type="submit"
        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        {saved ? "Saved!" : "Save Changes"}
      </button>
    </form>
  );
}

// ── Business Hours Tab ────────────────────────────────────────────────────────
const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function BusinessHoursTab() {
  const { config, updateConfig } = useRestaurantStore();
  const [hours, setHours] = useState<{ day: string; hours: string }[]>(
    DAYS_OF_WEEK.map(
      (day) => config.openingHours.find((h) => h.day === day) ?? { day, hours: "Closed" }
    )
  );
  const [saved, setSaved] = useState(false);

  const handleChange = (day: string, value: string) => {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, hours: value } : h)));
  };

  const handleSave = () => {
    updateConfig({ openingHours: hours });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-3">
      {hours.map(({ day, hours: val }) => (
        <div key={day} className="flex items-center gap-4">
          <span className="text-sm text-foreground/60 w-28 shrink-0">{day}</span>
          <input
            value={val}
            onChange={(e) => handleChange(day, e.target.value)}
            className={inputCls + " flex-1"}
            placeholder="e.g. 5:00 PM - 10:00 PM or Closed"
          />
        </div>
      ))}
      <button
        onClick={handleSave}
        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors mt-4"
      >
        <Save className="w-3.5 h-3.5" />
        {saved ? "Saved!" : "Save Hours"}
      </button>
    </div>
  );
}

// ── Social Media Tab ──────────────────────────────────────────────────────────
function SocialMediaTab() {
  const { config, updateConfig } = useRestaurantStore();
  const getSocial = (p: string) => config.socials.find((s) => s.platform === p)?.url ?? "";
  const [instagram, setInstagram] = useState(getSocial("Instagram"));
  const [facebook,  setFacebook]  = useState(getSocial("Facebook"));
  const [tiktok,    setTiktok]    = useState(getSocial("TikTok"));
  const [twitter,   setTwitter]   = useState(getSocial("Twitter"));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateConfig({
      socials: [
        { platform: "Instagram", url: instagram },
        { platform: "Facebook",  url: facebook },
        { platform: "TikTok",    url: tiktok },
        { platform: "Twitter",   url: twitter },
      ].filter((s) => s.url),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Field label="Instagram URL">
        <input value={instagram} onChange={(e) => setInstagram(e.target.value)} className={inputCls} placeholder="https://instagram.com/yourpage" />
      </Field>
      <Field label="Facebook URL">
        <input value={facebook} onChange={(e) => setFacebook(e.target.value)} className={inputCls} placeholder="https://facebook.com/yourpage" />
      </Field>
      <Field label="TikTok URL">
        <input value={tiktok} onChange={(e) => setTiktok(e.target.value)} className={inputCls} placeholder="https://tiktok.com/@yourhandle" />
      </Field>
      <Field label="Twitter / X URL">
        <input value={twitter} onChange={(e) => setTwitter(e.target.value)} className={inputCls} placeholder="https://x.com/yourhandle" />
      </Field>
      <button
        onClick={handleSave}
        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        {saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}

// ── Delivery Tab ──────────────────────────────────────────────────────────────
function DeliveryTab() {
  const { quickControls, updateQuickControls } = useRestaurantStore();
  const [deliveryFee,    setDeliveryFee]    = useState("15.00");
  const [minOrder,       setMinOrder]       = useState("25.00");
  const [taxRate,        setTaxRate]        = useState("8");
  const [deliveryRadius, setDeliveryRadius] = useState("10");
  const [estimatedTime,  setEstimatedTime]  = useState("30-45");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Online Orders Toggle */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-400/10 flex items-center justify-center">
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Online Orders</p>
              <p className="text-xs text-foreground/40">Accept orders through the website</p>
            </div>
          </div>
          <Toggle
            checked={quickControls.onlineOrders}
            onChange={() => updateQuickControls({ onlineOrders: !quickControls.onlineOrders })}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Delivery Pricing</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Delivery Fee ($)">
            <input
              type="number"
              step="0.01"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Minimum Order Amount ($)">
            <input
              type="number"
              step="0.01"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Tax Rate (%)">
            <input
              type="number"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Delivery Radius (km)">
            <input
              type="number"
              value={deliveryRadius}
              onChange={(e) => setDeliveryRadius(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      {/* Time */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Delivery Time</h3>
        <Field label="Estimated Delivery Time (minutes)">
          <select
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
            className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
          >
            <option value="15-20">15-20 minutes</option>
            <option value="20-30">20-30 minutes</option>
            <option value="30-45">30-45 minutes</option>
            <option value="45-60">45-60 minutes</option>
            <option value="60+">60+ minutes</option>
          </select>
        </Field>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        {saved ? "Saved!" : "Save Delivery Settings"}
      </button>
    </div>
  );
}

// ── Reservations Tab ──────────────────────────────────────────────────────────
function ReservationsTab() {
  const { quickControls, updateQuickControls } = useRestaurantStore();
  const [maxPartySize,    setMaxPartySize]    = useState("10");
  const [slotDuration,   setSlotDuration]    = useState("90");
  const [advanceNotice,  setAdvanceNotice]   = useState("24");
  const [maxAdvanceDays, setMaxAdvanceDays]  = useState("60");
  const [confirmationMsg, setConfirmationMsg] = useState(
    "Your reservation request has been received. Our team will contact you to confirm."
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Accept Reservations Toggle */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Accept Online Reservations</p>
              <p className="text-xs text-foreground/40">Allow guests to book via the website</p>
            </div>
          </div>
          <Toggle
            checked={quickControls.acceptReservations}
            onChange={() =>
              updateQuickControls({ acceptReservations: !quickControls.acceptReservations })
            }
          />
        </div>
      </div>

      {/* Booking Rules */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Booking Rules</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Maximum Party Size">
            <input
              type="number"
              value={maxPartySize}
              onChange={(e) => setMaxPartySize(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Time Slot Duration (minutes)">
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(e.target.value)}
              className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
            >
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">2 hours</option>
              <option value="150">2.5 hours</option>
              <option value="180">3 hours</option>
            </select>
          </Field>
          <Field label="Minimum Advance Notice (hours)">
            <input
              type="number"
              value={advanceNotice}
              onChange={(e) => setAdvanceNotice(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Max Advance Booking (days)">
            <input
              type="number"
              value={maxAdvanceDays}
              onChange={(e) => setMaxAdvanceDays(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      {/* Confirmation Message */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Confirmation Message</h3>
        <p className="text-xs text-foreground/40 mb-2">
          Shown to the guest after submitting the reservation form.
        </p>
        <textarea
          value={confirmationMsg}
          onChange={(e) => setConfirmationMsg(e.target.value)}
          rows={4}
          className={inputCls + " resize-none"}
        />
      </div>

      {/* Occasion Types */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Occasion Types</h3>
        <p className="text-xs text-foreground/40 mb-2">
          Available occasion options shown on the reservation form.
        </p>
        <div className="flex flex-wrap gap-2">
          {["Anniversary", "Birthday", "Business Dinner", "Date Night", "Celebration", "Other"].map(
            (occ) => (
              <span
                key={occ}
                className="px-3 py-1 text-xs bg-white/5 border border-white/10 rounded-full text-foreground/60"
              >
                {occ}
              </span>
            )
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
      >
        <Save className="w-3.5 h-3.5" />
        {saved ? "Saved!" : "Save Reservation Settings"}
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminBusinessDetails() {
  const [activeTab, setActiveTab] = useState<Tab>("Branding");

  return (
    <AdminLayout
      title="Business Details"
      subtitle="Manage your restaurant's identity, hours, and contact information"
    >
      <div className="flex gap-1 flex-wrap mb-6 border-b border-white/10 pb-3">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs transition-colors",
              activeTab === tab
                ? "bg-primary/15 text-primary font-medium"
                : "text-foreground/50 hover:text-foreground hover:bg-white/5"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Branding"       && <BrandingTab />}
      {activeTab === "Contact"        && <ContactTab />}
      {activeTab === "Business Hours" && <BusinessHoursTab />}
      {activeTab === "Social Media"   && <SocialMediaTab />}
      {activeTab === "Delivery"       && <DeliveryTab />}
      {activeTab === "Reservations"   && <ReservationsTab />}
    </AdminLayout>
  );
}
