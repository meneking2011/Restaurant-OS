import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRestaurantStore } from "@/store/restaurantStore";
import { MenuItem } from "@/types/restaurant";
import { AdminLayout } from "../layout/AdminLayout";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { cn } from "@/lib/utils";
import {
  Plus, Pencil, Trash2, X, Check, Eye, EyeOff, Upload, Star, Search, Filter, PencilLine
} from "lucide-react";

const menuSchema = z.object({
  name:        z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price:       z.coerce.number().min(0, "Price must be positive"),
  category:    z.enum(["starters", "mains", "desserts", "drinks"]),
  image:       z.string().min(1, "Image is required"),
  available:   z.boolean(),
  featured:    z.boolean(),
  tags:        z.string(),
  inspiredBy:  z.string().optional(),
});

type MenuForm = z.infer<typeof menuSchema>;

const CATEGORIES = ["starters", "mains", "desserts", "drinks"] as const;

function ImageUploadField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"url" | "upload">("url");
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target?.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs text-foreground/60">Image</label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode("url")}
            className={cn("text-[10px] px-2 py-0.5 rounded", mode === "url" ? "bg-primary/20 text-primary" : "text-foreground/40 hover:text-foreground")}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={cn("text-[10px] px-2 py-0.5 rounded", mode === "upload" ? "bg-primary/20 text-primary" : "text-foreground/40 hover:text-foreground")}
          >
            Upload
          </button>
        </div>
      </div>

      {mode === "url" ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
          placeholder="https://example.com/image.jpg"
        />
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className={cn(
            "w-full border border-dashed border-white/20 rounded-lg p-4 cursor-pointer hover:border-primary/40 transition-colors text-center",
            uploading && "opacity-50"
          )}
        >
          <Upload className="w-4 h-4 mx-auto mb-1 text-foreground/40" />
          <p className="text-xs text-foreground/40">{uploading ? "Processing..." : "Click to upload"}</p>
          <p className="text-[10px] text-foreground/30 mt-0.5">JPEG, PNG, WebP · Recommended: 800×600px (4:3)</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-2 flex items-center gap-2">
          <img src={value.startsWith("data:") ? value : value} alt="preview" className="w-12 h-12 object-cover rounded" />
          <div className="text-[10px] text-foreground/40">
            <p>Recommended sizes:</p>
            <p>Menu card: 800×600px</p>
            <p>Feature hero: 1200×800px</p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-auto p-1 text-foreground/30 hover:text-red-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function MenuItemForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<MenuForm & { image: string }>;
  onSubmit: (data: MenuForm) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MenuForm>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      available: true,
      featured:  false,
      tags:      "",
      image:     "",
      ...defaultValues,
    },
  });

  const imageValue = watch("image");

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Name *</label>
          <input
            {...register("name")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            placeholder="Dish name"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Category *</label>
          <select
            {...register("category")}
            className="w-full bg-[hsl(15,13%,12%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 capitalize"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">{c}</option>
            ))}
          </select>
          {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
        </div>

        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Price ($) *</label>
          <input
            {...register("price")}
            type="number"
            step="0.01"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            placeholder="0.00"
          />
          {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Inspired By (optional)</label>
          <input
            {...register("inspiredBy")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            placeholder="e.g. French Riviera"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs text-foreground/60 mb-1 block">Description *</label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 resize-none"
            placeholder="Short menu description"
          />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <ImageUploadField
            value={imageValue}
            onChange={(v) => setValue("image", v, { shouldValidate: true })}
            error={errors.image?.message}
          />
        </div>

        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Tags (comma-separated)</label>
          <input
            {...register("tags")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
            placeholder="vegetarian, spicy, gluten-free"
          />
        </div>

        <div className="flex flex-col gap-3 justify-end">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" {...register("available")} className="sr-only" id="available" />
            <div
              className="relative inline-flex items-center"
              onClick={() => {
                const el = document.getElementById("available") as HTMLInputElement;
                el?.click();
              }}
            >
              <span className="text-xs text-foreground/60">Available</span>
            </div>
            <input type="checkbox" {...register("available")} className="w-4 h-4 accent-primary" />
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" {...register("featured")} className="w-4 h-4 accent-primary" />
            <span className="text-xs text-foreground/60">Featured item</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> Save Item
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-foreground/70 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminMenu() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem, updateMenuItem: toggleAvailable } = useRestaurantStore();
  const [adding,       setAdding]       = useState(false);
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search,        setSearch]       = useState("");
  const [editMode,      setEditMode]     = useState(false);

  const categoryCounts: Record<string, number> = {
    all:      menuItems.length,
    starters: menuItems.filter((m) => m.category === "starters").length,
    mains:    menuItems.filter((m) => m.category === "mains").length,
    desserts: menuItems.filter((m) => m.category === "desserts").length,
    drinks:   menuItems.filter((m) => m.category === "drinks").length,
  };

  const filtered = menuItems
    .filter((m) => activeCategory === "all" || m.category === activeCategory)
    .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()));

  const toForm = (m: MenuItem): MenuForm => ({
    name:        m.name,
    description: m.description,
    price:       m.price,
    category:    m.category,
    image:       m.image,
    available:   m.available,
    featured:    m.featured ?? false,
    tags:        m.tags.join(", "),
    inspiredBy:  m.inspiredBy,
  });

  return (
    <AdminLayout
      title="Menu Manager"
      subtitle={`${menuItems.length} items across ${CATEGORIES.length} categories`}
      actions={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu…"
              className="pl-8 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40 w-40"
            />
          </div>
          <button
            onClick={() => { setEditMode((v) => !v); setEditingId(null); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
              editMode
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/25"
                : "bg-white/5 text-foreground/70 border-white/10 hover:bg-white/10"
            )}
          >
            {editMode ? <Check className="w-3.5 h-3.5" /> : <PencilLine className="w-3.5 h-3.5" />}
            {editMode ? "Apply Changes" : "Edit Menu"}
          </button>
          <button
            onClick={() => { setAdding(true); setEditingId(null); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>
      }
    >
      {editMode && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-lg text-sm text-primary">
          <PencilLine className="w-3.5 h-3.5 shrink-0" />
          Edit mode is on — select any item below to edit it, then click "Apply Changes" when you're done.
        </div>
      )}

      {adding && (
        <div className="mb-5">
          <MenuItemForm
            onSubmit={(data) => {
              addMenuItem({
                name:        data.name,
                description: data.description,
                price:       data.price,
                category:    data.category,
                image:       data.image,
                available:   data.available,
                featured:    data.featured,
                tags:        data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
                inspiredBy:  data.inspiredBy,
              });
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-none">
        {(["all", ...CATEGORIES] as string[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "shrink-0 px-3 py-1 rounded-full text-xs capitalize transition-colors border",
              activeCategory === cat
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-white/5 text-foreground/50 border-white/10 hover:bg-white/10 hover:text-foreground"
            )}
          >
            {cat === "all" ? "All Items" : cat}
            <span className="ml-1 opacity-60">{categoryCounts[cat]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-14 text-foreground/30 flex flex-col items-center gap-3">
            <Filter className="w-8 h-8 opacity-30" />
            <p className="text-sm">No items match this filter.</p>
          </div>
        )}

        {filtered.map((item) =>
          editingId === item.id ? (
            <MenuItemForm
              key={item.id}
              defaultValues={toForm(item)}
              onSubmit={(data) => {
                updateMenuItem(item.id, {
                  name:        data.name,
                  description: data.description,
                  price:       data.price,
                  category:    data.category,
                  image:       data.image,
                  available:   data.available,
                  featured:    data.featured,
                  tags:        data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
                  inspiredBy:  data.inspiredBy,
                });
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 group hover:border-white/15 transition-all"
            >
              <div className="relative shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/64x64?text=IMG"; }}
                />
                {item.featured && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary rounded-full p-0.5">
                    <Star className="w-2.5 h-2.5 text-black" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">{item.name}</p>
                  <span className="text-[10px] uppercase tracking-widest text-foreground/40 border border-white/10 px-1.5 py-0.5 rounded">
                    {item.category}
                  </span>
                  {!item.available && (
                    <span className="text-[10px] text-red-400 bg-red-400/10 border border-red-400/20 px-1.5 py-0.5 rounded uppercase tracking-widest">
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/60 mt-0.5 truncate">{item.description}</p>
                {item.tags.length > 0 && (
                  <p className="text-xs text-foreground/30 mt-1">{item.tags.slice(0,4).join(" · ")}</p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className="text-lg font-semibold text-primary">${item.price.toFixed(2)}</p>
              </div>

              {editMode && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => updateMenuItem(item.id, { available: !item.available })}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-foreground/50 hover:text-foreground transition-colors"
                    title={item.available ? "Mark unavailable" : "Mark available"}
                  >
                    {item.available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => { setEditingId(item.id); setAdding(false); }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-foreground/50 hover:text-foreground transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item.id)}
                    className="p-1.5 rounded-lg hover:bg-red-400/10 text-foreground/50 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete menu item?"
        description="This will permanently remove this menu item from the restaurant."
        onConfirm={() => {
          if (deleteTarget) deleteMenuItem(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </AdminLayout>
  );
}
