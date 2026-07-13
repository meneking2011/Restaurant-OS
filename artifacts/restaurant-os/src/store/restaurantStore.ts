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
  CustomPage,
} from "../types/restaurant";
import {
  restaurantConfig as initialConfig,
  menuItems as initialMenuItems,
  services as initialServices,
  testimonials as initialTestimonials,
  galleryImages as initialGalleryImages,
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
  paymentPaid?: boolean;
  paymentAmount?: number;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
  visible: boolean;
  openInNewTab: boolean;
}

export interface DeliverySettings {
  fee: number;
  taxRate: number;
  minOrder: number;
  estimatedTime: string;
  radiusKm: number;
}

export interface ReservationSettings {
  maxPartySize: number;
  slotDurationMins: number;
  advanceNoticeHours: number;
  maxAdvanceDays: number;
  confirmationMessage: string;
  requirePayment: boolean;
  paymentAmount: number;
  allowMultiple: boolean;
  multipleLimit: number;
}

type StoreSnapshot = {
  menuItems: MenuItem[];
  services: Service[];
  testimonials: Testimonial[];
  galleryImages: GalleryImage[];
  navLinks: NavLink[];
  config: RestaurantConfig;
};

const defaultSiteTheme: SiteTheme = {
  primaryHex: "#d4a853",
  primaryColor: "38 71% 58%",
  secondaryHex: "#1a1614",
  accentHex: "#8b6e3a",
  backgroundHex: "#0d0b09",
  cardBgHex: "#141210",
  foregroundHex: "#e8dcc8",
  mutedFgHex: "#8a7d6b",
  linkColorHex: "#d4a853",
  navBgHex: "#0d0b09",
  buttonStyle: "sharp",
  buttonTextColorHex: "#0d0b09",
  buttonBorderWidth: 0,
  borderRadius: 0,
  shadowIntensity: 40,
  fontHeading: "Cormorant Garamond",
  fontBody: "Inter",
  lightMode: false,
  heroImageUrl: "",
  heroVideoUrl: "",
  heroOverlayOpacity: 60,
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

const defaultDeliverySettings: DeliverySettings = {
  fee: 15,
  taxRate: 0.08,
  minOrder: 25,
  estimatedTime: "30-45",
  radiusKm: 10,
};

const defaultReservationSettings: ReservationSettings = {
  maxPartySize: 10,
  slotDurationMins: 90,
  advanceNoticeHours: 24,
  maxAdvanceDays: 60,
  confirmationMessage:
    "Your reservation request has been received. Our team will contact you to confirm.",
  requirePayment: false,
  paymentAmount: 25,
  allowMultiple: false,
  multipleLimit: 1,
};

const defaultNavLinks: NavLink[] = [
  { id: "home",         label: "HOME",              href: "/",            visible: true,  openInNewTab: false },
  { id: "menu",         label: "MENU",              href: "/menu",        visible: true,  openInNewTab: false },
  { id: "about",        label: "ABOUT US",          href: "/about",       visible: true,  openInNewTab: false },
  { id: "locate",       label: "LOCATE US",         href: "/locate-us",   visible: true,  openInNewTab: false },
  { id: "contact",      label: "CONNECT WITH US",   href: "/contact",     visible: true,  openInNewTab: false },
  { id: "services",     label: "OUR SERVICES",      href: "/services",    visible: true,  openInNewTab: false },
  { id: "checkout",     label: "ORDER NOW",         href: "/checkout",    visible: true,  openInNewTab: false },
  { id: "reservations", label: "MAKE RESERVATIONS", href: "/reservations",visible: true,  openInNewTab: false },
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
  navLinks: NavLink[];
  deliverySettings: DeliverySettings;
  reservationSettings: ReservationSettings;
  customPages: CustomPage[];

  _historyPast: StoreSnapshot[];
  _historyFuture: StoreSnapshot[];

  updateConfig: (config: Partial<RestaurantConfig>) => void;
  updateSiteTheme: (theme: Partial<SiteTheme>) => void;
  updateAdminTheme: (theme: Partial<AdminTheme>) => void;
  updateQuickControls: (controls: Partial<QuickControls>) => void;
  addActivityLog: (entry: Omit<ActivityLogEntry, "id" | "timestamp">) => void;
  updateNavLinks: (links: NavLink[]) => void;
  updateDeliverySettings: (settings: Partial<DeliverySettings>) => void;
  updateReservationSettings: (settings: Partial<ReservationSettings>) => void;

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
  resetReservations: () => void;

  addGalleryImage: (image: Omit<GalleryImage, "id">) => void;
  updateGalleryImage: (id: string, image: Partial<GalleryImage>) => void;
  deleteGalleryImage: (id: string) => void;

  addOrder: (order: Omit<Order, "id" | "status" | "orderedAt">) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  cancelOrder: (id: string) => void;
  resetOrders: () => void;

  addCustomPage: (page: Omit<CustomPage, "id" | "createdAt">) => void;
  updateCustomPage: (id: string, data: Partial<CustomPage>) => void;
  deleteCustomPage: (id: string) => void;

  undoChange: () => void;
  redoChange: () => void;
}

function generateId(prefix: string) {
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function snapshot(s: RestaurantStore): StoreSnapshot {
  return {
    menuItems:    s.menuItems,
    services:     s.services,
    testimonials: s.testimonials,
    galleryImages:s.galleryImages,
    navLinks:     s.navLinks,
    config:       s.config,
  };
}

export const useRestaurantStore = create<RestaurantStore>()(
  persist(
    (set, get) => ({
      config: initialConfig,
      menuItems: initialMenuItems,
      services: initialServices,
      testimonials: initialTestimonials,
      reservations: [],
      galleryImages: initialGalleryImages,
      orders: [],
      siteTheme: defaultSiteTheme,
      adminTheme: defaultAdminTheme,
      quickControls: defaultQuickControls,
      activityLog: [],
      navLinks: defaultNavLinks,
      deliverySettings: defaultDeliverySettings,
      reservationSettings: defaultReservationSettings,
      customPages: [],

      _historyPast: [],
      _historyFuture: [],

      updateConfig: (partial) => {
        const s = get();
        set({
          config: { ...s.config, ...partial },
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },

      updateSiteTheme: (theme) => set((s) => ({ siteTheme: { ...s.siteTheme, ...theme } })),
      updateAdminTheme: (theme) => set((s) => ({ adminTheme: { ...s.adminTheme, ...theme } })),
      updateQuickControls: (controls) => set((s) => ({ quickControls: { ...s.quickControls, ...controls } })),
      addActivityLog: (entry) => set((s) => ({
        activityLog: [
          { ...entry, id: generateId("al"), timestamp: new Date().toISOString() },
          ...s.activityLog.slice(0, 49),
        ],
      })),
      updateNavLinks: (links) => {
        const s = get();
        set({ navLinks: links, _historyPast: [...s._historyPast.slice(-29), snapshot(s)], _historyFuture: [] });
      },
      updateDeliverySettings: (settings) => set((s) => ({ deliverySettings: { ...s.deliverySettings, ...settings } })),
      updateReservationSettings: (settings) => set((s) => ({ reservationSettings: { ...s.reservationSettings, ...settings } })),

      addMenuItem: (item) => {
        const s = get();
        set({
          menuItems: [...s.menuItems, { ...item, id: generateId("m") }],
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },
      updateMenuItem: (id, partial) => {
        const s = get();
        set({
          menuItems: s.menuItems.map((m) => m.id === id ? { ...m, ...partial } : m),
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },
      deleteMenuItem: (id) => {
        const s = get();
        set({
          menuItems: s.menuItems.filter((m) => m.id !== id),
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },

      addService: (service) => {
        const s = get();
        set({
          services: [...s.services, { ...service, id: generateId("s") }],
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },
      updateService: (id, partial) => {
        const s = get();
        set({
          services: s.services.map((sv) => sv.id === id ? { ...sv, ...partial } : sv),
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },
      deleteService: (id) => {
        const s = get();
        set({
          services: s.services.filter((sv) => sv.id !== id),
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },

      addTestimonial: (t) => {
        const s = get();
        set({
          testimonials: [...s.testimonials, { ...t, id: generateId("t") }],
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },
      updateTestimonial: (id, partial) => {
        const s = get();
        set({
          testimonials: s.testimonials.map((t) => t.id === id ? { ...t, ...partial } : t),
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },
      deleteTestimonial: (id) => {
        const s = get();
        set({
          testimonials: s.testimonials.filter((t) => t.id !== id),
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },

      addReservation: (data) => set((s) => ({
        reservations: [...s.reservations, { ...data, id: generateId("r"), status: "pending" as const, createdAt: new Date().toISOString() }],
        activityLog: [
          { id: generateId("al"), message: "New Reservation", detail: `${data.name} booked a table for ${data.guests}`, timestamp: new Date().toISOString() },
          ...s.activityLog.slice(0, 49),
        ],
      })),
      updateReservationStatus: (id, status) => set((s) => ({
        reservations: s.reservations.map((r) => r.id === id ? { ...r, status } : r),
        activityLog: [
          { id: generateId("al"), message: "Reservation Updated", detail: `Reservation for ${s.reservations.find(r => r.id === id)?.name ?? id} → ${status}`, timestamp: new Date().toISOString() },
          ...s.activityLog.slice(0, 49),
        ],
      })),
      updateReservation: (id, data) => set((s) => ({ reservations: s.reservations.map((r) => r.id === id ? { ...r, ...data } : r) })),
      deleteReservation: (id) => set((s) => ({ reservations: s.reservations.filter((r) => r.id !== id) })),
      resetReservations: () => set({ reservations: [] }),

      addGalleryImage: (image) => {
        const s = get();
        set({
          galleryImages: [...s.galleryImages, { ...image, id: generateId("g") }],
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },
      updateGalleryImage: (id, partial) => {
        const s = get();
        set({
          galleryImages: s.galleryImages.map((g) => g.id === id ? { ...g, ...partial } : g),
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },
      deleteGalleryImage: (id) => {
        const s = get();
        set({
          galleryImages: s.galleryImages.filter((g) => g.id !== id),
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: [],
        });
      },

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
          { id: generateId("al"), message: "Order Updated", detail: `Order #${id.replace("ord-", "")} → ${status}`, timestamp: new Date().toISOString() },
          ...s.activityLog.slice(0, 49),
        ] : s.activityLog,
      })),
      cancelOrder: (id) => set((s) => ({ orders: s.orders.map((o) => o.id === id ? { ...o, status: "cancelled" as const } : o) })),
      resetOrders: () => set({ orders: [] }),

      addCustomPage: (page) => set((s) => ({
        customPages: [...s.customPages, { ...page, id: generateId("cp"), createdAt: new Date().toISOString() }],
      })),
      updateCustomPage: (id, data) => set((s) => ({
        customPages: s.customPages.map((p) => p.id === id ? { ...p, ...data } : p),
      })),
      deleteCustomPage: (id) => set((s) => ({
        customPages: s.customPages.filter((p) => p.id !== id),
      })),

      undoChange: () => {
        const s = get();
        if (s._historyPast.length === 0) return;
        const prev = s._historyPast[s._historyPast.length - 1];
        const newPast = s._historyPast.slice(0, -1);
        set({
          ...prev,
          _historyPast: newPast,
          _historyFuture: [snapshot(s), ...s._historyFuture.slice(0, 29)],
        });
      },

      redoChange: () => {
        const s = get();
        if (s._historyFuture.length === 0) return;
        const next = s._historyFuture[0];
        const newFuture = s._historyFuture.slice(1);
        set({
          ...next,
          _historyPast: [...s._historyPast.slice(-29), snapshot(s)],
          _historyFuture: newFuture,
        });
      },
    }),
    {
      name: "restaurant-os-data",
      partialize: (state) => {
        const { _historyPast, _historyFuture, ...rest } = state;
        void _historyPast; void _historyFuture;
        return rest;
      },
    }
  )
);
