import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  RestaurantConfig,
  MenuItem,
  Service,
  Testimonial,
  GalleryImage,
  Order,
  SiteTheme,
  AdminTheme,
  QuickControls,
  ActivityLogEntry,
} from "../types/restaurant";
import {
  restaurantConfig as initialConfig,
  menuItems as initialMenuItems,
  services as initialServices,
  testimonials as initialTestimonials,
  galleryImages as initialGalleryImages,
  mockOrders as initialOrders,
} from "../data/mockData";

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  table?: string;
  occasion?: string;
  notes?: string;
  status: "pending" | "confirmed" | "seated" | "completed" | "cancelled";
  createdAt: string;
}

const defaultSiteTheme: SiteTheme = {
  primaryHex: "#d4a853",
  primaryColor: "38 71% 58%",
  secondaryHex: "#1a1614",
  accentHex: "#8b6e3a",
  buttonStyle: "rounded",
  borderRadius: 8,
  shadowIntensity: 40,
  fontHeading: "Cormorant Garamond",
  fontBody: "Inter",
  lightMode: false,
};

const defaultAdminTheme: AdminTheme = {
  primaryHex: "#d4a853",
  sidebarBgHex: "#0d0b09",
  mainBgHex: "#110e0c",
  buttonHex: "#d4a853",
};

const defaultQuickControls: QuickControls = {
  restaurantOpen: true,
  acceptReservations: true,
  onlineOrders: false,
  whatsapp: true,
  maintenanceMode: false,
};

const defaultActivityLog: ActivityLogEntry[] = [
  { id: "al1", message: "New Reservation", detail: "James Harrington booked a table for 2", timestamp: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: "al2", message: "Order Updated", detail: "Order #ord-001 status changed to Preparing", timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: "al3", message: "Menu Item Added", detail: "Wagyu Beef Wellington added to Mains", timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: "al4", message: "Gallery Updated", detail: "3 new photos uploaded to gallery", timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: "al5", message: "Reservation Confirmed", detail: "Priya Anand reservation confirmed for July 19", timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString() },
];

interface RestaurantStore {
  config: RestaurantConfig;
  menuItems: MenuItem[];
  services: Service[];
  testimonials: Testimonial[];
  reservations: Reservation[];
  galleryImages: GalleryImage[];
  orders: Order[];
  siteTheme: SiteTheme;
  adminTheme: AdminTheme;
  quickControls: QuickControls;
  activityLog: ActivityLogEntry[];

  updateConfig: (config: Partial<RestaurantConfig>) => void;
  updateSiteTheme: (theme: Partial<SiteTheme>) => void;
  updateAdminTheme: (theme: Partial<AdminTheme>) => void;
  updateQuickControls: (controls: Partial<QuickControls>) => void;
  addActivityLog: (entry: Omit<ActivityLogEntry, "id" | "timestamp">) => void;

  addMenuItem: (item: Omit<MenuItem, "id">) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;

