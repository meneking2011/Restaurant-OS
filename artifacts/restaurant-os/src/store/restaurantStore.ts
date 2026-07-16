import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  RestaurantConfig,
  MenuItem,
  Service,
  Testimonial,
  GalleryImage,
  Order,
  OrderStatus,
  PaymentStatus,
  BankAccount,
  SiteTheme,
  AdminTheme,
  QuickControls,
  ActivityLogEntry,
  CustomPage,
  DesignTokenPage,
  SectionKey,
  SectionMediaConfig,
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
  maxTotalSeats: number;
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

  surfaceHex: "#1a1614",
  borderHex: "#2a241f",
  buttonBgHex: "#d4a853",
  buttonHoverHex: "#e8bd6a",
  footerBgHex: "#0d0b09",
  footerTextHex: "#8a7d6b",
  baseFontSizePx: 16,
  headingWeight: "medium",
  cardRadius: 4,
  cardShadowIntensity: 40,
  containerWidth: "default",
  sectionSpacing: "comfortable",
  animationsEnabled: true,
  animationSpeed: "normal",
};

const defaultSectionMedia: Record<SectionKey, SectionMediaConfig> = {
  hero:           { images: [], backgroundImage: "", overlayColor: "#000000", overlayOpacity: 40, backgroundColor: "", useBackgroundColor: false },
  featuredDishes: { images: [], backgroundImage: "", overlayColor: "#000000", overlayOpacity: 0,  backgroundColor: "", useBackgroundColor: false },
  about:          { images: [], backgroundImage: "", overlayColor: "#000000", overlayOpacity: 0,  backgroundColor: "", useBackgroundColor: false },
  services:       { images: [], backgroundImage: "", overlayColor: "#000000", overlayOpacity: 0,  backgroundColor: "", useBackgroundColor: false },
  gallery:        { images: [], backgroundImage: "", overlayColor: "#000000", overlayOpacity: 0,  backgroundColor: "", useBackgroundColor: false },
  cta:            { images: [], backgroundImage: "", overlayColor: "#000000", overlayOpacity: 40, backgroundColor: "", useBackgroundColor: false },
  footer:         { images: [], backgroundImage: "", overlayColor: "#000000", overlayOpacity: 0,  backgroundColor: "", useBackgroundColor: false },
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
  maxTotalSeats: 50,
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
  bankAccounts: BankAccount[];
  siteTheme: SiteTheme;
  adminTheme: AdminTheme;
  quickControls: QuickControls;
  activityLog: ActivityLogEntry[];
  navLinks: NavLink[];
  deliverySettings: DeliverySettings;
  reservationSettings: ReservationSettings;
  customPages: CustomPage[];
  visitLog: string[];
  themeOverrides: Partial<Record<DesignTokenPage, Partial<SiteTheme>>>;
  sectionMedia: Record<SectionKey, SectionMediaConfig>;

  _historyPast: StoreSnapshot[];
  _historyFuture: StoreSnapshot[];

  updateConfig: (config: Partial<RestaurantConfig>) => void;
  updateSiteTheme: (theme: Partial<SiteTheme>) => void;
  updateThemeOverride: (page: DesignTokenPage, theme: Partial<SiteTheme>) => void;
  clearThemeOverride: (page: DesignTokenPage) => void;
  updateSectionMedia: (section: SectionKey, media: Partial<SectionMediaConfig>) => void;
  updateAdminTheme: (theme: Partial<AdminTheme>) => void;
  updateQuickControls: (controls: Partial<QuickControls>) => void;
  addActivityLog: (entry: Omit<ActivityLogEntry, "id" | "timestamp">) => void;
  updateNavLinks: (links: NavLink[]) => void;
  updateDeliverySettings: (settings: Partial<DeliverySettings>) => void;
  updateReservationSettings: (settings: Partial<ReservationSettings>) => void;

  // Bank account management
  addBankAccount: (account: Omit<BankAccount, "id">) => void;
  updateBankAccount: (id: string, data: Partial<BankAccount>) => void;
  deleteBankAccount: (id: string) => void;

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

  addOrder: (order: Omit<Order, "id" | "status" | "orderedAt" | "paymentStatus">) => string;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  submitOrderReceipt: (id: string, receiptUrl: string, receiptFileName: string, bankAccountId: string) => void;
  verifyOrderPayment: (id: string) => void;
  rejectOrderPayment: (id: string, reason: string) => void;
  cancelOrder: (id: string) => void;
  resetOrders: () => void;

  addCustomPage: (page: Omit<CustomPage, "id" | "createdAt">) => void;
  updateCustomPage: (id: string, data: Partial<CustomPage>) => void;
  deleteCustomPage: (id: string) => void;

  logVisit: () => void;

  undoChange: () => void;
  redoChange: () => void;

  hydrateFromTenant: (data: Partial<RestaurantStore>) => void;
}

