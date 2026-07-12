import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { Save } from "lucide-react";
import { useState } from "react";

const settingsSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  tagline: z.string().min(1, "Tagline is required"),
  description: z.string().min(1, "Description is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Valid email required"),
  heroImage: z.string().url("Must be a valid URL"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP is required"),
  country: z.string().min(1, "Country is required"),
  instagramUrl: z.string().optional(),
  facebookUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

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

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50";

export default function AdminSettings() {
  const { config, updateConfig } = useRestaurantStore();
  const [saved, setSaved] = useState(false);

  const socials = config.socials.reduce(
    (acc, s) => ({ ...acc, [`${s.platform.toLowerCase()}Url`]: s.url }),
    {} as Record<string, string>
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: config.name,
      tagline: config.tagline,
      description: config.description,
      phone: config.phone,
      email: config.email,
      heroImage: config.heroImage,
      street: config.address.street,
      city: config.address.city,
      state: config.address.state,
      zip: config.address.zip,
      country: config.address.country,
      instagramUrl: socials.instagramUrl ?? "#",
      facebookUrl: socials.facebookUrl ?? "#",
      tiktokUrl: socials.tiktokUrl ?? "#",
    },
  });

  const onSubmit = (data: SettingsForm) => {
    updateConfig({
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      phone: data.phone,
      email: data.email,
      heroImage: data.heroImage,
      address: {
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
      },
      socials: [
        { platform: "Instagram", url: data.instagramUrl ?? "#" },
        { platform: "Facebook", url: data.facebookUrl ?? "#" },
        { platform: "TikTok", url: data.tiktokUrl ?? "#" },
      ],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AdminLayout
      title="Settings"
      subtitle="Edit your restaurant's core information"
      actions={
        <button
          form="settings-form"
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saved ? "Saved!" : "Save Changes"}
        </button>
      }
    >
      <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Identity</h2>
          <Field label="Restaurant Name" error={errors.name?.message}>
            <input {...register("name")} className={inputCls} />
          </Field>
          <Field label="Tagline" error={errors.tagline?.message}>
            <input {...register("tagline")} className={inputCls} />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <textarea {...register("description")} rows={3} className={inputCls + " resize-none"} />
          </Field>
          <Field label="Hero Image URL" error={errors.heroImage?.message}>
            <input {...register("heroImage")} className={inputCls} />
          </Field>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone" error={errors.phone?.message}>
              <input {...register("phone")} className={inputCls} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input {...register("email")} type="email" className={inputCls} />
            </Field>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Address</h2>
          <Field label="Street" error={errors.street?.message}>
            <input {...register("street")} className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="City" error={errors.city?.message}>
              <input {...register("city")} className={inputCls} />
            </Field>
            <Field label="State" error={errors.state?.message}>
              <input {...register("state")} className={inputCls} />
            </Field>
            <Field label="ZIP" error={errors.zip?.message}>
              <input {...register("zip")} className={inputCls} />
            </Field>
            <Field label="Country" error={errors.country?.message}>
              <input {...register("country")} className={inputCls} />
            </Field>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Social Links</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Instagram URL">
              <input {...register("instagramUrl")} className={inputCls} placeholder="https://instagram.com/..." />
            </Field>
            <Field label="Facebook URL">
              <input {...register("facebookUrl")} className={inputCls} placeholder="https://facebook.com/..." />
            </Field>
            <Field label="TikTok URL">
              <input {...register("tiktokUrl")} className={inputCls} placeholder="https://tiktok.com/..." />
            </Field>
          </div>
        </section>
      </form>
    </AdminLayout>
  );
}