  addService: (service: Omit<Service, "id">) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addTestimonial: (testimonial: Omit<Testimonial, "id">) => void;
  updateTestimonial: (id: string, testimonial: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;

  addReservation: (reservation: Omit<Reservation, "id" | "status" | "createdAt">) => void;
  updateReservationStatus: (id: string, status: Reservation["status"]) => void;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
  deleteReservation: (id: string) => void;

  addGalleryImage: (image: Omit<GalleryImage, "id">) => void;
  updateGalleryImage: (id: string, image: Partial<GalleryImage>) => void;
  deleteGalleryImage: (id: string) => void;

  addOrder: (order: Omit<Order, "id" | "status" | "orderedAt">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  cancelOrder: (id: string) => void;
}

const mockReservations: Reservation[] = [
  { id: "r1", name: "James Harrington", email: "james.h@example.com", phone: "(555) 234-5678", date: "2026-07-18", time: "7:00 PM", guests: 2, table: "T12", occasion: "Anniversary", notes: "Please prepare a rose and a small cake if possible.", status: "confirmed", createdAt: "2026-07-10T14:23:00Z" },
  { id: "r2", name: "Priya Anand", email: "p.anand@example.com", phone: "(555) 987-6543", date: "2026-07-19", time: "8:30 PM", guests: 4, table: "T8", status: "pending", createdAt: "2026-07-11T09:05:00Z" },
  { id: "r3", name: "Carlos Mendez", email: "carlos.m@example.com", phone: "(555) 456-7890", date: "2026-07-20", time: "6:30 PM", guests: 6, table: "T4", occasion: "Birthday", status: "pending", createdAt: "2026-07-11T17:42:00Z" },
  { id: "r4", name: "Sophie Laurent", email: "sophie.l@example.com", phone: "(555) 321-0987", date: "2026-07-15", time: "7:30 PM", guests: 2, status: "cancelled", createdAt: "2026-07-08T11:15:00Z" },
  { id: "r5", name: "Oliver Chen", email: "oliver.c@example.com", phone: "(555) 654-3210", date: "2026-07-22", time: "9:00 PM", guests: 3, table: "T6", occasion: "Business Dinner", status: "confirmed", createdAt: "2026-07-12T08:30:00Z" },
  { id: "r6", name: "Elena Vasquez", email: "elena.v@example.com", phone: "(555) 789-0123", date: "2026-07-12", time: "7:00 PM", guests: 2, table: "T3", status: "seated", createdAt: "2026-07-12T10:00:00Z" },
  { id: "r7", name: "Kenji Tanaka", email: "kenji.t@example.com", phone: "(555) 456-7891", date: "2026-07-10", time: "6:00 PM", guests: 5, table: "T9", status: "completed", createdAt: "2026-07-09T12:00:00Z" },
];

function generateId(prefix: string) {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useRestaurantStore = create<RestaurantStore>()(
  persist(
    (set) => ({
      config: initialConfig,
      menuItems: initialMenuItems,
      services: initialServices,
      testimonials: initialTestimonials,
      reservations: mockReservations,
      galleryImages: initialGalleryImages,
      orders: initialOrders,
      siteTheme: defaultSiteTheme,
      adminTheme: defaultAdminTheme,
      quickControls: defaultQuickControls,
      activityLog: defaultActivityLog,

      updateConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
      updateSiteTheme: (theme) => set((s) => ({ siteTheme: { ...s.siteTheme, ...theme } })),
      updateAdminTheme: (theme) => set((s) => ({ adminTheme: { ...s.adminTheme, ...theme } })),
      updateQuickControls: (controls) => set((s) => ({ quickControls: { ...s.quickControls, ...controls } })),
      addActivityLog: (entry) => set((s) => ({
        activityLog: [
          { ...entry, id: generateId("al"), timestamp: new Date().toISOString() },
          ...s.activityLog.slice(0, 49),
        ],
      })),

      addMenuItem: (item) => set((s) => ({ menuItems: [...s.menuItems, { ...item, id: generateId("m") }] })),
      updateMenuItem: (id, partial) => set((s) => ({ menuItems: s.menuItems.map((m) => m.id === id ? { ...m, ...partial } : m) })),
      deleteMenuItem: (id) => set((s) => ({ menuItems: s.menuItems.filter((m) => m.id !== id) })),

      addService: (service) => set((s) => ({ services: [...s.services, { ...service, id: generateId("s") }] })),
      updateService: (id, partial) => set((s) => ({ services: s.services.map((sv) => sv.id === id ? { ...sv, ...partial } : sv) })),
      deleteService: (id) => set((s) => ({ services: s.services.filter((sv) => sv.id !== id) })),

      addTestimonial: (t) => set((s) => ({ testimonials: [...s.testimonials, { ...t, id: generateId("t") }] })),
      updateTestimonial: (id, partial) => set((s) => ({ testimonials: s.testimonials.map((t) => t.id === id ? { ...t, ...partial } : t) })),
      deleteTestimonial: (id) => set((s) => ({ testimonials: s.testimonials.filter((t) => t.id !== id) })),

      addReservation: (data) => set((s) => ({
        reservations: [...s.reservations, { ...data, id: generateId("r"), status: "pending" as const, createdAt: new Date().toISOString() }],
      })),
      updateReservationStatus: (id, status) => set((s) => ({ reservations: s.reservations.map((r) => r.id === id ? { ...r, status } : r) })),
      updateReservation: (id, data) => set((s) => ({ reservations: s.reservations.map((r) => r.id === id ? { ...r, ...data } : r) })),
      deleteReservation: (id) => set((s) => ({ reservations: s.reservations.filter((r) => r.id !== id) })),

      addGalleryImage: (image) => set((s) => ({ galleryImages: [...s.galleryImages, { ...image, id: generateId("g") }] })),
      updateGalleryImage: (id, partial) => set((s) => ({ galleryImages: s.galleryImages.map((g) => g.id === id ? { ...g, ...partial } : g) })),
      deleteGalleryImage: (id) => set((s) => ({ galleryImages: s.galleryImages.filter((g) => g.id !== id) })),

      addOrder: (order) => set((s) => {
        const newOrder: Order = { ...order, id: `ord-${generateId("o")}`, status: "new" as const, orderedAt: new Date().toISOString() };
        return {
          orders: [...s.orders, newOrder],
          activityLog: [
            { id: generateId("al"), message: "New Order", detail: `Order from ${order.customerName} — ${order.items.length} item(s)`, timestamp: new Date().toISOString() },
            ...s.activityLog.slice(0, 49),
          ],
        };
      }),
      updateOrderStatus: (id, status) => set((s) => ({
        orders: s.orders.map((o) => o.id === id ? { ...o, status } : o),
        activityLog: status !== "new" ? [
          { id: generateId("al"), message: "Order Updated", detail: `Order #${id.replace("ord-", "")} status changed to ${status}`, timestamp: new Date().toISOString() },
          ...s.activityLog.slice(0, 49),
        ] : s.activityLog,
      })),
      cancelOrder: (id) => set((s) => ({ orders: s.orders.map((o) => o.id === id ? { ...o, status: "cancelled" as const } : o) })),
    }),
    { name: "restaurant-os-data" }
  )
);
