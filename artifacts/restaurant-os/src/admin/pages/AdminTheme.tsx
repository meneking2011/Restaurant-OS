import { useState } from "react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { AdminLayout } from "../layout/AdminLayout";
import { cn } from "@/lib/utils";
import { Save, Eye } from "lucide-react";
import { hexToHsl } from "@/utils/colorUtils";

type ThemeSection = "branding" | "colors" | "typography" | "buttons" | "images" | "appearance";

const SECTIONS: { key: ThemeSection; label: string }[] = [
  { key: "branding", label: "Branding" },
  { key: "colors", label: "Colors" },
  { key: "typography", label: "Typography" },
  { key: "buttons", label: "Buttons" },
  { key: "images", label: "Images" },
  { key: "appearance", label: "Appearance" },
];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary/50";

export default function AdminTheme() {
  const { config, updateConfig, siteTheme, updateSiteTheme } = useRestaurantStore();
  const [activeSection, setActiveSection] = useState<ThemeSection>("branding");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (siteTheme.primaryHex) {
      document.documentElement.style.setProperty("--primary", hexToHsl(siteTheme.primaryHex));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const renderPanel = () => {
    switch (activeSection) {
      case "branding":
        return (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Restaurant Name & Descriptions</h3>
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Restaurant Name</label>
              <input
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Slogan / Tagline</label>
              <input
                value={config.tagline}
                onChange={(e) => updateConfig({ tagline: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Short Description</label>
              <textarea
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                rows={3}
                className={inputCls + " resize-none"}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="text-xs text-foreground/50 mb-2 block">Logo</label>
                <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                  {config.logo ? (
                    <img src={config.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <span className="text-xs text-foreground/30">Upload</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-foreground/50 mb-2 block">Favicon</label>
                <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                  <span className="text-xs text-foreground/30">Upload</span>
                </div>
              </div>
            </div>
          </div>
        );

      case "colors":
        return (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Color System</h3>
            {[
              { label: "Primary Color", key: "primaryHex" as const },
              { label: "Secondary Color", key: "secondaryHex" as const },
              { label: "Accent Color", key: "accentHex" as const },
            ].map(({ label, key }) => (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="color"
                  value={siteTheme[key]}
                  onChange={(e) => updateSiteTheme({ [key]: e.target.value })}
                  className="w-12 h-10 rounded-lg border border-white/10 cursor-pointer bg-transparent shrink-0"
                />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{label}</p>
                  <input
                    type="text"
                    value={siteTheme[key]}
                    onChange={(e) => updateSiteTheme({ [key]: e.target.value })}
                    className="text-xs font-mono text-foreground/50 bg-transparent border-none outline-none w-24"
                  />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-foreground/50 mb-3">Global Website Background</p>
              <div className="w-full h-16 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-primary/30 transition-colors">
                <span className="text-xs text-foreground/30">Upload Background Image</span>
              </div>
            </div>
          </div>
        );

      case "typography":
        return (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Typography</h3>
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Heading Font</label>
              <select
                value={siteTheme.fontHeading}
                onChange={(e) => updateSiteTheme({ fontHeading: e.target.value })}
                className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
              >
                <option>Cormorant Garamond</option>
                <option>Playfair Display</option>
                <option>Libre Baskerville</option>
                <option>Merriweather</option>
                <option>EB Garamond</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-1 block">Body Font</label>
              <select
                value={siteTheme.fontBody}
                onChange={(e) => updateSiteTheme({ fontBody: e.target.value })}
                className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
              >
                <option>Inter</option>
                <option>Lato</option>
                <option>Open Sans</option>
                <option>Source Sans 3</option>
                <option>DM Sans</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-foreground/50 mb-3">Preview</p>
              <div className="bg-white/5 rounded-lg p-5 space-y-2">
                <p className="text-2xl font-bold" style={{ fontFamily: siteTheme.fontHeading }}>
                  {config.name}
                </p>
                <p className="text-sm text-foreground/60" style={{ fontFamily: siteTheme.fontBody }}>
                  Sample headline using {siteTheme.fontHeading} &amp; {siteTheme.fontBody}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                </p>
              </div>
            </div>
          </div>
        );

      case "buttons":
        return (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Button Styles</h3>
            <div>
              <label className="text-xs text-foreground/50 mb-2 block">Button Style</label>
              <div className="flex gap-3">
                {(["rounded", "sharp", "pill"] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => updateSiteTheme({ buttonStyle: style })}
                    className={cn(
                      "px-5 py-2 text-sm capitalize border transition-colors",
                      style === "rounded" ? "rounded-lg" : style === "pill" ? "rounded-full" : "rounded-none",
                      siteTheme.buttonStyle === style
                        ? "bg-primary/15 text-primary border-primary/30"
                        : "bg-white/5 text-foreground/60 border-white/10 hover:bg-white/10"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-2 block">Primary Button Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={siteTheme.primaryHex}
                  onChange={(e) => updateSiteTheme({ primaryHex: e.target.value })}
                  className="w-12 h-10 rounded border border-white/10 cursor-pointer bg-transparent"
                />
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-foreground/40">Preview</p>
                  <div className="flex gap-3">
                    <button
                      className="px-5 py-2 text-sm font-medium text-black"
                      style={{
                        backgroundColor: siteTheme.primaryHex,
                        borderRadius: siteTheme.buttonStyle === "pill" ? "9999px" : siteTheme.buttonStyle === "sharp" ? "0" : "8px",
                      }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-5 py-2 text-sm font-medium border"
                      style={{
                        borderColor: siteTheme.primaryHex,
                        color: siteTheme.primaryHex,
                        borderRadius: siteTheme.buttonStyle === "pill" ? "9999px" : siteTheme.buttonStyle === "sharp" ? "0" : "8px",
                      }}
                    >
                      Secondary
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "images":
        return (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Images & Media</h3>
            <div>
              <label className="text-xs text-foreground/50 mb-2 block">Hero / Banner Image</label>
              <input
                value={config.heroImage}
                onChange={(e) => updateConfig({ heroImage: e.target.value })}
                className={inputCls}
                placeholder="https://images.unsplash.com/..."
              />
              {config.heroImage && (
                <img src={config.heroImage} alt="Hero" className="mt-2 w-full h-32 object-cover rounded-lg opacity-70" />
              )}
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-2 block">Default Placeholder Image</label>
              <div className="w-full h-24 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/30 transition-colors">
                <span className="text-xs text-foreground/30">Upload / Select</span>
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Appearance Settings</h3>
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div>
                <p className="text-sm text-foreground">Light / Dark Mode</p>
                <p className="text-xs text-foreground/40">Current: {siteTheme.lightMode ? "Light" : "Dark"}</p>
              </div>
              <button
                onClick={() => updateSiteTheme({ lightMode: !siteTheme.lightMode })}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  siteTheme.lightMode ? "bg-primary" : "bg-white/20"
                )}
              >
                <span className={cn("inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow", siteTheme.lightMode ? "translate-x-4.5" : "translate-x-0.5")} />
              </button>
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-2 block">Card Style</label>
              <select className="w-full bg-[hsl(15,13%,10%)] border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none">
                <option>Elevated (Shadow)</option>
                <option>Outlined (Border)</option>
                <option>Flat (No shadow)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-2 block">Border Radius ({siteTheme.borderRadius}px)</label>
              <input type="range" min={0} max={24} value={siteTheme.borderRadius} onChange={(e) => updateSiteTheme({ borderRadius: Number(e.target.value) })} className="w-full accent-primary" />
              <div className="flex justify-between text-xs text-foreground/30 mt-1"><span>0 Sharp</span><span>24 Round</span></div>
            </div>
            <div>
              <label className="text-xs text-foreground/50 mb-2 block">Shadow Intensity ({siteTheme.shadowIntensity}%)</label>
              <input type="range" min={0} max={100} value={siteTheme.shadowIntensity} onChange={(e) => updateSiteTheme({ shadowIntensity: Number(e.target.value) })} className="w-full accent-primary" />
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
      subtitle="Customize the look and feel of your customer-facing website"
      actions={
        <div className="flex items-center gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-foreground/70 rounded-lg text-xs hover:bg-white/10 transition-colors">
            <Eye className="w-3.5 h-3.5" /> Preview Website
          </a>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-black rounded-lg text-xs font-medium hover:bg-primary/80 transition-colors"
          >
            <Save className="w-3.5 h-3.5" /> {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[200px_1fr_280px] gap-5">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 h-fit">
          <p className="text-xs text-foreground/40 uppercase tracking-widest px-2 mb-2">Theme Components</p>
          <div className="space-y-0.5">
            {SECTIONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                  activeSection === key
                    ? "bg-primary/15 text-primary font-medium"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                )}
              >
                <span className="capitalize">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-5 capitalize">Edit Theme Section: {activeSection}</h2>
          {renderPanel()}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 h-fit">
          <p className="text-xs text-foreground/40 uppercase tracking-widest mb-3">Live Website Theme Preview</p>
          <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40 mb-3" style={{ height: 220 }}>
            <iframe
              src="/"
              className="w-full h-full pointer-events-none"
              style={{ transform: "scale(0.45)", transformOrigin: "top left", width: "222%", height: "222%" }}
              title="Theme preview"
            />
          </div>
          <a
            href="/"
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
