import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  RestaurantConfig,
  MenuItem,
  Service,
  Testimonial,
  GalleryImage,
  Order,
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
  occasion?: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
}

interface RestaurantStore {
  config: RestaurantConfig;
  menuItems: MenuItem[];
  services: Service[];
  testimonials: Testimonial[];
  reservations: Reservation[];
  galleryImages: GalleryImage[];
  orders: Order[];

  updateConfig: (config: Partial<RestaurantConfig>) => void;

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
  deleteReservation: (id: string) => void;

  addGalleryImage: (image: Omit<GalleryImage, "id">) => void;
  updateGalleryImage: (id: string, image: Partial<GalleryImage>) => void;
  deleteGalleryImage: (id: string) => void;

  updateOrderStatus: (id: string, status: Order["status"]) => void;
}

const mockReservations: Reservation[] = [
  {
    id: "r1",
    name: "James Harrington",
    email: "james.h@example.com",
    phone: "(555) 234-5678",
    date: "2026-07-18",
    time: "7:00 PM",
    guests: 2,
    occasion: "Anniversary",
    notes: "Please prepare a rose and a small cake if possible.",
    status: "confirmed",
    createdAt: "2026-07-10T14:23:00Z",
  },
  {
    id: "r2",
    name: "Priya Anand",
    email: "p.anand@example.com",
    phone: "(555) 987-6543",
    date: "2026-07-19",
    time: "8:30 PM",
    guests: 4,
    status: "pending",
    createdAt: "2026-07-11T09:05:00Z",
  },
  {
    id: "r3",
    name: "Carlos Mendez",
    email: "carlos.m@example.com",
    phone: "(555) 456-7890",
    date: "2026-07-20",
    time: "6:30 PM",
    guests: 6,
    occasion: "Birthday",
    status: "pending",
    createdAt: "2026-07-11T17:42:00Z",
  },
  {
    id: "r4",
    name: "Sophie Laurent",
    email: "sophie.l@example.com",
    phone: "(555) 321-0987",
    date: "2026-07-15",
    time: "7:30 PM",
    guests: 2,
    status: "cancelled",
    createdAt: "2026-07-08T11:15:00Z",
  },
  {
    id: "r5",
    name: "Oliver Chen",
    email: "oliver.c@example.com",
    phone: "(555) 654-3210",
    date: "2026-07-22",
    time: "9:00 PM",
    guests: 3,
    occasion: "Business Dinner",
    status: "confirmed",
    createdAt: "2026-07-12T08:30:00Z",
  },
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

      updateConfig: (partial) =>
        set((s) => ({ config: { ...s.config, ...partial } })),

      addMenuItem: (item) =>
        set((s) => ({
          menuItems: [...s.menuItems, { ...item, id: generateId("m") }],
        })),
      updateMenuItem: (id, partial) =>
        set((s) => ({
          menuItems: s.menuItems.map((m) =>
            m.id === id ? { ...m, ...partial } : m
          ),
        })),
      deleteMenuItem: (id) =>
        set((s) => ({ menuItems: s.menuItems.filter((m) => m.id !== id) })),

      addService: (service) =>
        set((s) => ({
          services: [...s.services, { ...service, id: generateId("s") }],
        })),
      updateService: (id, partial) =>
        set((s) => ({
          services: s.services.map((sv) =>
            sv.id === id ? { ...sv, ...partial } : sv
          ),
        })),
      deleteService: (id) =>
        set((s) => ({ services: s.services.filter((sv) => sv.id !== id) })),

      addTestimonial: (t) =>
        set((s) => ({
          testimonials: [...s.testimonials, { ...t, id: generateId("t") }],
        })),
      updateTestimonial: (id, partial) =>
        set((s) => ({
          testimonials: s.testimonials.map((t) =>
            t.id === id ? { ...t, ...partial } : t
          ),
        })),
      deleteTestimonial: (id) =>
        set((s) => ({
          testimonials: s.testimonials.filter((t) => t.id !== id),
        })),

      addReservation: (data) =>
        set((s) => ({
          reservations: [
            ...s.reservations,
            {
              ...data,
              id: generateId("r"),
              status: "pending" as const,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateReservationStatus: (id, status) =>
        set((s) => ({
          reservations: s.reservations.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        })),
      deleteReservation: (id) =>
        set((s) => ({
          reservations: s.reservations.filter((r) => r.id !== id),
        })),

      addGalleryImage: (image) =>
        set((s) => ({
          galleryImages: [...s.galleryImages, { ...image, id: generateId("g") }],
        })),
      updateGalleryImage: (id, partial) =>
        set((s) => ({
          galleryImages: s.galleryImages.map((g) =>
            g.id === id ? { ...g, ...partial } : g
          ),
        })),
      deleteGalleryImage: (id) =>
        set((s) => ({
          galleryImages: s.galleryImages.filter((g) => g.id !== id),
        })),

      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status } : o
          ),
        })),
    }),
    {
      name: "restaurant-os-data",
    }
  )
);
