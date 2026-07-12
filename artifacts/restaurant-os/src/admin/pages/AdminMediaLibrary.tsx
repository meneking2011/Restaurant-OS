import { useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Upload, FolderPlus, Trash2, Download, Copy, Search, X, FolderOpen, Image } from "lucide-react";

type Folder = { key: string; label: string; count: number };

const FOLDERS: Folder[] = [
  { key: "all", label: "All Files", count: 0 },
  { key: "food", label: "Food Images", count: 0 },
  { key: "gallery", label: "Gallery", count: 0 },
  { key: "hero", label: "Hero Images", count: 0 },
  { key: "backgrounds", label: "Backgrounds", count: 0 },
  { key: "logos", label: "Logos", count: 0 },
  { key: "icons", label: "Icons", count: 0 },
];

type MediaFile = {
  id: string;
  name: string;
  src: string;
  type: string;
  size: string;
  dimensions: string;
  folder: string;
  altText: string;
  usedIn: string[];
};

export default function AdminMediaLibrary() {
  const { galleryImages, menuItems, config } = useRestaurantStore();
  const [activeFolder, setActiveFolder] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [viewing, setViewing] = useState<MediaFile | null>(null);

  const files: MediaFile[] = [
    ...galleryImages.map((g) => ({
      id: g.id,
      name: g.alt.replace(/\s+/g, "_") + ".jpg",
      src: g.src,
      type: "JPG",
      size: "2.1 MB",
      dimensions: "1920×1080",
      folder: "gallery",
      altText: g.alt,
      usedIn: ["Gallery Page"],
    })),
    ...menuItems.filter((m) => m.image).map((m) => ({
      id: `menu-${m.id}`,
      name: m.name.replace(/\s+/g, "_") + ".jpg",
      src: m.image,
      type: "JPG",
      size: "1.4 MB",
      dimensions: "800×600",
      folder: "food",
      altText: m.name,
      usedIn: [`Menu (${m.name})`],
    })),
    {
      id: "hero-main",
      name: "hero_main.jpg",
      src: config.heroImage,
      type: "JPG",
      size: "3.8 MB",
      dimensions: "1920×1080",
      folder: "hero",
      altText: "Hero background image",
      usedIn: ["Homepage Hero"],
    },
  ];

  const folderCounts = FOLDERS.map((f) => ({
    ...f,
    count: f.key === "all" ? files.length : files.filter((fi) => fi.folder === f.key).length,
  }));

  const filtered = files.filter((f) => {
    const inFolder = activeFolder === "all" || f.folder === activeFolder;
    const inSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.altText.toLowerCase().includes(search.toLowerCase());
    return inFolder && inSearch;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  return (
    <AdminLayout
      title="Media Library"
      subtitle="Manage all images and files used across your website"
      actions={
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors">
            <FolderPlus className="w-3.5 h-3.5" /> Create Folder
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-black rounded-lg text-xs font-medium hover:bg-primary/80 transition-colors">
            <Upload className="w-3.5 h-3.5" /> Upload Files
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[180px_1fr_260px] gap-5">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 h-fit">
          <p className="text-xs text-foreground/40 uppercase tracking-widest px-2 mb-2">Folders</p>
          <div className="space-y-0.5">
            {folderCounts.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveFolder(key)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                  activeFolder === key
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                )}
              >
                <span className="flex items-center gap-2">
                  {key === "all" ? <FolderOpen className="w-3.5 h-3.5 shrink-0" /> : <FolderOpen className="w-3.5 h-3.5 shrink-0" />}
                  {label}
                </span>
                <span className="text-xs opacity-50">{count}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40"
              />
            </div>
          </div>

          {selected.length > 0 && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-primary/5 border border-primary/20 rounded-lg text-xs">
              <span className="text-primary font-medium">{selected.length} selected</span>
              <button className="flex items-center gap-1 text-red-400 hover:text-red-300 ml-2"><Trash2 className="w-3 h-3" /> Delete</button>
              <button className="flex items-center gap-1 text-foreground/60 hover:text-foreground"><Copy className="w-3 h-3" /> Copy Links</button>
              <button className="ml-auto text-foreground/40 hover:text-foreground" onClick={() => setSelected([])}><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "relative group rounded-xl overflow-hidden border cursor-pointer transition-all",
                  selected.includes(file.id)
                    ? "border-primary/50 ring-1 ring-primary/30"
                    : "border-white/10 hover:border-white/20",
                  viewing?.id === file.id && "border-primary/60"
                )}
                onClick={() => setViewing(viewing?.id === file.id ? null : file)}
              >
                <div className="aspect-square bg-white/5">
                  <img src={file.src} alt={file.altText} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="checkbox"
                    checked={selected.includes(file.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelect(file.id); }}
                    className="accent-primary w-4 h-4"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="p-2">
                  <p className="text-xs text-foreground/70 truncate">{file.name}</p>
                  <p className="text-[10px] text-foreground/40">{file.type} · {file.size}</p>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-foreground/30 text-sm">
              <Image className="w-8 h-8 mx-auto mb-3 opacity-30" />
              No files found.
            </div>
          )}
        </div>

        {viewing ? (
          <div className="bg-[hsl(15,13%,7%)] border border-white/10 rounded-xl p-4 h-fit">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground">File Details</p>
              <button onClick={() => setViewing(null)} className="p-1 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <img src={viewing.src} alt={viewing.altText} className="w-full aspect-video object-cover rounded-lg mb-3" />
            <div className="space-y-1.5 text-xs mb-4">
              <div className="flex justify-between text-foreground/50"><span>Type</span><span className="text-foreground">{viewing.type}</span></div>
              <div className="flex justify-between text-foreground/50"><span>Size</span><span className="text-foreground">{viewing.size}</span></div>
              <div className="flex justify-between text-foreground/50"><span>Dimensions</span><span className="text-foreground">{viewing.dimensions}</span></div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-foreground/40 mb-1 block">Alt Text</label>
              <input defaultValue={viewing.altText} className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/40" />
            </div>
            <div className="mb-4">
              <p className="text-xs text-foreground/40 mb-1">Where it's used</p>
              {viewing.usedIn.map((u) => (
                <p key={u} className="text-xs text-foreground/60">{u}</p>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Rename", icon: null },
                { label: "Download", icon: Download },
                { label: "Copy Link", icon: Copy },
                { label: "Delete", icon: Trash2 },
              ].map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className={cn(
                    "flex items-center justify-center gap-1 py-1.5 rounded text-xs border transition-colors",
                    label === "Delete"
                      ? "border-red-400/20 text-red-400 hover:bg-red-400/10"
                      : "border-white/10 text-foreground/60 hover:bg-white/10 hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-fit">
            <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">File Details</p>
            <div className="flex items-center justify-center h-32 text-foreground/20 text-sm">
              Select a file to view details
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
