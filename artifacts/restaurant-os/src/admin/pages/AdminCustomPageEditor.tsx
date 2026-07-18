import { useState, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { useRestaurantStore } from "@/store/restaurantStore";
import { CustomPageSection } from "@/types/restaurant";
import {
  Save, Globe, Trash2, ChevronDown, ChevronUp, Upload, ArrowLeft,
  Plus, ExternalLink, Eye, EyeOff,
} from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";

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

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/40";

function SectionEditor({
  section, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  section: CustomPageSection;
  onUpdate: (data: Partial<CustomPageSection>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate({ imageUrl: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const typeLabels: Record<CustomPageSection["type"], string> = {
    "hero": "Hero Banner", "text": "Text Block", "cta": "Call to Action", "image-text": "Image + Text",
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex flex-col gap-0.5 shrink-0">
          <button disabled={isFirst} onClick={onMoveUp} className="p-0.5 text-foreground/30 hover:text-foreground disabled:opacity-20 transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
          <button disabled={isLast} onClick={onMoveDown} className="p-0.5 text-foreground/30 hover:text-foreground disabled:opacity-20 transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
        </div>
        <button onClick={() => setExpanded((v) => !v)} className="flex-1 text-left">
          <p className="text-sm font-medium text-foreground">{typeLabels[section.type]}</p>
          {!expanded && section.heading && <p className="text-xs text-foreground/40 truncate">{section.heading}</p>}
        </button>
        <button onClick={onDelete} className="p-1 rounded hover:bg-red-400/10 text-foreground/30 hover:text-red-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {(section.type === "hero" || section.type === "text" || section.type === "image-text") && (
            <>
              <div>
                <label className="text-xs text-foreground/50 mb-1 block">{section.type === "hero" ? "Main Heading" : "Section Heading"}</label>
                <input className={inputCls} value={section.heading ?? ""} onChange={(e) => onUpdate({ heading: e.target.value })} placeholder="Heading text" />
              </div>
              {section.type === "hero" && (
                <div>
                  <label className="text-xs text-foreground/50 mb-1 block">Subheading</label>
                  <input className={inputCls} value={section.subheading ?? ""} onChange={(e) => onUpdate({ subheading: e.target.value })} placeholder="Subheading / tagline" />
                </div>
              )}
              <div>
                <label className="text-xs text-foreground/50 mb-1 block">Body Text</label>
                <textarea rows={3} className={inputCls + " resize-none"} value={section.body ?? ""} onChange={(e) => onUpdate({ body: e.target.value })} placeholder="Paragraph text" />
              </div>
            </>
          )}
          {section.type === "cta" && (
            <>
              <div>
                <label className="text-xs text-foreground/50 mb-1 block">CTA Heading</label>
                <input className={inputCls} value={section.heading ?? ""} onChange={(e) => onUpdate({ heading: e.target.value })} placeholder="Call-to-action heading" />
              </div>
              <div>
                <label className="text-xs text-foreground/50 mb-1 block">Body Text</label>
                <textarea rows={2} className={inputCls + " resize-none"} value={section.body ?? ""} onChange={(e) => onUpdate({ body: e.target.value })} placeholder="Supporting text" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-foreground/50 mb-1 block">Button Text</label>
                  <input className={inputCls} value={section.ctaText ?? ""} onChange={(e) => onUpdate({ ctaText: e.target.value })} placeholder="e.g. Book a Table" />
                </div>
                <div>
                  <label className="text-xs text-foreground/50 mb-1 block">Button Link</label>
                  <input className={inputCls} value={section.ctaLink ?? ""} onChange={(e) => onUpdate({ ctaLink: e.target.value })} placeholder="/reservations" />
                </div>
              </div>
            </>
          )}
          {(section.type === "hero" || section.type === "image-text") && (
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Section Image (optional)</label>
              <div className="flex gap-2">
                <input className={inputCls} value={section.imageUrl ?? ""} onChange={(e) => onUpdate({ imageUrl: e.target.value })} placeholder="https://... or upload below" />
                <button type="button" onClick={() => fileRef.current?.click()} className="shrink-0 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/10 transition-colors" title="Upload image">
                  <Upload className="w-4 h-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </div>
              {section.imageUrl && (
                <div className="flex items-center gap-2 mt-2">
                  <img src={section.imageUrl} alt="" className="w-16 h-10 object-cover rounded" />
                  <p className="text-[10px] text-foreground/30">Recommended: 1200×600px (landscape)</p>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="text-xs text-foreground/50 mb-1 block">Text Alignment</label>
            <div className="flex gap-1.5">
              {(["left", "center", "right"] as const).map((a) => (
                <button key={a} type="button" onClick={() => onUpdate({ alignment: a })} className={cn("px-3 py-1 text-xs rounded border capitalize transition-colors", section.alignment === a ? "bg-primary/15 text-primary border-primary/30" : "bg-white/5 text-foreground/40 border-white/10 hover:bg-white/10")}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCustomPageEditor() {
  const params = useParams<{ pageId: string }>();
  const [, navigate] = useLocation();
  const { customPages, updateCustomPage, deleteCustomPage, config } = useRestaurantStore();
  const page = customPages.find((p) => p.id === params.pageId);

  const [name, setName]               = useState(page?.name ?? "");
  const [slug, setSlug]               = useState((page?.slug ?? "").replace(/^\//, ""));
  const [showInNav, setShowInNav]     = useState(page?.showInNav ?? false);
  const [showInFooter, setShowInFooter] = useState(page?.showInFooter ?? false);
  const [visible, setVisible]         = useState(page?.visible ?? true);
  const [externalUrlEnabled, setExternalUrlEnabled] = useState(page?.externalUrlEnabled ?? false);
  const [externalUrl, setExternalUrl] = useState(page?.externalUrl ?? "");
  const [sections, setSections]       = useState<CustomPageSection[]>(page?.sections ?? []);
  const [saved, setSaved]             = useState(false);
  const [deleteOpen, setDeleteOpen]   = useState(false);

  const autoSlug = (n: string) => n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slug || slug === autoSlug(name)) setSlug(autoSlug(v));
  };

  const addSection = (type: CustomPageSection["type"]) =>
    setSections((prev) => [...prev, { id: `sec-${Date.now()}-${Math.random().toString(36).slice(2)}`, type, alignment: "center" }]);

  const updateSection = (id: string, data: Partial<CustomPageSection>) =>
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, ...data } : s));

  const deleteSection = (id: string) => setSections((prev) => prev.filter((s) => s.id !== id));

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => { const a = [...prev]; [a[index - 1], a[index]] = [a[index], a[index - 1]]; return a; });
  };
  const moveDown = (index: number) => {
    setSections((prev) => {
      if (index >= prev.length - 1) return prev;
      const a = [...prev]; [a[index], a[index + 1]] = [a[index + 1], a[index]]; return a;
    });
  };

  const handleSave = () => {
    if (!page) return;
    updateCustomPage(page.id, {
      name,
      slug: `/${slug}`,
      showInNav,
      showInFooter,
      visible,
      externalUrlEnabled,
      externalUrl: externalUrlEnabled ? externalUrl : "",
      sections,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!page) {
    return (
      <AdminLayout title="Page Not Found" subtitle="This custom page does not exist.">
        <button onClick={() => navigate("/admin/pages")} className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Pages
        </button>
      </AdminLayout>
    );
  }

  const hostname = typeof window !== "undefined" ? window.location.hostname : config.name.toLowerCase().replace(/\s+/g, "") + ".com";

  return (
    <AdminLayout
      title={`Edit: ${page.name}`}
      subtitle={`${hostname}/${slug || "..."}`}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/admin/pages")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Pages
          </button>
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" /> Preview
          </a>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/10 border border-red-400/20 text-red-400 rounded-lg text-xs hover:bg-red-400/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Page
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      }
    >
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(false)}
        title="Delete this page?"
        description={`"${page.name}" will be permanently removed from your website.`}
        onConfirm={() => { deleteCustomPage(page.id); navigate("/admin/pages"); }}
      />

      <div className="space-y-6 max-w-2xl">
        {/* Page Settings */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
          <p className="text-xs text-foreground/40 uppercase tracking-widest">Page Settings</p>

          <div>
            <label className="text-xs text-foreground/50 mb-1.5 block">Page Name *</label>
            <input className={inputCls} value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Our Story" />
          </div>

          <div>
            <label className="text-xs text-foreground/50 mb-1 block">URL Slug</label>
            <div className="flex items-center gap-0">
              <span className="bg-white/5 border border-white/10 border-r-0 rounded-l-lg px-3 py-2 text-sm text-foreground/40 whitespace-nowrap">{hostname}/</span>
              <input
                className={inputCls + " rounded-l-none"}
                value={slug}
                onChange={(e) => setSlug(autoSlug(e.target.value))}
                placeholder="page-url"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <Toggle checked={showInNav} onChange={() => setShowInNav((v) => !v)} />
              <span className="text-sm text-foreground/70">Show in Navigation Menu</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <Toggle checked={showInFooter} onChange={() => setShowInFooter((v) => !v)} />
              <span className="text-sm text-foreground/70">Show in Footer</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <Toggle checked={visible} onChange={() => setVisible((v) => !v)} />
              <span className="text-sm text-foreground/70">Page Visible</span>
            </label>
          </div>

          {/* External redirect */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <Toggle checked={externalUrlEnabled} onChange={() => setExternalUrlEnabled((v) => !v)} />
              <div>
                <span className="text-sm text-foreground/70">Redirect to external website</span>
                <p className="text-[11px] text-foreground/40">Visitors to this page will be sent to another URL entirely.</p>
              </div>
            </label>
            {externalUrlEnabled && (
              <div>
                <label className="text-xs text-foreground/50 mb-1 block">External Website URL</label>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-foreground/30 shrink-0" />
                  <input
                    className={inputCls}
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://example.com"
                    type="url"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Sections (only shown when not an external redirect) */}
        {!externalUrlEnabled && (
          <div className="space-y-4">
            <p className="text-xs text-foreground/40 uppercase tracking-widest">Page Content</p>

            {sections.length === 0 && (
              <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-8 text-center">
                <p className="text-sm text-foreground/40 mb-4">No content sections yet.</p>
              </div>
            )}

            <div className="space-y-3">
              {sections.map((section, i) => (
                <SectionEditor
                  key={section.id}
                  section={section}
                  onUpdate={(data) => updateSection(section.id, data)}
                  onDelete={() => deleteSection(section.id)}
                  onMoveUp={() => moveUp(i)}
                  onMoveDown={() => moveDown(i)}
                  isFirst={i === 0}
                  isLast={i === sections.length - 1}
                />
              ))}
            </div>

            <div>
              <p className="text-xs text-foreground/40 uppercase tracking-widest mb-2">Add Section</p>
              <div className="flex gap-2 flex-wrap">
                {([
                  { type: "hero" as const, label: "Hero Banner" },
                  { type: "text" as const, label: "Text Block" },
                  { type: "image-text" as const, label: "Image + Text" },
                  { type: "cta" as const, label: "CTA Button" },
                ]).map(({ type, label }) => (
                  <button
                    key={type}
                    onClick={() => addSection(type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 hover:text-foreground transition-colors"
                  >
                    <Plus className="w-3 h-3" /> {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Save at bottom too */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
