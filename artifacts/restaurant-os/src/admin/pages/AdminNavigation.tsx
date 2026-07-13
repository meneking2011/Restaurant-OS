import { useState, useEffect } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { useRestaurantStore, NavLink } from "@/store/restaurantStore";
import { cn } from "@/lib/utils";
import { GripVertical, Eye, EyeOff, Plus, Trash2, Check, ExternalLink, Navigation as NavIcon } from "lucide-react";

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40";

export default function AdminNavigation() {
  const storeNavLinks = useRestaurantStore((s) => s.navLinks);
  const { updateNavLinks } = useRestaurantStore();

  const [links, setLinks]   = useState<NavLink[]>(storeNavLinks);
  const [saved, setSaved]   = useState(false);
  const [dirty, setDirty]   = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newHref,  setNewHref]  = useState("");
  const [newTab,   setNewTab]   = useState(false);

  // Stay in sync with store if another admin page changes navLinks
  useEffect(() => {
    setLinks(storeNavLinks);
    setDirty(false);
  }, [storeNavLinks]);

  const update = (updated: NavLink[]) => { setLinks(updated); setDirty(true); setSaved(false); };

  const toggleVisible = (id: string) =>
    update(links.map((l) => l.id === id ? { ...l, visible: !l.visible } : l));

  const updateLabel = (id: string, label: string) =>
    update(links.map((l) => l.id === id ? { ...l, label } : l));

  const updateHref = (id: string, href: string) =>
    update(links.map((l) => l.id === id ? { ...l, href } : l));

  const deleteLink = (id: string) =>
    update(links.filter((l) => l.id !== id));

  const addLink = () => {
    if (!newLabel.trim() || !newHref.trim()) return;
    update([...links, {
      id: `nav-${Date.now()}`,
      label: newLabel.trim().toUpperCase(),
      href:  newHref.trim().startsWith("/") ? newHref.trim() : "/" + newHref.trim(),
      visible: true,
      openInNewTab: newTab,
    }]);
    setNewLabel(""); setNewHref(""); setNewTab(false); setShowAdd(false);
  };

  // Drag-and-drop reorder
  const handleDragStart = (i: number) => setDragIdx(i);
  const handleDragOver  = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === i) return;
    const reordered = [...links];
    const [moved]   = reordered.splice(dragIdx, 1);
    reordered.splice(i, 0, moved);
    setDragIdx(i);
    update(reordered);
  };
  const handleDragEnd = () => setDragIdx(null);

  const handleSave = () => {
    updateNavLinks(links);
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const visibleLinks  = links.filter((l) => l.visible).length;
  const hiddenLinks   = links.filter((l) => !l.visible).length;

  return (
    <AdminLayout
      title="Navigation"
      subtitle="Manage and reorder the links shown in your site's hamburger menu"
      actions={
        <button
          onClick={handleSave}
          className={cn(
            "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
            dirty
              ? "bg-primary text-black hover:bg-primary/80"
              : "bg-white/5 border border-white/10 text-foreground/50 cursor-default"
          )}
        >
          {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : "Save Changes"}
        </button>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        {/* Editor */}
        <div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Total Links",  value: links.length },
              { label: "Visible",      value: visibleLinks },
              { label: "Hidden",       value: hiddenLinks },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-2xl font-semibold text-foreground">{value}</p>
                <p className="text-xs text-foreground/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Link list */}
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden mb-4">
            <div className="grid grid-cols-[32px_1fr_1.2fr_auto_auto] text-xs text-foreground/40 uppercase tracking-widest px-4 py-3 border-b border-white/10">
              <span />
              <span>Label</span>
              <span>URL / Path</span>
              <span>Visible</span>
              <span />
            </div>

            {links.map((link, idx) => (
              <div
                key={link.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "grid grid-cols-[32px_1fr_1.2fr_auto_auto] items-center px-4 py-3 border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]",
                  dragIdx === idx && "opacity-50"
                )}
              >
                {/* Drag handle */}
                <button className="text-foreground/20 hover:text-foreground/60 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4" />
                </button>

                {/* Label */}
                <input
                  value={link.label}
                  onChange={(e) => updateLabel(link.id, e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary/40 focus:outline-none text-sm text-foreground px-0 py-0.5 w-full mr-4"
                />

                {/* Href */}
                <input
                  value={link.href}
                  onChange={(e) => updateHref(link.id, e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary/40 focus:outline-none text-sm text-foreground/60 font-mono px-0 py-0.5 w-full mr-4"
                />

                {/* Toggle visible */}
                <button
                  onClick={() => toggleVisible(link.id)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    link.visible
                      ? "text-primary hover:bg-primary/10"
                      : "text-foreground/30 hover:text-foreground/60 hover:bg-white/5"
                  )}
                  title={link.visible ? "Visible — click to hide" : "Hidden — click to show"}
                >
                  {link.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteLink(link.id)}
                  className="p-1.5 rounded-lg text-foreground/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  title="Remove link"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add link */}
          {showAdd ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">Add New Link</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs text-foreground/40 mb-1 block">Label</label>
                  <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. BLOG" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs text-foreground/40 mb-1 block">URL / Path</label>
                  <input value={newHref} onChange={(e) => setNewHref(e.target.value)} placeholder="/blog" className={inputCls} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground/60 mb-4 cursor-pointer">
                <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} className="accent-primary" />
                Open in new tab
                <ExternalLink className="w-3 h-3 opacity-50" />
              </label>
              <div className="flex gap-2">
                <button onClick={addLink} className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors">
                  Add Link
                </button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 bg-white/5 border border-white/10 text-foreground/60 rounded-lg text-sm hover:bg-white/10 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-foreground/60 hover:text-foreground hover:bg-white/10 transition-colors w-full justify-center"
            >
              <Plus className="w-4 h-4" /> Add Navigation Link
            </button>
          )}
        </div>

        {/* Live preview */}
        <div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 sticky top-20">
            <p className="text-xs text-foreground/40 uppercase tracking-widest mb-4 flex items-center gap-2">
              <NavIcon className="w-3.5 h-3.5" /> Live Preview — Hamburger Menu
            </p>
            <div className="bg-[hsl(15,13%,5%)] rounded-lg p-4 space-y-1">
              {links.filter((l) => l.visible).map((link) => (
                <div key={link.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs font-semibold tracking-widest text-foreground/70">{link.label}</span>
                  <span className="text-[10px] text-foreground/30 font-mono">{link.href}</span>
                </div>
              ))}
              {links.filter((l) => l.visible).length === 0 && (
                <p className="text-xs text-foreground/30 text-center py-4">No visible links</p>
              )}
            </div>
            {dirty && (
              <p className="text-[10px] text-amber-400/80 mt-3 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                Unsaved changes — click Save to publish
              </p>
            )}
            {saved && (
              <p className="text-[10px] text-emerald-400 mt-3 flex items-center gap-1">
                <Check className="w-3 h-3" /> Saved to live site
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
