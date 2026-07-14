import { AdminLayout } from "../layout/AdminLayout";
import { Link } from "wouter";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Globe, FileText, Navigation, Palette, Image, BarChart3, ExternalLink } from "lucide-react";

const websiteModules = [
  { label: "Pages Manager", description: "Control page visibility, routes, and display settings", icon: FileText, href: "/admin/pages", color: "text-blue-400 bg-blue-400/10" },
  { label: "Navigation Manager", description: "Edit hamburger menu links and their order", icon: Navigation, href: "/admin/navigation", color: "text-purple-400 bg-purple-400/10" },
  { label: "Design Tokens", description: "Customize colors, fonts, buttons, cards and appearance", icon: Palette, href: "/admin/design-tokens", color: "text-primary bg-primary/10" },
  { label: "Media Library", description: "Manage all images, files and uploads", icon: Image, href: "/admin/media", color: "text-emerald-400 bg-emerald-400/10" },
  { label: "Analytics", description: "Track visits, orders and customer behavior", icon: BarChart3, href: "/admin/analytics", color: "text-amber-400 bg-amber-400/10" },
  { label: "Restaurant Profile", description: "Update restaurant profile, hours, and contact info", icon: Globe, href: "/admin/business", color: "text-rose-400 bg-rose-400/10" },
];

export default function AdminWebsite() {
  const { config, quickControls, updateQuickControls } = useRestaurantStore();

  return (
    <AdminLayout
      title="Website Manager"
      subtitle="Manage all aspects of your customer-facing website"
      actions={
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> View Live Site
        </a>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Website Modules</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {websiteModules.map(({ label, description, icon: Icon, href, color }) => (
              <Link key={href} href={href}>
                <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-xl p-5 cursor-pointer transition-all hover:bg-white/[0.07] group">
                  <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{label}</h3>
                  <p className="text-xs text-foreground/50 leading-relaxed">{description}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Quick Website Controls</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { key: "restaurantOpen" as const, label: "Restaurant Open", sub: "Customers can view your menu" },
                { key: "acceptReservations" as const, label: "Accept Reservations", sub: "Reservation form is enabled" },
                { key: "onlineOrders" as const, label: "Online Orders", sub: "Checkout is enabled" },
                { key: "maintenanceMode" as const, label: "Maintenance Mode", sub: "Shows a coming soon page" },
              ].map(({ key, label, sub }) => (
                <div key={key} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-lg">
                  <div>
                    <p className="text-sm text-foreground">{label}</p>
                    <p className="text-xs text-foreground/40">{sub}</p>
                  </div>
                  <button
                    onClick={() => updateQuickControls({ [key]: !quickControls[key] })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${quickControls[key] ? "bg-primary" : "bg-white/20"}`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow ${quickControls[key] ? "translate-x-4.5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs font-semibold text-foreground mb-3">Live Website Preview</p>
            <div className="rounded-lg overflow-hidden border border-white/10 bg-black/40 mb-3" style={{ height: 200 }}>
              <iframe
                src="/"
                className="w-full h-full pointer-events-none"
                style={{ transform: "scale(0.45)", transformOrigin: "top left", width: "222%", height: "222%" }}
                title="Live site preview"
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

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-xs font-semibold text-foreground mb-3">Website Info</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-foreground/50"><span>Restaurant</span><span className="text-foreground">{config.name}</span></div>
              <div className="flex justify-between text-foreground/50"><span>Status</span><span className="text-emerald-400">Online</span></div>
              <div className="flex justify-between text-foreground/50"><span>Pages</span><span className="text-foreground">8 pages</span></div>
              <div className="flex justify-between text-foreground/50"><span>Last Updated</span><span className="text-foreground">Today</span></div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
