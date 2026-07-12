import { useState, useRef } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { Save, Eye, RefreshCw, Palette, Type, MousePointer, ImagePlay, Sliders, Link2 } from "lucide-react";
import { hexToHsl } from "@/utils/colorUtils";

type Section = "colors" | "buttons" | "links" | "typography" | "background" | "appearance";

const SECTIONS: { key: Section; label: string; icon: React.ElementType }[] = [
  { key: "colors",     label: "Colors",      icon: Palette       },
  { key: "buttons",    label: "Buttons",      icon: MousePointer  },
  { key: "links",      label: "Links & Text", icon: Link2         },
  { key: "typography", label: "Typography",   icon: Type          },
  { key: "background", label: "Background",   icon: ImagePlay     },
  { key: "appearance", label: "Appearance",   icon: Sliders       },
];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50";

// A reusable color row: swatch picker + hex text field
function ColorRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="relative shrink-0">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-white/15 cursor-pointer bg-transparent p-0.5"
          title={label}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{label}</p>
        {description && <p className="text-xs text-foreground/40 mt-0.5 truncate">{description}</p>}
      </div>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => {
          const v = e.target.value;
          if (/^#([0-9a-fA-F]{0,6})$/.test(v)) onChange(v);
        }}
        className="w-24 text-xs font-mono bg-white/5 border border-white/10 rounded px-2 py-1.5 text-foreground/70 focus:outline-none focus:border-primary/40"
        placeholder="#000000"
        maxLength={7}
      />
    </div>
  );
}

// Live mini button preview
function ButtonPreview({ theme }: { theme: { primaryHex: string; buttonTextColorHex: string; buttonStyle: string; borderRadius: number; buttonBorderWidth: number } }) {
  const btnRadius =
    theme.buttonStyle === "pill"  ? "9999px" :
    theme.buttonStyle === "sharp" ? "0px" :
    `${theme.borderRadius}px`;

  return (
    <div className="flex gap-3 flex-wrap mt-3">
      <button
        className="px-6 py-2.5 text-sm font-semibold tracking-widest uppercase transition-transform hover:scale-105"
        style={{
          backgroundColor: theme.primaryHex,
          color: theme.buttonTextColorHex,
          borderRadius: btnRadius,
          borderWidth: theme.buttonBorderWidth ? `${theme.buttonBorderWidth}px` : 0,
          borderStyle: "solid",
          borderColor: theme.primaryHex,
        }}
      >
        Primary Button
      </button>
      <button
        className="px-6 py-2.5 text-sm font-semibold tracking-widest uppercase transition-transform hover:scale-105"
        style={{
          backgroundColor: "transparent",
          color: theme.primaryHex,
          borderRadius: btnRadius,
          borderWidth: Math.max(1, theme.buttonBorderWidth),
          borderStyle: "solid",
          borderColor: theme.primaryHex,
        }}
      >
        Outline Button
      </button>
    </div>
  );
}