/** Pure-data fields that are synced per-tenant to Firestore (excludes actions and undo history). */
export const TENANT_DATA_FIELDS = [
  "config", "menuItems", "services", "testimonials", "reservations", "galleryImages", "orders",
  "bankAccounts", "siteTheme", "adminTheme", "quickControls", "activityLog", "navLinks",
  "deliverySettings", "reservationSettings", "customPages", "visitLog", "themeOverrides", "sectionMedia",
] as const;

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
      bankAccounts: [],
      siteTheme: defaultSiteTheme,
      adminTheme: defaultAdminTheme,
      quickControls: defaultQuickControls,
      activityLog: [],
      navLinks: defaultNavLinks,
      deliverySettings: defaultDeliverySettings,
      reservationSettings: defaultReservationSettings,
      customPages: [],
      visitLog: [],
      themeOverrides: {},
      sectionMedia: defaultSectionMedia,

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

      logVisit: () => set((s) => ({ visitLog: [...s.visitLog.slice(-999), new Date().toISOString()] })),
      updateSiteTheme: (theme) => set((s) => ({ siteTheme: { ...s.siteTheme, ...theme } })),
      updateThemeOverride: (page, theme) => set((s) => ({
        themeOverrides: { ...s.themeOverrides, [page]: { ...(s.themeOverrides[page] ?? {}), ...theme } },
      })),
      clearThemeOverride: (page) => set((s) => {
        const next = { ...s.themeOverrides };
        delete next[page];
        return { themeOverrides: next };
      }),
      updateSectionMedia: (section, media) => set((s) => ({
        sectionMedia: { ...s.sectionMedia, [section]: { ...s.sectionMedia[section], ...media } },
      })),
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

      // ── Bank accounts ──────────────────────────────────────────────────────
      addBankAccount: (account) => set((s) => ({
        bankAccounts: [...s.bankAccounts, { ...account, id: generateId("ba") }],
      })),
      updateBankAccount: (id, data) => set((s) => ({
        bankAccounts: s.bankAccounts.map((ba) => ba.id === id ? { ...ba, ...data } : ba),
      })),
      deleteBankAccount: (id) => set((s) => ({
        bankAccounts: s.bankAccounts.filter((ba) => ba.id !== id),
      })),

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
          activityLog: [
            { id: generateId("al"), message: "New Review", detail: `${t.name} left a ${t.rating}-star review`, timestamp: new Date().toISOString() },
            ...s.activityLog.slice(0, 49),
          ],
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

      addOrder: (order) => {
        const newOrder: Order = {
          ...order,
          id: `ord-${generateId("o")}`,
          status: "new" as const,
          paymentStatus: "pending_receipt" as const,
          orderedAt: new Date().toISOString(),
        };
        set((s) => ({
          orders: [...s.orders, newOrder],
          activityLog: [
            { id: generateId("al"), message: "New Order", detail: `Order from ${order.customerName} — ${order.items.length} item(s)`, timestamp: new Date().toISOString() },
            ...s.activityLog.slice(0, 49),
          ],
        }));
        return newOrder.id;
      },

      submitOrderReceipt: (id, receiptUrl, receiptFileName, bankAccountId) => {
        // Validate required fields before saving — never send undefined to Firestore
        if (!id) {
          console.error("[submitOrderReceipt] Missing order id — aborting");
          return;
        }
        if (!receiptUrl) {
          console.error("[submitOrderReceipt] Missing receiptUrl — aborting");
          return;
        }
        set((s) => ({
        orders: s.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                // Sanitize: never write undefined to Firestore; use empty string as fallback
                receiptUrl: receiptUrl ?? "",
                receiptFileName: receiptFileName ?? "",
                selectedBankAccountId: bankAccountId ?? "",
                receiptUploadedAt: new Date().toISOString(),
                paymentStatus: "pending_verification" as PaymentStatus,
              }
            : o
        ),
        activityLog: [
          { id: generateId("al"), message: "Receipt Uploaded", detail: `Customer uploaded payment receipt for Order #${id.replace("ord-", "").slice(0, 8)}`, timestamp: new Date().toISOString() },
          ...s.activityLog.slice(0, 49),
        ],
      }));
      },

      verifyOrderPayment: (id) => set((s) => ({
        orders: s.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                paymentStatus: "verified" as PaymentStatus,
                paymentVerifiedAt: new Date().toISOString(),
                status: "preparing" as OrderStatus,
              }
            : o
        ),
        activityLog: [
          { id: generateId("al"), message: "Payment Verified", detail: `Order #${id.replace("ord-", "").slice(0, 8)} — payment confirmed, now Preparing`, timestamp: new Date().toISOString() },
          ...s.activityLog.slice(0, 49),
        ],
      })),

      rejectOrderPayment: (id, reason) => set((s) => ({
        orders: s.orders.map((o) =>
          o.id === id
            ? {
                ...o,
                paymentStatus: "rejected" as PaymentStatus,
                paymentRejectedAt: new Date().toISOString(),
                paymentRejectionReason: reason,
              }
            : o
        ),
        activityLog: [
          { id: generateId("al"), message: "Payment Rejected", detail: `Order #${id.replace("ord-", "").slice(0, 8)} — ${reason || "no reason given"}`, timestamp: new Date().toISOString() },
          ...s.activityLog.slice(0, 49),
        ],
      })),

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

      hydrateFromTenant: (data: Partial<RestaurantStore>) => set(() => ({ ...data })),

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

/** Snapshot of the pure-data fields, used both to write to Firestore and to seed a brand-new tenant. */
export function getTenantSyncableState(): Record<string, unknown> {
  const s = useRestaurantStore.getState();
  const out: Record<string, unknown> = {};
  for (const key of TENANT_DATA_FIELDS) out[key] = (s as unknown as Record<string, unknown>)[key];
  return out;
}

// Captured once at module load, before any Firestore hydration — used to seed newly onboarded tenants.
export const DEFAULT_TENANT_STATE = getTenantSyncableState();
