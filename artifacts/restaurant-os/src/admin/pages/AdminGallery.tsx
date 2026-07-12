import { useState } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";

function GalleryForm({
  defaultValues,
  onSubmit,
  onCancel,
}: {
  defaultValues?: { src: string; alt: string; category?: string };
  onSubmit: (data: { src: string; alt: string; category: string }) => void;
  onCancel: () => void;
}) {
  const [src, setSrc] = useState(defaultValues?.src ?? "");
  const [alt, setAlt] = useState(defaultValues?.alt ?? "");
  const [category, setCategory] = useState(defaultValues?.category ?? "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!src.trim() || !alt.trim()) { setError("Image URL and alt text are required."); return; }
    try { new URL(src); } catch { setError("Please enter a valid image URL."); return; }
    onSubmit({ src: src.trim(), alt: alt.trim(), category: category.trim() });
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50";

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-xs text-foreground/60 mb-1 block">Image URL</label>
          <input value={src} onChange={e => setSrc(e.target.value)} className={inputCls} placeholder="https://images.unsplash.com/..." />
        </div>
        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Alt Text</label>
          <input value={alt} onChange={e => setAlt(e.target.value)} className={inputCls} placeholder="Description of image" />
        </div>
        <div>
          <label className="text-xs text-foreground/60 mb-1 block">Category (optional)</label>
          <input value={category} onChange={e => setCategory(e.target.value)} className={inputCls} placeholder="e.g. Ambiance, Food, Interior" />
        </div>
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      {src && (
        <div className="w-full h-32 rounded-lg overflow-hidden bg-white/5">
          <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setError("Could not load image from this URL.")} />
        </div>
      )}
      <div className="flex gap-2">
        <button type="submit" className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
          <Check className="w-3.5 h-3.5" /> Save
        </button>
        <button type="button" onClick={onCancel} className="flex items-center gap-1.5 px-4 py-2 bg-white/5 text-foreground/70 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminGallery() {
  const { galleryImages, addGalleryImage, updateGalleryImage, deleteGalleryImage } = useRestaurantStore();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <AdminLayout
      title="Gallery"
      subtitle={`${galleryImages.length} images in the gallery`}
      actions={
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Image
        </button>
      }
    >
      {adding && (
        <div className="mb-6">
          <GalleryForm
            onSubmit={(data) => { addGalleryImage(data); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {galleryImages.map((img) =>
          editingId === img.id ? (
            <div key={img.id} className="col-span-2 sm:col-span-3 lg:col-span-4">
              <GalleryForm
                defaultValues={img}
                onSubmit={(data) => { updateGalleryImage(img.id, data); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            </div>
          ) : (
            <div key={img.id} className="relative group overflow-hidden rounded-xl bg-white/5 border border-white/10">
              <img src={img.src} alt={img.alt} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => { setEditingId(img.id); setAdding(false); }}
                    className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(img.id)}
                    className="p-1.5 rounded-lg bg-red-500/30 text-red-300 hover:bg-red-500/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  {img.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white/80">{img.category}</span>
                  )}
                  <p className="text-xs text-white/70 mt-1 line-clamp-2">{img.alt}</p>
                </div>
              </div>
            </div>
          )
        )}

        {galleryImages.length === 0 && (
          <div className="col-span-full text-center py-16 text-foreground/40 text-sm">
            No gallery images yet. Add your first image.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove gallery image?"
        description="This image will be permanently removed from your gallery."
        onConfirm={() => {
          if (deleteTarget) deleteGalleryImage(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </AdminLayout>
  );
}
