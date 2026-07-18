import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { useRestaurantStore } from "@/store/restaurantStore";
import { CustomPage, CustomPageSection } from "@/types/restaurant";
import {
  Plus, Globe, Trash2, X, Eye, EyeOff,
  ChevronDown, ChevronUp, Upload, Pencil, ExternalLink,
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

type WizardStep = "name" | "sections" | "review";

function SectionEditor({
  section,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
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
    "hero":       "Hero Banner",
    "text":       "Text Block",
    "cta":        "Call to Action",
    "image-text": "Image + Text",
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex flex-col gap-0.5 shrink-0">
          <button disabled={isFirst}  onClick={onMoveUp}   className="p-0.5 text-foreground/30 hover:text-foreground disabled:opacity-20 transition-colors"><ChevronUp   className="w-3.5 h-3.5" /></button>
          <button disabled={isLast}   onClick={onMoveDown} className="p-0.5 text-foreground/30 hover:text-foreground disabled:opacity-20 transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
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
                <label className="text-xs text-foreground/50 mb-1 block">
                  {section.type === "hero" ? "Main Heading" : "Section Heading"}
                </label>
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

          {(section.type === "cta") && (
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

          {/* Image upload for hero/image-text */}
          {(section.type === "hero" || section.type === "image-text") && (
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Section Image (optional)</label>
              <div className="flex gap-2">
                <input className={inputCls} value={section.imageUrl ?? ""} onChange={(e) => onUpdate({ imageUrl: e.target.value })} placeholder="https://... or upload below" />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="shrink-0 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-foreground/50 hover:text-foreground hover:bg-white/10 transition-colors"
                  title="Upload image"
                >
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
              {(["left","center","right"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => onUpdate({ alignment: a })}
                  className={cn("px-3 py-1 text-xs rounded border capitalize transition-colors", section.alignment === a ? "bg-primary/15 text-primary border-primary/30" : "bg-white/5 text-foreground/40 border-white/10 hover:bg-white/10")}
                >
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

function NewPageWizard({ onClose, onSave }: { onClose: () => void; onSave: (page: Omit<CustomPage, "id" | "createdAt">) => void }) {
  const [step, setStep]         = useState<WizardStep>("name");
  const [pageName, setPageName] = useState("");
  const [slug, setSlug]         = useState("");
  const [showInNav, setShowInNav]       = useState(false);
  const [showInFooter, setShowInFooter] = useState(false);
  const [externalUrlEnabled, setExternalUrlEnabled] = useState(false);
  const [externalUrl, setExternalUrl]               = useState("");
  const [sections, setSections] = useState<CustomPageSection[]>([
    { id: `sec-${Date.now()}`, type: "hero", heading: "", subheading: "", body: "", alignment: "center" },
  ]);

  const hostname = typeof window !== "undefined" ? window.location.hostname : "yourdomain.com";

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleNameChange = (v: string) => {
    setPageName(v);
    if (!slug || slug === autoSlug(pageName)) setSlug(autoSlug(v));
  };

  const addSection = (type: CustomPageSection["type"]) => {
    setSections((prev) => [...prev, { id: `sec-${Date.now()}-${Math.random().toString(36).slice(2)}`, type, alignment: "center" }]);
  };

  const updateSection = (id: string, data: Partial<CustomPageSection>) => {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSection = (id: string) => setSections((prev) => prev.filter((s) => s.id !== id));

  const moveUp = (index: number) => {
    if (index === 0) return;
    setSections((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  };

  const moveDown = (index: number) => {
    setSections((prev) => {
      if (index >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  };

  const handleSave = () => {
    onSave({
      name: pageName,
      slug: `/${slug}`,
      visible: true,
      showInNav,
      showInFooter,
      externalUrlEnabled,
      externalUrl: externalUrlEnabled ? externalUrl : "",
      sections,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[hsl(15,13%,9%)] border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            {(["name", "sections", "review"] as WizardStep[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-white/10" />}
                <div className={cn("flex items-center gap-1.5 text-xs", step === s ? "text-primary" : "text-foreground/40")}>
                  <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold", step === s ? "border-primary text-primary" : "border-white/20")}>
                    {i + 1}
                  </div>
                  <span className="hidden sm:block capitalize">
                    {s === "name" ? "Page Info" : s === "sections" ? "Add Content" : "Review"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === "name" && (
            <>
              <h2 className="text-sm font-semibold text-foreground">1. Page Information</h2>
              <div>
                <label className="text-xs text-foreground/50 mb-1.5 block">Page Name *</label>
                <input
                  className={inputCls}
                  value={pageName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Our Story, Private Events, FAQs"
                />
              </div>
              <div>
                <label className="text-xs text-foreground/50 mb-1 block">URL Slug</label>
                <div className="flex items-center">
                  <span className="bg-white/5 border border-white/10 border-r-0 rounded-l-lg px-3 py-2 text-sm text-foreground/40 whitespace-nowrap truncate max-w-[180px]">{hostname}/</span>
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
                  <span className="text-sm text-foreground/70">Show in Navigation</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <Toggle checked={showInFooter} onChange={() => setShowInFooter((v) => !v)} />
                  <span className="text-sm text-foreground/70">Show in Footer</span>
                </label>
              </div>
              {/* External redirect option */}
              <div className="border-t border-white/10 pt-4 space-y-3">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <Toggle checked={externalUrlEnabled} onChange={() => setExternalUrlEnabled((v) => !v)} />
                  <div>
                    <span className="text-sm text-foreground/70">Redirect to an external website</span>
                    <p className="text-[11px] text-foreground/40 mt-0.5">Visitors clicking this page will be sent to another website entirely.</p>
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
            </>
          )}

          {step === "sections" && (
            <>
              <h2 className="text-sm font-semibold text-foreground">2. Build Your Page Content</h2>
              <p className="text-xs text-foreground/40">Add sections to build your page. Use the theme fonts and colors set in your Theme settings.</p>

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
                    { type: "hero"        as const, label: "Hero Banner" },
                    { type: "text"        as const, label: "Text Block"  },
                    { type: "image-text"  as const, label: "Image + Text"},
                    { type: "cta"         as const, label: "CTA Button"  },
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
            </>
          )}

          {step === "review" && (
            <>
              <h2 className="text-sm font-semibold text-foreground">3. Review & Publish</h2>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/50">Page Name</span>
                  <span className="text-foreground font-medium">{pageName || "—"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/50">URL</span>
                  <span className="text-foreground font-mono">{hostname}/{slug || "..."}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/50">Navigation</span>
                  <span className="text-foreground">{showInNav ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-foreground/50">Footer</span>
                  <span className="text-foreground">{showInFooter ? "Yes" : "No"}</span>
                </div>
                {externalUrlEnabled ? (
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground/50">Redirect to</span>
                    <span className="text-blue-400 font-mono truncate max-w-[200px]">{externalUrl || "—"}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground/50">Sections</span>
                    <span className="text-foreground">{sections.length}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {sections.map((s, i) => (
                  <div key={s.id} className="text-xs text-foreground/60 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-foreground/50 flex items-center justify-center text-[10px]">{i + 1}</span>
                    <span>{s.type === "hero" ? "Hero Banner" : s.type === "text" ? "Text Block" : s.type === "image-text" ? "Image + Text" : "CTA"}</span>
                    {s.heading && <span className="text-foreground/30 truncate">— {s.heading}</span>}
                  </div>
                ))}
              </div>
              {!pageName && <p className="text-red-400 text-xs">Please enter a page name before publishing.</p>}
            </>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 shrink-0">
          <button
            onClick={() => {
              if (step === "sections") setStep("name");
              else if (step === "review") setStep("sections");
              else onClose();
            }}
            className="px-4 py-2 bg-white/5 border border-white/10 text-foreground/60 rounded-lg text-sm hover:bg-white/10 transition-colors"
          >
            {step === "name" ? "Cancel" : "Back"}
          </button>
          {step === "review" ? (
            <button
              onClick={handleSave}
              disabled={!pageName}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Globe className="w-3.5 h-3.5" /> Publish Page
            </button>
          ) : (
            <button
              onClick={() => {
                if (step === "name") setStep("sections");
                else if (step === "sections") setStep("review");
              }}
              disabled={step === "name" && !pageName}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPages() {
  const { customPages, addCustomPage, updateCustomPage, deleteCustomPage } = useRestaurantStore();
  const [, navigate] = useLocation();
  const [showWizard, setShowWizard]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const systemPages = [
    { id: "home",         name: "Home",            route: "/",            visible: true },
    { id: "menu",         name: "Our Menu",         route: "/menu",        visible: true },
    { id: "about",        name: "About Us",         route: "/about",       visible: true },
    { id: "services",     name: "Our Services",     route: "/services",    visible: true },
    { id: "reservations", name: "Reservations",     route: "/reservations",visible: true },
    { id: "contact",      name: "Contact",          route: "/contact",     visible: true },
    { id: "locate-us",    name: "Locate Us",        route: "/locate-us",   visible: true },
    { id: "checkout",     name: "Order / Checkout", route: "/checkout",    visible: true },
    { id: "gallery",      name: "Gallery",          route: "/gallery",     visible: false },
  ];

  return (
    <AdminLayout
      title="Website Pages"
      subtitle={`${systemPages.length} system pages · ${customPages.length} custom page${customPages.length !== 1 ? "s" : ""}`}
      actions={
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Preview Site
          </a>
          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Page
          </button>
        </div>
      }
    >
      {showWizard && (
        <NewPageWizard
          onClose={() => setShowWizard(false)}
          onSave={(page) => addCustomPage(page)}
        />
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete custom page?"
        description="This will permanently remove this page from your website."
        onConfirm={() => { if (deleteTarget) deleteCustomPage(deleteTarget); setDeleteTarget(null); }}
      />

      {/* System Pages */}
      <div className="mb-6">
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">System Pages</p>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
          {systemPages.map((page) => (
            <div key={page.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{page.name}</p>
                <p className="text-xs text-foreground/40 font-mono">{page.route}</p>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-foreground/30 border border-white/10 px-2 py-0.5 rounded">System</span>
              <a href={page.route} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors">
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Pages */}
      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">
          Custom Pages
          {customPages.length === 0 && <span className="ml-2 font-normal normal-case text-foreground/30">— none yet. Click "New Page" to create one.</span>}
        </p>

        {customPages.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden divide-y divide-white/5">
            {customPages.map((page) => (
              <div key={page.id} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{page.name}</p>
                  <p className="text-xs text-foreground/40 font-mono">{page.slug}</p>
                  <p className="text-[10px] text-foreground/30 mt-0.5">
                    {page.externalUrlEnabled
                      ? <span className="text-blue-400/70">↗ redirects to external URL</span>
                      : `${page.sections.length} section${page.sections.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {page.showInNav    && <span className="text-[10px] text-blue-400  bg-blue-400/10  border border-blue-400/20  px-1.5 py-0.5 rounded">Nav</span>}
                    {page.showInFooter && <span className="text-[10px] text-purple-400 bg-purple-400/10 border border-purple-400/20 px-1.5 py-0.5 rounded">Footer</span>}
                  </div>
                  <button
                    onClick={() => updateCustomPage(page.id, { visible: !page.visible })}
                    className={cn("p-1.5 rounded hover:bg-white/10 transition-colors", page.visible ? "text-emerald-400" : "text-foreground/30")}
                    title={page.visible ? "Page is visible" : "Page is hidden"}
                  >
                    {page.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => navigate(`/admin/pages/${page.id}`)}
                    className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"
                    title="Edit page"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={page.externalUrlEnabled && page.externalUrl ? page.externalUrl : page.slug}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-white/10 text-foreground/40 hover:text-foreground transition-colors"
                    title="View page"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setDeleteTarget(page.id)}
                    className="p-1.5 rounded hover:bg-red-400/10 text-red-400/60 hover:text-red-400 transition-colors"
                    title="Delete page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