export default function AdminTheme() {
  const { config, updateConfig, siteTheme, updateSiteTheme } = useRestaurantStore();
  const [activeSection, setActiveSection] = useState<Section>("colors");
  const [saved, setSaved] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSave = () => {
    // Apply all CSS vars immediately to the admin page root as well
    const root = document.documentElement;
    if (siteTheme.primaryHex)    root.style.setProperty("--primary",          hexToHsl(siteTheme.primaryHex));
    if (siteTheme.backgroundHex) root.style.setProperty("--background",       hexToHsl(siteTheme.backgroundHex));
    if (siteTheme.foregroundHex) root.style.setProperty("--foreground",       hexToHsl(siteTheme.foregroundHex));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const renderPanel = () => {
    switch (activeSection) {
      // ── COLORS ──────────────────────────────────────────────────────────────
      case "colors":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Color System</h3>
            <p className="text-xs text-foreground/40 mb-5">These colors are applied live across your entire customer-facing website.</p>

            <div className="space-y-0">
              <ColorRow
                label="Primary / Brand Color"
                description="Buttons, highlights, accents, active states"
                value={siteTheme.primaryHex}
                onChange={(v) => updateSiteTheme({ primaryHex: v })}
              />
              <ColorRow
                label="Accent Color"
                description="Secondary highlights and decorative elements"
                value={siteTheme.accentHex}
                onChange={(v) => updateSiteTheme({ accentHex: v })}
              />
              <ColorRow
                label="Background Color"
                description="Main page and section background"
                value={siteTheme.backgroundHex}
                onChange={(v) => updateSiteTheme({ backgroundHex: v })}
              />
              <ColorRow
                label="Card / Surface Color"
                description="Cards, panels, and elevated sections"
                value={siteTheme.cardBgHex}
                onChange={(v) => updateSiteTheme({ cardBgHex: v })}
              />
              <ColorRow
                label="Navigation Bar Color"
                description="Header / navbar background"
                value={siteTheme.navBgHex}
                onChange={(v) => updateSiteTheme({ navBgHex: v })}
              />
              <ColorRow
                label="Main Text Color"
                description="Headings and body text on the customer site"
                value={siteTheme.foregroundHex}
                onChange={(v) => updateSiteTheme({ foregroundHex: v })}
              />
              <ColorRow
                label="Muted / Subtitle Text"
                description="Captions, subtitles, secondary text"
                value={siteTheme.mutedFgHex}
                onChange={(v) => updateSiteTheme({ mutedFgHex: v })}
              />
            </div>

            {/* Color palette preview */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">Palette Preview</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { hex: siteTheme.primaryHex,    label: "Primary"    },
                  { hex: siteTheme.accentHex,      label: "Accent"     },
                  { hex: siteTheme.backgroundHex,  label: "BG"         },
                  { hex: siteTheme.cardBgHex,       label: "Card"       },
                  { hex: siteTheme.navBgHex,        label: "Nav"        },
                  { hex: siteTheme.foregroundHex,   label: "Text"       },
                  { hex: siteTheme.mutedFgHex,      label: "Muted"      },
                ].map(({ hex, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div
                      className="w-10 h-10 rounded-lg border border-white/10 shadow"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-[10px] text-foreground/40">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      // ── BUTTONS ─────────────────────────────────────────────────────────────
      case "buttons":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Button Style</h3>
            <p className="text-xs text-foreground/40 mb-5">Control the shape, color, and style of all buttons across the customer site.</p>

            {/* Shape */}
            <div className="mb-6">
              <p className="text-xs text-foreground/50 uppercase tracking-widest mb-3">Button Shape</p>
              <div className="flex gap-3">
                {(["sharp", "rounded", "pill"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateSiteTheme({ buttonStyle: style })}
                    className={cn(
                      "flex-1 py-2.5 text-sm capitalize border transition-colors",
                      style === "rounded" ? "rounded-lg" : style === "pill" ? "rounded-full" : "rounded-none",
                      siteTheme.buttonStyle === style
                        ? "bg-primary/15 text-primary border-primary/30 font-medium"
                        : "bg-white/5 text-foreground/60 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {style === "sharp" ? "Square" : style === "pill" ? "Pill" : "Rounded"}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="mb-6">
              <p className="text-xs text-foreground/50 uppercase tracking-widest mb-3">Button Colors</p>
              <div className="space-y-0">
                <ColorRow
                  label="Button Background"
                  description="Fill color of primary buttons"
                  value={siteTheme.primaryHex}
                  onChange={(v) => updateSiteTheme({ primaryHex: v })}
                />
                <ColorRow
                  label="Button Text Color"
                  description="Text color on filled primary buttons"
                  value={siteTheme.buttonTextColorHex}
                  onChange={(v) => updateSiteTheme({ buttonTextColorHex: v })}
                />
              </div>
            </div>

            {/* Border */}
            <div className="mb-6">
              <p className="text-xs text-foreground/50 uppercase tracking-widest mb-3">Button Border</p>
              <label className="text-xs text-foreground/50 mb-2 block">
                Border Width: <span className="text-primary font-medium">{siteTheme.buttonBorderWidth}px</span>
              </label>
              <input
                type="range"
                min={0}
                max={4}
                step={1}
                value={siteTheme.buttonBorderWidth}
                onChange={(e) => updateSiteTheme({ buttonBorderWidth: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-foreground/30 mt-1">
                <span>None</span><span>Thick</span>
              </div>
            </div>

            {/* Corner radius (only shown when not sharp or pill) */}
            {siteTheme.buttonStyle === "rounded" && (
              <div className="mb-6">
                <label className="text-xs text-foreground/50 mb-2 block">
                  Corner Radius: <span className="text-primary font-medium">{siteTheme.borderRadius}px</span>
                </label>
                <input
                  type="range" min={2} max={24} value={siteTheme.borderRadius}
                  onChange={(e) => updateSiteTheme({ borderRadius: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>
            )}

            {/* Live Preview */}
            <div className="pt-5 border-t border-white/10">
              <p className="text-xs text-foreground/40 uppercase tracking-widest mb-1">Live Preview</p>
              <div className="bg-black/30 rounded-xl p-5">
                <ButtonPreview theme={{
                  primaryHex: siteTheme.primaryHex,
                  buttonTextColorHex: siteTheme.buttonTextColorHex,
                  buttonStyle: siteTheme.buttonStyle,
                  borderRadius: siteTheme.borderRadius,
                  buttonBorderWidth: siteTheme.buttonBorderWidth,
                }} />
              </div>
            </div>
          </div>
        );

      // ── LINKS & TEXT ─────────────────────────────────────────────────────────
      case "links":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Links & Text Colors</h3>
            <p className="text-xs text-foreground/40 mb-5">Fine-tune text and link colors across the customer site.</p>

            <div className="space-y-0">
              <ColorRow
                label="Link Color"
                description="Inline links, text links, hover states"
                value={siteTheme.linkColorHex}
                onChange={(v) => updateSiteTheme({ linkColorHex: v })}
              />
              <ColorRow
                label="Primary / Brand Color"
                description="Also controls nav links in active state"
                value={siteTheme.primaryHex}
                onChange={(v) => updateSiteTheme({ primaryHex: v })}
              />
              <ColorRow
                label="Main Text Color"
                description="Headings, paragraphs, default body text"
                value={siteTheme.foregroundHex}
                onChange={(v) => updateSiteTheme({ foregroundHex: v })}
              />
              <ColorRow
                label="Muted / Subtitle Text"
                description="Captions, placeholders, secondary labels"
                value={siteTheme.mutedFgHex}
                onChange={(v) => updateSiteTheme({ mutedFgHex: v })}
              />
            </div>

            {/* Text preview */}
            <div className="mt-6 pt-5 border-t border-white/10">
              <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">Typography Preview</p>
              <div className="bg-black/30 rounded-xl p-5 space-y-3">
                <p className="text-2xl font-serif" style={{ color: siteTheme.foregroundHex, fontFamily: siteTheme.fontHeading }}>
                  {config.name}
                </p>
                <p className="text-sm" style={{ color: siteTheme.mutedFgHex, fontFamily: siteTheme.fontBody }}>
                  {config.tagline} — discover an unforgettable dining experience.
                </p>
                <p className="text-sm">
                  Visit our{" "}
                  <span className="underline cursor-pointer" style={{ color: siteTheme.linkColorHex }}>
                    menu page
                  </span>{" "}
                  to explore today's selections.
                </p>
              </div>
            </div>
          </div>
        );

      // ── TYPOGRAPHY ──────────────────────────────────────────────────────────
      case "typography":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Typography</h3>
            <p className="text-xs text-foreground/40 mb-5">Choose font pairings for headings and body text.</p>

            <div className="space-y-5">
              <div>
                <label className="text-xs text-foreground/50 uppercase tracking-widest mb-2 block">Heading Font</label>
                <select
                  value={siteTheme.fontHeading}
                  onChange={(e) => updateSiteTheme({ fontHeading: e.target.value })}
                  className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/40"
                >
                  {["Cormorant Garamond", "Playfair Display", "Libre Baskerville", "Merriweather", "EB Garamond", "Cinzel", "Lora", "Abril Fatface"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-foreground/50 uppercase tracking-widest mb-2 block">Body Font</label>
                <select
                  value={siteTheme.fontBody}
                  onChange={(e) => updateSiteTheme({ fontBody: e.target.value })}
                  className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/40"
                >
                  {["Inter", "Lato", "Open Sans", "Source Sans 3", "DM Sans", "Nunito", "Raleway", "Jost"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Font pairing preview */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">Pairing Preview</p>
                <div className="bg-black/30 rounded-xl p-6 space-y-3">
                  <p
                    className="text-4xl font-bold uppercase tracking-widest"
                    style={{ fontFamily: `"${siteTheme.fontHeading}", serif`, color: siteTheme.foregroundHex }}
                  >
                    {config.name}
                  </p>
                  <p
                    className="text-xs uppercase tracking-[0.3em]"
                    style={{ fontFamily: `"${siteTheme.fontBody}", sans-serif`, color: siteTheme.mutedFgHex }}
                  >
                    {config.tagline}
                  </p>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ fontFamily: `"${siteTheme.fontBody}", sans-serif`, color: siteTheme.mutedFgHex }}
                  >
                    {config.description?.slice(0, 120) || "A premium dining experience combining tradition with innovation."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      // ── BACKGROUND ──────────────────────────────────────────────────────────
      case "background":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Background & Hero Media</h3>
            <p className="text-xs text-foreground/40 mb-5">Set a background image or video for the hero section. Video takes priority over image.</p>

            {/* Hero Background Image */}
            <div className="mb-6">
              <p className="text-xs text-foreground/50 uppercase tracking-widest mb-3">Hero Background Image</p>
              <label className="text-xs text-foreground/40 mb-1 block">Image URL (Unsplash, CDN, etc.)</label>
              <input
                value={siteTheme.heroImageUrl || config.heroImage || ""}
                onChange={(e) => updateSiteTheme({ heroImageUrl: e.target.value })}
                className={inputCls}
                placeholder="https://images.unsplash.com/photo-..."
              />
              {(siteTheme.heroImageUrl || config.heroImage) && (
                <div className="mt-2 relative rounded-lg overflow-hidden h-28">
                  <img
                    src={siteTheme.heroImageUrl || config.heroImage}
                    alt="Hero background"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">Preview</span>
                  </div>
                </div>
              )}
              <button
                onClick={() => updateSiteTheme({ heroImageUrl: "" })}
                className="mt-2 text-xs text-foreground/40 hover:text-red-400 transition-colors"
              >
                Clear image
              </button>
            </div>

            {/* Hero Background Video */}
            <div className="mb-6 pt-5 border-t border-white/10">
              <p className="text-xs text-foreground/50 uppercase tracking-widest mb-3">Hero Background Video</p>
              <label className="text-xs text-foreground/40 mb-1 block">
                Direct video URL (.mp4, .webm) — overrides image when set
              </label>
              <input
                value={siteTheme.heroVideoUrl}
                onChange={(e) => updateSiteTheme({ heroVideoUrl: e.target.value })}
                className={inputCls}
                placeholder="https://example.com/video.mp4"
              />
              {siteTheme.heroVideoUrl && (
                <div className="mt-2 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-xs text-emerald-400">Video background active — will autoplay silently on loop</span>
                </div>
              )}
              <button
                onClick={() => updateSiteTheme({ heroVideoUrl: "" })}
                className="mt-2 text-xs text-foreground/40 hover:text-red-400 transition-colors"
              >
                Clear video
              </button>
            </div>

            {/* Overlay Opacity */}
            <div className="pt-5 border-t border-white/10">
              <p className="text-xs text-foreground/50 uppercase tracking-widest mb-3">Overlay Darkness</p>
              <label className="text-xs text-foreground/40 mb-2 block">
                Controls how dark the overlay on top of the image/video is:{" "}
                <span className="text-primary font-medium">{siteTheme.heroOverlayOpacity}%</span>
              </label>
              <input
                type="range" min={0} max={90} step={5}
                value={siteTheme.heroOverlayOpacity}
                onChange={(e) => updateSiteTheme({ heroOverlayOpacity: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-foreground/30 mt-1">
                <span>0% Fully visible</span><span>90% Very dark</span>
              </div>
            </div>

            {/* Background color */}
            <div className="pt-5 border-t border-white/10 mt-5">
              <p className="text-xs text-foreground/50 uppercase tracking-widest mb-3">Page Background Color</p>
              <ColorRow
                label="Background Color"
                description="Behind all sections and outside the hero"
                value={siteTheme.backgroundHex}
                onChange={(v) => updateSiteTheme({ backgroundHex: v })}
              />
            </div>
          </div>
        );

      // ── APPEARANCE ──────────────────────────────────────────────────────────
      case "appearance":
        return (
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Appearance Settings</h3>
            <p className="text-xs text-foreground/40 mb-5">Global layout and visual style controls.</p>

            <div className="space-y-6">
              {/* Dark/Light mode */}
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div>
                  <p className="text-sm text-foreground">Light Mode</p>
                  <p className="text-xs text-foreground/40">Toggle between dark and light appearance</p>
                </div>
                <button
                  onClick={() => updateSiteTheme({ lightMode: !siteTheme.lightMode })}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
                    siteTheme.lightMode ? "bg-primary" : "bg-white/20"
                  )}
                >
                  <span className={cn(
                    "inline-block h-4 w-4 rounded-full bg-white transition-transform shadow",
                    siteTheme.lightMode ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Global border radius */}
              <div>
                <label className="text-xs text-foreground/50 uppercase tracking-widest mb-2 block">
                  Global Corner Radius: <span className="text-primary font-medium">{siteTheme.borderRadius}px</span>
                </label>
                <input
                  type="range" min={0} max={24} value={siteTheme.borderRadius}
                  onChange={(e) => updateSiteTheme({ borderRadius: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-foreground/30 mt-1">
                  <span>0 — Sharp edges</span><span>24 — Very rounded</span>
                </div>
              </div>

              {/* Shadow */}
              <div>
                <label className="text-xs text-foreground/50 uppercase tracking-widest mb-2 block">
                  Shadow Intensity: <span className="text-primary font-medium">{siteTheme.shadowIntensity}%</span>
                </label>
                <input
                  type="range" min={0} max={100} value={siteTheme.shadowIntensity}
                  onChange={(e) => updateSiteTheme({ shadowIntensity: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
              </div>

              {/* Quick color resets */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">Theme Presets</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "Gold & Dark",   primary: "#d4a853", bg: "#0d0b09", fg: "#e8dcc8" },
                    { name: "Crimson",       primary: "#c0392b", bg: "#0e0a0a", fg: "#f0e6e6" },
                    { name: "Forest Green",  primary: "#2e7d32", bg: "#0a0e0a", fg: "#e0ede0" },
                    { name: "Ocean Blue",    primary: "#1565c0", bg: "#08090e", fg: "#dde3f0" },
                    { name: "Rose Gold",     primary: "#c2907a", bg: "#0f0c0b", fg: "#f0e8e5" },
                    { name: "Platinum",      primary: "#9e9e9e", bg: "#0c0c0c", fg: "#f0f0f0" },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateSiteTheme({
                        primaryHex: preset.primary,
                        backgroundHex: preset.bg,
                        foregroundHex: preset.fg,
                        linkColorHex: preset.primary,
                        navBgHex: preset.bg,
                        buttonTextColorHex: preset.fg === "#0d0b09" ? "#0d0b09" : preset.bg,
                      })}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-left"
                    >
                      <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: preset.primary }} />
                      <span className="text-xs text-foreground/70 truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout
      title="Website Theme Manager"
      subtitle="Customize colors, buttons, typography, and backgrounds — changes apply live"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={refreshPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Live Site
          </a>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-black rounded-lg text-xs font-medium hover:bg-primary/80 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Apply Theme"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[220px_1fr_300px] gap-5">
        {/* ── Sidebar nav ─────────────────────────────────────────────────── */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 h-fit">
          <p className="text-xs text-foreground/40 uppercase tracking-widest px-2 mb-3">Theme Controls</p>
          <div className="space-y-0.5">
            {SECTIONS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  activeSection === key
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                )}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Current theme swatch */}
          <div className="mt-5 pt-4 border-t border-white/10 px-2">
            <p className="text-xs text-foreground/40 mb-2">Current Palette</p>
            <div className="flex gap-1.5 flex-wrap">
              {[siteTheme.primaryHex, siteTheme.accentHex, siteTheme.backgroundHex, siteTheme.cardBgHex, siteTheme.foregroundHex].map((hex, i) => (
                <div key={i} className="w-6 h-6 rounded-md border border-white/10" style={{ backgroundColor: hex }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Main editor panel ────────────────────────────────────────────── */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          {renderPanel()}
        </div>

        {/* ── Live preview pane ────────────────────────────────────────────── */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-fit sticky top-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-foreground/40 uppercase tracking-widest">Live Preview</p>
            <button onClick={refreshPreview} className="p-1 rounded hover:bg-white/10 text-foreground/30 hover:text-foreground transition-colors">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          {/* Mobile frame preview */}
          <div className="rounded-2xl overflow-hidden border-2 border-white/10 bg-black/40 mx-auto" style={{ height: 340, maxWidth: 160 }}>
            <div className="w-full h-full overflow-hidden relative">
              <iframe
                ref={iframeRef}
                src="/"
                className="absolute top-0 left-0 pointer-events-none origin-top-left"
                style={{
                  width: "375px",
                  height: "812px",
                  transform: "scale(0.427)",
                }}
                title="Website preview"
              />
            </div>
          </div>

          {/* Desktop mini preview */}
          <div className="mt-3 rounded-lg overflow-hidden border border-white/10 bg-black/40" style={{ height: 140 }}>
            <div className="w-full h-full overflow-hidden relative">
              <iframe
                src="/"
                className="absolute top-0 left-0 pointer-events-none origin-top-left"
                style={{
                  width: "1280px",
                  height: "800px",
                  transform: "scale(0.23)",
                }}
                title="Desktop preview"
              />
            </div>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 mt-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-foreground/60 hover:text-foreground transition-colors"
          >
            Open Full Preview →
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
