import { useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { GripVertical, Pencil, Trash2, Plus, Eye, EyeOff, Save, Check, X } from "lucide-react";

type NavLink = {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  openInNewTab: boolean;
};

const defaultLinks: NavLink[] = [
  { id: "home", label: "HOME", href: "/", visible: true, openInNewTab: false },
  { id: "menu", label: "MENU", href: "/menu", visible: true, openInNewTab: false },
  { id: "about", label: "ABOUT US", href: "/about", visible: true, openInNewTab: false },
  { id: "locate", label: "LOCATE US", href: "/locate-us", visible: true, openInNewTab: false },
  { id: "contact", label: "CONNECT WITH US", href: "/contact", visible: true, openInNewTab: false },
  { id: "services", label: "OUR SERVICES", href: "/services", visible: true, openInNewTab: false },
  { id: "checkout", label: "ORDER NOW", href: "/checkout", visible: true, openInNewTab: false },
  { id: "reservations", label: "MAKE RESERVATIONS", href: "/reservations", visible: true, openInNewTab: false },
];

export default function AdminNavigation() {
  const [links, setLinks] = useState<NavLink[]>(defaultLinks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editHref, setEditHref] = useState("");
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newHref, setNewHref] = useState("");

  const startEdit = (link: NavLink) => {
    setEditingId(link.id);
    setEditLabel(link.label);
    setEditHref(link.href);
  };

  const saveEdit = () => {
    setLinks((prev) => prev.map((l) => l.id === editingId ? { ...l, label: editLabel, href: editHref } : l));
    setEditingId(null);
  };

  const toggleVisible = (id: string) => {
    setLinks((prev) => prev.map((l) => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const deleteLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const addLink = () => {
    if (!newLabel || !newHref) return;
    setLinks((prev) => [...prev, { id: `custom-${Date.now()}`, label: newLabel.toUpperCase(), href: newHref, visible: true, openInNewTab: false }]);
    setNewLabel("");
    setNewHref("");
    setAdding(false);
  };

  const inputCls = "bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50";

  return (
    <AdminLayout
      title="Navigation Manager"
      subtitle="Control which links appear in the hamburger menu and their order"
      actions={
        <div className="flex items-center gap-2">
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Link
          </button>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-black rounded-lg text-xs font-medium hover:bg-primary/80 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div>
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[auto_2fr_1.5fr_auto_auto] text-xs text-foreground/40 uppercase tracking-widest px-4 py-3 border-b border-white/10 gap-3">
              <span></span>
              <span>Label</span>
              <span>URL</span>
              <span>Visible</span>
              <span>Actions</span>
            </div>

            {links.map((link) => (
              <div key={link.id} className="grid grid-cols-[auto_2fr_1.5fr_auto_auto] items-center px-4 py-3 border-b border-white/5 last:border-0 gap-3 group">
                <GripVertical className="w-4 h-4 text-foreground/20 cursor-grab" />

                {editingId === link.id ? (
                  <>
                    <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className={inputCls + " w-full"} />
                    <input value={editHref} onChange={(e) => setEditHref(e.target.value)} className={inputCls + " w-full font-mono"} />
                  </>
                ) : (
                  <>
                    <span className={cn("text-sm font-medium", link.visible ? "text-foreground" : "text-foreground/30 line-through")}>{link.label}</span>
                    <span className="text-xs text-foreground/40 font-mono">{link.href}</span>
                  </>
                )}

                <button onClick={() => toggleVisible(link.id)} className="p-1.5 rounded hover:bg-white/10 transition-colors">
                  {link.visible
                    ? <Eye className="w-3.5 h-3.5 text-primary" />
                    : <EyeOff className="w-3.5 h-3.5 text-foreground/30" />
                  }
                </button>

                <div className="flex items-center gap-1">
                  {editingId === link.id ? (
                    <>
                      <button onClick={saveEdit} className="p-1.5 rounded hover:bg-emerald-400/10 text-emerald-400 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 rounded hover:bg-white/10 text-foreground/40 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(link)} className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteLink(link.id)} className="p-1.5 rounded hover:bg-red-400/10 text-foreground/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {adding && (
              <div className="grid grid-cols-[auto_2fr_1.5fr_auto_auto] items-center px-4 py-3 border-t border-white/10 gap-3 bg-primary/5">
                <GripVertical className="w-4 h-4 text-foreground/20" />
                <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="LABEL" className={inputCls + " w-full"} />
                <input value={newHref} onChange={(e) => setNewHref(e.target.value)} placeholder="/path" className={inputCls + " w-full font-mono"} />
                <span></span>
                <div className="flex items-center gap-1">
                  <button onClick={addLink} className="p-1.5 rounded bg-primary/20 text-primary hover:bg-primary/30 transition-colors"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setAdding(false)} className="p-1.5 rounded hover:bg-white/10 text-foreground/40 transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-foreground/30 mt-3 flex items-center gap-1.5">
            <GripVertical className="w-3.5 h-3.5" />
            Drag rows to reorder navigation links on the customer website.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-fit">
          <p className="text-xs font-semibold text-foreground mb-4">Navigation Preview</p>
          <div className="bg-background rounded-lg p-4 border border-white/10 space-y-3">
            {links.filter((l) => l.visible).map((link) => (
              <div key={link.id} className="text-foreground/70 text-sm font-medium tracking-widest hover:text-primary transition-colors cursor-pointer">
                {link.label}
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground/30 mt-3">This is how links appear in the hamburger menu.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
