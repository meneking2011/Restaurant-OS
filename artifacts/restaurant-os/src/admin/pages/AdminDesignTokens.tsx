import { useRef, useState } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import {
  Palette, Type, MousePointer, LayoutGrid, Ruler, Sparkles, Image as ImageIcon,
  RotateCcw, X, Plus,
} from "lucide-react";
import { SiteTheme, DESIGN_TOKEN_PAGES, DesignTokenPage, SECTION_KEYS, SectionKey } from "@/types/restaurant";

type Section = "colors" | "typography" | "buttons" | "cards" | "layout" | "spacing" | "animations" | "media";

const SECTIONS: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "colors",     label: "Colors",       icon: Palette      },
  { key: "typography", label: "Typography",   icon: Type         },
  { key: "buttons",    label: "Buttons",      icon: MousePointer },
  { key: "cards",      label: "Cards",        icon: LayoutGrid   },
  { key: "layout",     label: "Layout",       icon: Ruler        },
  { key: "spacing",    label: "Spacing",      icon: Ruler        },
  { key: "animations", label: "Animations",   icon: Sparkles     },
  { key: "media",      label: "Section Media",icon: ImageIcon    },
];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50";

function ColorRow({ label, description, value, onChange }: { label: string; description?: string; value: string; onChange: (hex: string) => void }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded-lg border border-white/15 cursor-pointer bg-transparent p-0.5 shrink-0"
        title={label}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{label}</p>
        {description && <p className="text-xs text-foreground/40 mt-0.5 truncate">{description}</p>}
      </div>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => { const v = e.target.value; if (/^#([0-9a-fA-F]{0,6})$/.test(v)) onChange(v); }}
        className="w-24 text-xs font-mono bg-white/5 border border-white/10 rounded px-2 py-1.5 text-foreground/70 focus:outline-none focus:border-primary/40"
        placeholder="#000000"
        maxLength={7}
      />
    </div>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <label className="text-xs text-foreground/60 mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function SliderRow({ label, value, min, max, step = 1, suffix = "", onChange }: { label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (v: number) => void }) {
  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <label className="text-xs text-foreground/60 mb-1.5 block">{label} ({value}{suffix})</label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
    </div>
  );
}

function ToggleRow({ label, sub, checked, onChange }: { label: string; sub?: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {sub && <p className="text-xs text-foreground/40 mt-0.5">{sub}</p>}
      </div>
      <button
        type="button"
        onClick={onChange}
        className={cn("relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0", checked ? "bg-primary" : "bg-white/20")}
      >
        <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow", checked ? "translate-x-4.5" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

export default function AdminDesignTokens() {
  const {
    siteTheme, updateSiteTheme,
    themeOverrides, updateThemeOverride, clearThemeOverride,
    sectionMedia, updateSectionMedia,
  } = useRestaurantStore();

  const [activeSection, setActiveSection] = useState<Section>("colors");
  const [scope, setScope] = useState<"global" | DesignTokenPage>("global");
  const [saved, setSaved] = useState(false);
  const [activeMediaSection, setActiveMediaSection] = useState<SectionKey>("hero");
  const newImageRef = useRef<HTMLInputElement>(null);

  const isGlobal = scope === "global";
  const effective: SiteTheme = isGlobal ? siteTheme : { ...siteTheme, ...(themeOverrides[scope] ?? {}) };
  const hasOverride = !isGlobal && Object.keys(themeOverrides[scope] ?? {}).length > 0;

  const setToken = (patch: Partial<SiteTheme>) => {
    if (isGlobal) updateSiteTheme(patch);
    else updateThemeOverride(scope, patch);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const media = sectionMedia[activeMediaSection];

  const renderPanel = () => {
    switch (activeSection) {
      case "colors":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Color System</h3>
            <p className="text-xs text-foreground/40 mb-5">Changes apply live across the site instantly{!isGlobal ? ` — currently scoped to the ${DESIGN_TOKEN_PAGES.find(p => p.key === scope)?.label} page only.` : "."}</p>
            <ColorRow label="Primary" description="Highlights, active states, links by default" value={effective.primaryHex} onChange={(v) => setToken({ primaryHex: v })} />
            <ColorRow label="Secondary" description="Secondary buttons, badges" value={effective.secondaryHex} onChange={(v) => setToken({ secondaryHex: v })} />
            <ColorRow label="Accent" description="Subtle accents and hover backgrounds" value={effective.accentHex} onChange={(v) => setToken({ accentHex: v })} />
            <ColorRow label="Background" description="Page background" value={effective.backgroundHex} onChange={(v) => setToken({ backgroundHex: v })} />
            <ColorRow label="Surface" description="Panels and muted surfaces" value={effective.surfaceHex} onChange={(v) => setToken({ surfaceHex: v })} />
            <ColorRow label="Cards" description="Card backgrounds" value={effective.cardBgHex} onChange={(v) => setToken({ cardBgHex: v })} />
            <ColorRow label="Borders" description="Dividers and outlines" value={effective.borderHex} onChange={(v) => setToken({ borderHex: v })} />
            <ColorRow label="Buttons" description="Primary button background" value={effective.buttonBgHex} onChange={(v) => setToken({ buttonBgHex: v })} />
            <ColorRow label="Links" description="Links and focus rings" value={effective.linkColorHex} onChange={(v) => setToken({ linkColorHex: v })} />
            <ColorRow label="Hover" description="Hover state for buttons" value={effective.buttonHoverHex} onChange={(v) => setToken({ buttonHoverHex: v })} />
            <ColorRow label="Footer" description="Footer background" value={effective.footerBgHex} onChange={(v) => setToken({ footerBgHex: v })} />
            <ColorRow label="Text Primary" description="Main body/heading text" value={effective.foregroundHex} onChange={(v) => setToken({ foregroundHex: v })} />
            <ColorRow label="Text Secondary" description="Muted/secondary text" value={effective.mutedFgHex} onChange={(v) => setToken({ mutedFgHex: v })} />
          </div>
        );
      case "typography":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Typography</h3>
            <p className="text-xs text-foreground/40 mb-5">Fonts and sizing applied across the site.</p>
            <div>
              <label className="text-xs text-foreground/60 mb-1.5 block">Heading Font</label>
              <input value={effective.fontHeading} onChange={(e) => setToken({ fontHeading: e.target.value })} className={inputCls} />
            </div>
            <div className="mt-3">
              <label className="text-xs text-foreground/60 mb-1.5 block">Body Font</label>
              <input value={effective.fontBody} onChange={(e) => setToken({ fontBody: e.target.value })} className={inputCls} />
            </div>
            <SliderRow label="Base Font Size" value={effective.baseFontSizePx} min={13} max={20} suffix="px" onChange={(v) => setToken({ baseFontSizePx: v })} />
            <SelectRow
              label="Heading Weight"
              value={effective.headingWeight}
              options={[{ value: "normal", label: "Normal" }, { value: "medium", label: "Medium" }, { value: "semibold", label: "Semibold" }, { value: "bold", label: "Bold" }]}
              onChange={(v) => setToken({ headingWeight: v as SiteTheme["headingWeight"] })}
            />
          </div>
        );
      case "buttons":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Buttons</h3>
            <p className="text-xs text-foreground/40 mb-5">Shape, border and hover behavior for buttons site-wide.</p>
            <SelectRow
              label="Button Shape"
              value={effective.buttonStyle}
              options={[{ value: "rounded", label: "Rounded" }, { value: "sharp", label: "Sharp" }, { value: "pill", label: "Pill" }]}
              onChange={(v) => setToken({ buttonStyle: v as SiteTheme["buttonStyle"] })}
            />
            <SliderRow label="Border Width" value={effective.buttonBorderWidth} min={0} max={4} suffix="px" onChange={(v) => setToken({ buttonBorderWidth: v })} />
            <ColorRow label="Button Text Color" value={effective.buttonTextColorHex} onChange={(v) => setToken({ buttonTextColorHex: v })} />
            <div className="flex gap-3 flex-wrap mt-4 pt-4 border-t border-white/5">
              <button
                className="px-6 py-2.5 text-sm font-semibold tracking-widest uppercase transition-colors"
                style={{
                  backgroundColor: effective.buttonBgHex,
                  color: effective.buttonTextColorHex,
                  borderRadius: effective.buttonStyle === "pill" ? "9999px" : effective.buttonStyle === "sharp" ? "0px" : `${effective.borderRadius}px`,
                  borderWidth: effective.buttonBorderWidth || 0,
                  borderStyle: "solid",
                  borderColor: effective.buttonBgHex,
                }}
              >
                Preview Button
              </button>
            </div>
          </div>
        );
      case "cards":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Cards</h3>
            <p className="text-xs text-foreground/40 mb-5">Independent radius and shadow just for card-style surfaces.</p>
            <SliderRow label="Card Radius" value={effective.cardRadius} min={0} max={32} suffix="px" onChange={(v) => setToken({ cardRadius: v })} />
            <SliderRow label="Card Shadow Intensity" value={effective.cardShadowIntensity} min={0} max={100} suffix="%" onChange={(v) => setToken({ cardShadowIntensity: v })} />
            <div
              className="mt-4 p-6 w-48"
              style={{
                backgroundColor: effective.cardBgHex,
                borderRadius: `${effective.cardRadius}px`,
                boxShadow: `0 8px 24px -4px rgba(0,0,0,${Math.min(1, effective.cardShadowIntensity / 100)})`,
                border: `1px solid ${effective.borderHex}`,
              }}
            >
              <p className="text-xs" style={{ color: effective.foregroundHex }}>Card preview</p>
            </div>
          </div>
        );
      case "layout":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Layout</h3>
            <SelectRow
              label="Container Width"
              value={effective.containerWidth}
              options={[{ value: "narrow", label: "Narrow" }, { value: "default", label: "Default" }, { value: "wide", label: "Wide" }]}
              onChange={(v) => setToken({ containerWidth: v as SiteTheme["containerWidth"] })}
            />
            <SliderRow label="Global Border Radius" value={effective.borderRadius} min={0} max={32} suffix="px" onChange={(v) => setToken({ borderRadius: v })} />
          </div>
        );
      case "spacing":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Spacing</h3>
            <SelectRow
              label="Section Spacing"
              value={effective.sectionSpacing}
              options={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }, { value: "spacious", label: "Spacious" }]}
              onChange={(v) => setToken({ sectionSpacing: v as SiteTheme["sectionSpacing"] })}
            />
          </div>
        );
      case "animations":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Animations</h3>
            <ToggleRow label="Enable Animations" sub="Fade/slide-in effects across the site" checked={effective.animationsEnabled} onChange={() => setToken({ animationsEnabled: !effective.animationsEnabled })} />
            <SelectRow
              label="Animation Speed"
              value={effective.animationSpeed}
              options={[{ value: "slow", label: "Slow" }, { value: "normal", label: "Normal" }, { value: "fast", label: "Fast" }]}
              onChange={(v) => setToken({ animationSpeed: v as SiteTheme["animationSpeed"] })}
            />
          </div>
        );
      case "media":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Section Media</h3>
            <p className="text-xs text-foreground/40 mb-5">Independent image manager for each website section — background image, overlay and gallery images.</p>
            <div className="flex gap-1 flex-wrap mb-5">
              {SECTION_KEYS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveMediaSection(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs transition-colors",
                    activeMediaSection === key ? "bg-primary/15 text-primary font-medium" : "text-foreground/50 hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs text-foreground/60 mb-1.5 block">Background Image URL</label>
                <input
                  value={media.backgroundImage}
                  onChange={(e) => updateSectionMedia(activeMediaSection, { backgroundImage: e.target.value })}
                  placeholder="https://..."
                  className={inputCls}
                />
              </div>

              {media.backgroundImage && (
                <div className="relative h-32 rounded-lg overflow-hidden border border-white/10">
                  <img src={media.backgroundImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ backgroundColor: media.overlayColor, opacity: media.overlayOpacity / 100 }} />
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <ColorRow label="Overlay Color" value={media.overlayColor} onChange={(v) => updateSectionMedia(activeMediaSection, { overlayColor: v })} />
              </div>
              <SliderRow label="Overlay Opacity" value={media.overlayOpacity} min={0} max={100} suffix="%" onChange={(v) => updateSectionMedia(activeMediaSection, { overlayOpacity: v })} />

              <ToggleRow
                label="Use Solid Background Color Instead"
                sub="Falls back to a flat color instead of the image"
                checked={media.useBackgroundColor}
                onChange={() => updateSectionMedia(activeMediaSection, { useBackgroundColor: !media.useBackgroundColor })}
              />
              {media.useBackgroundColor && (
                <ColorRow label="Background Color" value={media.backgroundColor} onChange={(v) => updateSectionMedia(activeMediaSection, { backgroundColor: v })} />
              )}

              <div className="pt-3 border-t border-white/10">
                <label className="text-xs text-foreground/60 mb-2 block">Extra Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {media.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 group">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => updateSectionMedia(activeMediaSection, { images: media.images.filter((_, idx) => idx !== i) })}
                        className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const url = newImageRef.current?.value.trim();
                      if (url) {
                        updateSectionMedia(activeMediaSection, { images: [...media.images, url] });
                        if (newImageRef.current) newImageRef.current.value = "";
                      }
                    }}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center hover:border-primary/40 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-foreground/40" />
                  </button>
                </div>
                <input ref={newImageRef} placeholder="Paste image URL and click +" className={inputCls} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AdminLayout
      title="Design Tokens"
      subtitle="Control colors, typography, buttons, cards and layout across your entire website"
      actions={saved ? <span className="text-xs text-emerald-400">Applied</span> : undefined}
    >
      {activeSection !== "media" && (
        <div className="flex items-center gap-2 flex-wrap mb-5">
          <span className="text-xs text-foreground/40 mr-1">Scope:</span>
          <button
            onClick={() => setScope("global")}
            className={cn("px-3 py-1.5 rounded-lg text-xs transition-colors", isGlobal ? "bg-primary/15 text-primary font-medium" : "text-foreground/50 hover:text-foreground hover:bg-white/5")}
          >
            Global (Apply Everywhere)
          </button>
          {DESIGN_TOKEN_PAGES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setScope(key)}
              className={cn("px-3 py-1.5 rounded-lg text-xs transition-colors", scope === key ? "bg-primary/15 text-primary font-medium" : "text-foreground/50 hover:text-foreground hover:bg-white/5")}
            >
              {label}
            </button>
          ))}
          {!isGlobal && (
            <button
              onClick={() => clearThemeOverride(scope)}
              disabled={!hasOverride}
              className="ml-1 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-foreground/50 hover:text-foreground hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset to Global
            </button>
          )}
        </div>
      )}

      <div className="flex gap-1 flex-wrap mb-6 border-b border-white/10 pb-3">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs transition-colors",
              activeSection === key ? "bg-primary/15 text-primary font-medium" : "text-foreground/50 hover:text-foreground hover:bg-white/5"
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="max-w-2xl">{renderPanel()}</div>
    </AdminLayout>
  );
}
