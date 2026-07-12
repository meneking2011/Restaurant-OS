import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = ["Branding", "Contact", "Business Hours", "Social Media", "Delivery", "Reservations"] as const;
type Tab = typeof TABS[number];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-foreground/60 mb-1 block">{label}</label>
      {children}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

const brandingSchema = z.object({
  name: z.string().min(1, "Required"),
  tagline: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  heroImage: z.string().url("Must be a valid URL"),
});

function BrandingTab() {
  const { config, updateConfig } = useRestaurantStore();
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(brandingSchema),
    defaultValues: { name: config.name, tagline: config.tagline, description: config.description, heroImage: config.heroImage },
  });
  const onSubmit = (data: any) => { updateConfig(data); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <Field label="Restaurant Name" error={errors.name?.message as string}><input {...register("name")} className={inputCls} /></Field>
      <Field label="Tagline / Slogan" error={errors.tagline?.message as string}><input {...register("tagline")} className={inputCls} /></Field>
      <Field label="Short Description" error={errors.description?.message as string}><textarea {...register("description")} rows={3} className={inputCls + " resize-none"} /></Field>
      <Field label="Hero Image URL" error={errors.heroImage?.message as string}><input {...register("heroImage")} className={inputCls} /></Field>
      <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
        <Save className="w-3.5 h-3.5" />{saved ? "Saved!" : "Save Changes"}
      </button>
    </form>
  );
}

const contactSchema = z.object({
  phone: z.string().min(1, "Required"),
  email: z.string().email("Valid email required"),
  street: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  zip: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
});

function ContactTab() {
  const { config, updateConfig } = useRestaurantStore();
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: config.phone, email: config.email,
      street: config.address.street, city: config.address.city,
      state: config.address.state, zip: config.address.zip, country: config.address.country,
    },
  });
  const onSubmit = (data: any) => {
    updateConfig({ phone: data.phone, email: data.email, address: { street: data.street, city: data.city, state: data.state, zip: data.zip, country: data.country } });
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Phone" error={errors.phone?.message as string}><input {...register("phone")} className={inputCls} /></Field>
        <Field label="Email" error={errors.email?.message as string}><input {...register("email")} type="email" className={inputCls} /></Field>
      </div>
      <Field label="Street Address" error={errors.street?.message as string}><input {...register("street")} className={inputCls} /></Field>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="City" error={errors.city?.message as string}><input {...register("city")} className={inputCls} /></Field>
        <Field label="State/Province" error={errors.state?.message as string}><input {...register("state")} className={inputCls} /></Field>
        <Field label="ZIP / Postal" error={errors.zip?.message as string}><input {...register("zip")} className={inputCls} /></Field>
        <Field label="Country" error={errors.country?.message as string}><input {...register("country")} className={inputCls} /></Field>
      </div>
      <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
        <Save className="w-3.5 h-3.5" />{saved ? "Saved!" : "Save Changes"}
      </button>
    </form>
  );
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function BusinessHoursTab() {
  const { config, updateConfig } = useRestaurantStore();
  const [hours, setHours] = useState<{ day: string; hours: string }[]>(
    DAYS_OF_WEEK.map(day => config.openingHours.find(h => h.day === day) ?? { day, hours: "Closed" })
  );
  const [saved, setSaved] = useState(false);

  const handleChange = (day: string, value: string) => {
    setHours(prev => prev.map(h => h.day === day ? { ...h, hours: value } : h));
  };

  const handleSave = () => {
    updateConfig({ openingHours: hours });
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-3">
      {hours.map(({ day, hours: val }) => (
        <div key={day} className="flex items-center gap-4">
          <span className="text-sm text-foreground/60 w-28 shrink-0">{day}</span>
          <input
            value={val}
            onChange={e => handleChange(day, e.target.value)}
            className={inputCls + " flex-1"}
            placeholder="e.g. 5:00 PM - 10:00 PM or Closed"
          />
        </div>
      ))}
      <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors mt-4">
        <Save className="w-3.5 h-3.5" />{saved ? "Saved!" : "Save Hours"}
      </button>
    </div>
  );
}

function SocialMediaTab() {
  const { config, updateConfig } = useRestaurantStore();
  const getSocial = (platform: string) => config.socials.find(s => s.platform === platform)?.url ?? "#";
  const [instagram, setInstagram] = useState(getSocial("Instagram"));
  const [facebook, setFacebook] = useState(getSocial("Facebook"));
  const [tiktok, setTiktok] = useState(getSocial("TikTok"));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    updateConfig({ socials: [{ platform: "Instagram", url: instagram }, { platform: "Facebook", url: facebook }, { platform: "TikTok", url: tiktok }] });
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Field label="Instagram URL"><input value={instagram} onChange={e => setInstagram(e.target.value)} className={inputCls} placeholder="https://instagram.com/yourpage" /></Field>
      <Field label="Facebook URL"><input value={facebook} onChange={e => setFacebook(e.target.value)} className={inputCls} placeholder="https://facebook.com/yourpage" /></Field>
      <Field label="TikTok URL"><input value={tiktok} onChange={e => setTiktok(e.target.value)} className={inputCls} placeholder="https://tiktok.com/@yourhandle" /></Field>
      <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
        <Save className="w-3.5 h-3.5" />{saved ? "Saved!" : "Save Changes"}
      </button>
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Save className="w-6 h-6 text-primary/40" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-2">{label} Settings</h3>
      <p className="text-xs text-foreground/40 leading-relaxed">This section will be configurable in the next phase. {label} settings are managed directly from the system defaults for now.</p>
    </div>
  );
}

export default function AdminBusinessDetails() {
  const [activeTab, setActiveTab] = useState<Tab>("Branding");

  return (
    <AdminLayout title="Business Details" subtitle="Manage your restaurant's identity, hours, and contact information">
      <div className="flex gap-1 flex-wrap mb-6 border-b border-white/10 pb-3">
        {TABS.map(tab => (
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

      {activeTab === "Branding" && <BrandingTab />}
      {activeTab === "Contact" && <ContactTab />}
      {activeTab === "Business Hours" && <BusinessHoursTab />}
      {activeTab === "Social Media" && <SocialMediaTab />}
      {activeTab === "Delivery" && <PlaceholderTab label="Delivery" />}
      {activeTab === "Reservations" && <PlaceholderTab label="Reservations" />}
    </AdminLayout>
  );
}
