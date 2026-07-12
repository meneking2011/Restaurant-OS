import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRestaurantStore } from "@/store/restaurantStore";
import { MenuItem } from "@/types/restaurant";
import { AdminLayout } from "../layout/AdminLayout";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { cn } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

const menuSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.enum(["starters", "mains", "desserts", "drinks"]),
  image: z.string().url("Must be a valid URL"),
  available: z.boolean(),
  featured: z.boolean(),
  tags: z.string(),
  inspiredBy: z.string().optional(),
});

type MenuForm = z.infer<typeof menuSchema>;

const CATEGORIES = ["starters", "mains", "desserts", "drinks"] as const;

function MenuItemForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: Partial<MenuForm>;
  onSubmit: (data: MenuForm) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MenuForm>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      available: true,
      featured: false,
      tags: "",
      ...defaultValues,
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Name</label>
          <input
            {...register("name")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50"
            placeholder="Dish name"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Category</label>
          <select
            {...register("category")}
            className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs text-foreground/60 mb-1 block">Description</label>
          <textarea
            {...register("description")}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50 resize-none"
            placeholder="Short description"
          />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Price (USD)</label>
          <input
            {...register("price")}
            type="number"
            step="0.01"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50"
            placeholder="0.00"
          />
          {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Image URL</label>
          <input
            {...register("image")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50"
            placeholder="https://images.unsplash.com/..."
          />
          {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image.message}</p>}
        </div>

        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Tags (comma-separated)</label>
          <input
            {...register("tags")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50"
            placeholder="Vegan, Gluten-Free"
          />
        </div>

        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Inspired By (optional)</label>
          <input
            {...register("inspiredBy")}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50"
            placeholder="e.g. Autumn Harvests"
          />
        </div>

        <div className="sm:col-span-2 flex gap-6">
          <label className="flex items-center gap-2 text-sm text-foreground/70 cursor-pointer">
            <input type="checkbox" {...register("available")} className="accent-primary" />
            Available
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground/70 cursor-pointer">
            <input type="checkbox" {...register("featured")} className="accent-primary" />
            Featured
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <Check className="w-3.5 h-3.5" /> Save
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
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useRestaurantStore();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered =
    categoryFilter === "all"
      ? menuItems
      : menuItems.filter((m) => m.category === categoryFilter);

  const handleAdd = (data: MenuForm) => {
    addMenuItem({
      ...data,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setAdding(false);
  };

  const handleEdit = (id: string, data: MenuForm) => {
    updateMenuItem(id, {
      ...data,
      tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setEditingId(null);
  };

  const itemFormDefaults = (item: MenuItem): Partial<MenuForm> => ({
    ...item,
    tags: item.tags.join(", "),
    inspiredBy: item.inspiredBy ?? "",
  });

  return (
    <AdminLayout
      title="Menu"
      subtitle={`${menuItems.length} items across ${CATEGORIES.length} categories`}
      actions={
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Item
        </button>
      }
    >
      <div className="flex gap-2 mb-5">
        {["all", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCategoryFilter(c)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs capitalize transition-colors border",
              categoryFilter === c
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-white/5 text-foreground/60 border-white/10 hover:bg-white/10"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {adding && (
        <div className="mb-4">
          <MenuItemForm
            onSubmit={handleAdd}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((item) =>
          editingId === item.id ? (
            <MenuItemForm
              key={item.id}
              defaultValues={itemFormDefaults(item)}
              onSubmit={(data) => handleEdit(item.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 group"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-14 h-14 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground text-sm">{item.name}</p>
                  {item.featured && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-primary/15 text-primary rounded-full">
                      Featured
                    </span>
                  )}
                  {!item.available && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-400/10 text-red-400 rounded-full">
                      Unavailable
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/50 truncate mt-0.5">{item.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-primary font-medium">${item.price}</span>
                  <span className="text-xs text-foreground/40 capitalize">{item.category}</span>
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-white/5 text-foreground/50 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            </div>
          )
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-foreground/40 text-sm">
            No items in this category.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete menu item?"
        description="This action cannot be undone. The item will be permanently removed from the menu."
        onConfirm={() => {
          if (deleteTarget) deleteMenuItem(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </AdminLayout>
  );
}
