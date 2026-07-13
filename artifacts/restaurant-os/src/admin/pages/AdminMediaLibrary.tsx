import { useState, useRef } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Upload, FolderPlus, Trash2, Download, Copy, Search, X, FolderOpen, Image, Check } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";

type FolderKey = "all" | "food" | "gallery" | "hero" | "backgrounds" | "logos" | "icons";

const FOLDER_LABELS: Record<FolderKey, string> = {
  all: "All Files", food: "Food Images", gallery: "Gallery",
  hero: "Hero Images", backgrounds: "Backgrounds", logos: "Logos", icons: "Icons",
};

type MediaFile = {
  id: string;
  name: string;
  src: string;
  type: string;
  size: string;
  dimensions: string;
  folder: FolderKey;
  altText: string;
  usedIn: string[];
};

// Upload a local file and return a data-URL
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Edit Alt Text inline ──────────────────────────────────────────────────────
function AltTextEditor({ file, onSave }: { file: MediaFile; onSave: (alt: string) => void }) {
  const [val, setVal] = useState(file.altText);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(val);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mb-4">
      <label className="text-xs text-foreground/40 mb-1 block">Alt Text</label>
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/40"
        />
        <button onClick={handleSave} className="p-1.5 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors" title="Save">
          {saved ? <Check className="w-3 h-3" /> : <Check className="w-3 h-3 opacity-50" />}
        </button>
      </div>
    </div>
  );
}

