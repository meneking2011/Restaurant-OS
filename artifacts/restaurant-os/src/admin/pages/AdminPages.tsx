import { useState } from "react";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { Eye, Plus, Save, Globe } from "lucide-react";

type PageEntry = {
  id: string;
  name: string;
  route: string;
  visible: boolean;
  showInNav: boolean;
  showInFooter: boolean;
  heroImage: string;
  bgImage: string;
};

const defaultPages: PageEntry[] = [
  { id: "home", name: "Home", route: "/", visible: true, showInNav: true, showInFooter: false, heroImage: "", bgImage: "" },
  { id: "about", name: "About Us", route: "/about", visible: true, showInNav: true, showInFooter: true, heroImage: "", bgImage: "" },
  { id: "menu", name: "Our Menu", route: "/menu", visible: true, showInNav: true, showInFooter: true, heroImage: "", bgImage: "" },
  { id: "gallery", name: "Gallery", route: "/gallery", visible: false, showInNav: false, showInFooter: true, heroImage: "", bgImage: "" },
  { id: "contact", name: "Contact", route: "/contact", visible: true, showInNav: true, showInFooter: true, heroImage: "", bgImage: "" },
  { id: "reservations", name: "Reservations", route: "/reservations", visible: true, showInNav: false, showInFooter: true, heroImage: "", bgImage: "" },
  { id: "services", name: "Our Services", route: "/services", visible: true, showInNav: false, showInFooter: true, heroImage: "", bgImage: "" },
  { id: "locate", name: "Locate Us", route: "/locate-us", visible: true, showInNav: false, showInFooter: true, heroImage: "", bgImage: "" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0", checked ? "bg-primary" : "bg-white/20")}
    >
      <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow", checked ? "translate-x-4.5" : "translate-x-0.5")} />
    </button>
  );
}

export default function AdminPages() {
  const [pages, setPages] = useState<PageEntry[]>(defaultPages);
  const [selected, setSelected] = useState<PageEntry>(defaultPages[0]);
  const [saved, setSaved] = useState(false);

  const updatePage = (id: string, data: Partial<PageEntry>) => {
    setPages((prev) => prev.map((p) => p.id === id ? { ...p, ...data } : p));
    if (selected.id === id) setSelected((s) => ({ ...s, ...data }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AdminLayout
      title="Website Pages Manager"
      subtitle="Control page visibility, routes, and display settings"
      actions={
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Page
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors">
            <Eye className="w-3.5 h-3.5" /> Preview Website
          </a>
          <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-black rounded-lg text-xs font-medium hover:bg-primary/80 transition-colors">
            <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_280px] gap-5">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 h-fit">
          <p className="text-xs text-foreground/40 uppercase tracking-widest px-2 mb-2">All Website Pages</p>
          <div className="space-y-0.5">
            {pages.map((page) => (
              <div
                key={page.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                  selected.id === page.id
                    ? "bg-primary/15 text-primary"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                )}
                onClick={() => setSelected(page)}
              >
                <span className="text-sm">{page.name}</span>
                <Toggle
                  checked={page.visible}
                  onChange={() => updatePage(page.id, { visible: !page.visible })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Selected Page Settings: {selected.name}</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Page Name</label>
              <input
                value={selected.name}
                onChange={(e) => updatePage(selected.id, { name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">URL Route</label>
              <input
                value={selected.route}
                onChange={(e) => updatePage(selected.id, { route: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-foreground/50 mb-2 block">Hero Image URL</label>
              <input
                value={selected.heroImage}
                onChange={(e) => updatePage(selected.id, { heroImage: e.target.value })}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-2 block">Background Image URL</label>
              <input
                value={selected.bgImage}
                onChange={(e) => updatePage(selected.id, { bgImage: e.target.value })}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <p className="text-xs text-foreground/40 uppercase tracking-widest">Page Visibility</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Toggle checked={selected.visible} onChange={() => updatePage(selected.id, { visible: !selected.visible })} />
              <span className="text-sm text-foreground/70">Page is live and visible to visitors</span>
            </label>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <p className="text-xs text-foreground/40 uppercase tracking-widest">Show In</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-foreground/70 cursor-pointer">
                <input type="checkbox" checked={selected.showInNav} onChange={() => updatePage(selected.id, { showInNav: !selected.showInNav })} className="accent-primary" />
                Hamburger Menu
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground/70 cursor-pointer">
                <input type="checkbox" checked={selected.showInFooter} onChange={() => updatePage(selected.id, { showInFooter: !selected.showInFooter })} className="accent-primary" />
                Footer
              </label>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Active Menu Style</p>
            <div className="flex gap-3">
              {["Underline", "Dot", "Bold", "Highlight"].map((style) => (
                <button key={style} className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 text-foreground/60 hover:bg-white/10 transition-colors">
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-fit">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-semibold text-foreground">Live Page Preview</p>
          </div>
          <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40 mb-3" style={{ height: 200 }}>
            <iframe
              src={selected.route !== "/gallery" ? selected.route : "/about"}
              className="w-full h-full pointer-events-none"
              style={{ transform: "scale(0.45)", transformOrigin: "top left", width: "222%", height: "222%" }}
              title="Page preview"
            />
          </div>
          <a
            href={selected.route}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-foreground/60 hover:text-foreground transition-colors"
          >
            Open Preview
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