export default function AdminMediaLibrary() {
  const { galleryImages, menuItems, config, updateGalleryImage, deleteGalleryImage, addGalleryImage } = useRestaurantStore();

  const [activeFolder, setActiveFolder] = useState<FolderKey>("all");
  const [search,       setSearch]       = useState("");
  const [selected,     setSelected]     = useState<string[]>([]);
  const [viewing,      setViewing]      = useState<MediaFile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [createFolder, setCreateFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [copiedId,     setCopiedId]     = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build file list from store data
  const files: MediaFile[] = [
    ...galleryImages.map((g) => ({
      id:         g.id,
      name:       g.alt.replace(/\s+/g, "_") + ".jpg",
      src:        g.src,
      type:       "JPG",
      size:       "~2 MB",
      dimensions: "1920×1080",
      folder:     "gallery" as FolderKey,
      altText:    g.alt,
      usedIn:     ["Gallery Page"],
    })),
    ...menuItems.filter((m) => m.image).map((m) => ({
      id:         `menu-${m.id}`,
      name:       m.name.replace(/\s+/g, "_") + ".jpg",
      src:        m.image,
      type:       "JPG",
      size:       "~1.4 MB",
      dimensions: "800×600",
      folder:     "food" as FolderKey,
      altText:    m.name,
      usedIn:     [`Menu (${m.name})`],
    })),
    {
      id:         "hero-main",
      name:       "hero_main.jpg",
      src:        config.heroImage,
      type:       "JPG",
      size:       "~3.8 MB",
      dimensions: "1920×1080",
      folder:     "hero" as FolderKey,
      altText:    "Hero background image",
      usedIn:     ["Homepage Hero"],
    },
  ].filter((f) => f.src);

  const allFolders: string[] = ["all", "food", "gallery", "hero", "backgrounds", "logos", "icons", ...customFolders];

  const folderCounts = allFolders.map((key) => ({
    key,
    label:  key === "all" ? "All Files" : (FOLDER_LABELS[key as FolderKey] ?? key),
    count:  key === "all" ? files.length : files.filter((f) => f.folder === key).length,
  }));

  const filtered = files.filter((f) => {
    const inFolder = activeFolder === "all" || f.folder === activeFolder;
    const inSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.altText.toLowerCase().includes(search.toLowerCase());
    return inFolder && inSearch;
  });

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  // Upload handler — real file input
  const handleUploadFiles = async (files_: FileList | null) => {
    if (!files_) return;
    setUploading(true);
    for (const file of Array.from(files_)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await readFileAsDataURL(file);
      addGalleryImage({ src: dataUrl, alt: file.name.replace(/\.[^.]+$/, ""), category: "Uploaded" });
    }
    setUploading(false);
  };

  // Copy URL to clipboard
  const copyUrl = (file: MediaFile) => {
    navigator.clipboard.writeText(file.src).then(() => {
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Download file
  const downloadFile = (file: MediaFile) => {
    const a = document.createElement("a");
    a.href = file.src;
    a.download = file.name;
    a.target = "_blank";
    a.click();
  };

  // Bulk delete (gallery images only — menu/hero images are managed in their own pages)
  const handleBulkDelete = () => {
    selected.forEach((id) => {
      if (!id.startsWith("menu-") && id !== "hero-main") {
        deleteGalleryImage(id);
      }
    });
    setSelected([]);
  };

  // Copy links in bulk
  const handleCopyLinks = () => {
    const urls = selected.map((id) => files.find((f) => f.id === id)?.src).filter(Boolean).join("\n");
    navigator.clipboard.writeText(urls as string);
  };

  return (
    <AdminLayout
      title="Media Library"
      subtitle="Manage all images and files used across your website"
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCreateFolder(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" /> Create Folder
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-black rounded-lg text-xs font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading…" : "Upload Files"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUploadFiles(e.target.files)}
          />
        </div>
      }
    >
      {/* Create Folder Modal */}
      {createFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[hsl(15,13%,9%)] border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Create New Folder</h3>
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name…"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/40 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { if (newFolderName.trim()) { setCustomFolders((p) => [...p, newFolderName.trim()]); setNewFolderName(""); setCreateFolder(false); } }}
                className="flex-1 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
              >
                Create
              </button>
              <button
                onClick={() => { setCreateFolder(false); setNewFolderName(""); }}
                className="px-4 py-2 bg-white/5 text-foreground/70 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[180px_1fr_260px] gap-5">
        {/* Folder sidebar */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 h-fit">
          <p className="text-xs text-foreground/40 uppercase tracking-widest px-2 mb-2">Folders</p>
          <div className="space-y-0.5">
            {folderCounts.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveFolder(key as FolderKey)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                  activeFolder === key
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                )}
              >
                <span className="flex items-center gap-2">
                  <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </span>
                <span className="text-xs opacity-50 shrink-0 ml-1">{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* File grid */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files…"
                className="w-full pl-9 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40"
              />
            </div>
          </div>

          {/* Bulk selection bar */}
          {selected.length > 0 && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-primary/5 border border-primary/20 rounded-lg text-xs">
              <span className="text-primary font-medium">{selected.length} selected</span>
              <button
                onClick={handleCopyLinks}
                className="flex items-center gap-1 text-foreground/60 hover:text-foreground ml-2"
              >
                <Copy className="w-3 h-3" /> Copy Links
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
              <button className="ml-auto text-foreground/40 hover:text-foreground" onClick={() => setSelected([])}>
                <X className="w-3.5 h-3.5" />
              </button>
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
                  <img src={file.src} alt={file.altText} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23222'/%3E%3C/svg%3E"; }} />
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                {/* Checkbox on hover */}
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
              {activeFolder !== "all" && (
                <p className="text-xs mt-2">Upload files to add them to this folder.</p>
              )}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {viewing ? (
          <div className="bg-[hsl(15,13%,7%)] border border-white/10 rounded-xl p-4 h-fit">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-foreground">File Details</p>
              <button onClick={() => setViewing(null)} className="p-1 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <img src={viewing.src} alt={viewing.altText} className="w-full aspect-video object-cover rounded-lg mb-3" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div className="space-y-1.5 text-xs mb-4">
              <div className="flex justify-between text-foreground/50"><span>Type</span><span className="text-foreground">{viewing.type}</span></div>
              <div className="flex justify-between text-foreground/50"><span>Size</span><span className="text-foreground">{viewing.size}</span></div>
              <div className="flex justify-between text-foreground/50"><span>Dimensions</span><span className="text-foreground">{viewing.dimensions}</span></div>
            </div>

            {/* Alt text — saves to gallery store if gallery image */}
            <AltTextEditor
              file={viewing}
              onSave={(alt) => {
                if (!viewing.id.startsWith("menu-") && viewing.id !== "hero-main") {
                  updateGalleryImage(viewing.id, { alt });
                  setViewing({ ...viewing, altText: alt });
                }
              }}
            />

            <div className="mb-4">
              <p className="text-xs text-foreground/40 mb-1">Where it's used</p>
              {viewing.usedIn.map((u) => (
                <p key={u} className="text-xs text-foreground/60">{u}</p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadFile(viewing)}
                className="flex items-center justify-center gap-1 py-1.5 rounded text-xs border border-white/10 text-foreground/60 hover:bg-white/10 hover:text-foreground transition-colors"
              >
                <Download className="w-3 h-3" /> Download
              </button>
              <button
                onClick={() => copyUrl(viewing)}
                className="flex items-center justify-center gap-1 py-1.5 rounded text-xs border border-white/10 text-foreground/60 hover:bg-white/10 hover:text-foreground transition-colors"
              >
                {copiedId === viewing.id ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3" />}
                {copiedId === viewing.id ? "Copied!" : "Copy URL"}
              </button>
              {!viewing.id.startsWith("menu-") && viewing.id !== "hero-main" && (
                <button
                  onClick={() => { setDeleteTarget(viewing.id); setViewing(null); }}
                  className="col-span-2 flex items-center justify-center gap-1 py-1.5 rounded text-xs border border-red-400/20 text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete File
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-fit">
            <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">File Details</p>
            <div
              className="flex flex-col items-center justify-center h-32 text-foreground/20 text-sm border-2 border-dashed border-white/10 rounded-lg cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-6 h-6 mb-2 opacity-50" />
              <span className="text-xs">Click to upload or select a file</span>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete file?"
        description="This image will be permanently removed from your gallery."
        onConfirm={() => { if (deleteTarget) deleteGalleryImage(deleteTarget); setDeleteTarget(null); }}
      />
    </AdminLayout>
  );
}
