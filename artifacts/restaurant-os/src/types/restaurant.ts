export interface RestaurantConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  address: { street: string; city: string; state: string; zip: string; country: string; lat?: number; lng?: number };
  phone: string;
  email: string;
  openingHours: { day: string; hours: string }[];
  socials: { platform: string; url: string }[];
  currency: string;
  currencySymbol: string;
  logo: string;
  heroImage: string;
  /** Full URL pasted from Google Maps (share/embed link). Used by "Find Us" — opened directly, never embedded/parsed. */
  googleMapsUrl?: string;
}

export interface SiteTheme {
  primaryHex: string;
  primaryColor: string;
  secondaryHex: string;
  accentHex: string;
  backgroundHex: string;
  cardBgHex: string;
  foregroundHex: string;
  mutedFgHex: string;
  linkColorHex: string;
  navBgHex: string;
  buttonStyle: "rounded" | "sharp" | "pill";
  buttonTextColorHex: string;
  buttonBorderWidth: number;
  borderRadius: number;
  shadowIntensity: number;
  fontHeading: string;
  fontBody: string;
  lightMode: boolean;
  heroImageUrl: string;
  heroVideoUrl: string;
  heroOverlayOpacity: number;

  // ── Design Tokens (extended) ──────────────────────────────────────────────
  surfaceHex: string;
  borderHex: string;
  buttonBgHex: string;
  buttonHoverHex: string;
  footerBgHex: string;
  footerTextHex: string;
  baseFontSizePx: number;
  headingWeight: "normal" | "medium" | "semibold" | "bold";
  cardRadius: number;
  cardShadowIntensity: number;
  containerWidth: "narrow" | "default" | "wide";
  sectionSpacing: "compact" | "comfortable" | "spacious";
  animationsEnabled: boolean;
  animationSpeed: "slow" | "normal" | "fast";
}

/** Pages that support per-page Design Token overrides. */
export type DesignTokenPage =
  | "home" | "menu" | "services" | "gallery" | "reservations" | "contact" | "checkout";

export const DESIGN_TOKEN_PAGES: { key: DesignTokenPage; label: string; path: string }[] = [
  { key: "home",         label: "Home",         path: "/" },
  { key: "menu",         label: "Menu",         path: "/menu" },
  { key: "services",     label: "Services",     path: "/services" },
  { key: "gallery",      label: "Gallery",      path: "/about" },
  { key: "reservations", label: "Reservations", path: "/reservations" },
  { key: "contact",      label: "Contact",      path: "/contact" },
  { key: "checkout",     label: "Checkout",     path: "/checkout" },
];

/** Independent image/background manager for a single website section. */
export interface SectionMediaConfig {
  images: string[];
  backgroundImage: string;
  overlayColor: string;
  overlayOpacity: number; // 0-100
  backgroundColor: string;
  useBackgroundColor: boolean;
}

export type SectionKey =
  | "hero" | "featuredDishes" | "about" | "services" | "gallery" | "cta" | "footer";

export const SECTION_KEYS: { key: SectionKey; label: string }[] = [
  { key: "hero",           label: "Hero" },
  { key: "featuredDishes", label: "Featured Dishes" },
  { key: "about",          label: "About" },
  { key: "services",       label: "Services" },
  { key: "gallery",        label: "Gallery" },
  { key: "cta",            label: "Call To Action" },
  { key: "footer",         label: "Footer" },
];

export interface AdminTheme {
  primaryHex: string;
  sidebarBgHex: string;
  mainBgHex: string;
  buttonHex: string;
}

export interface QuickControls {
  restaurantOpen: boolean;
  acceptReservations: boolean;
  onlineOrders: boolean;
  whatsapp: boolean;
  maintenanceMode: boolean;
}

export interface ActivityLogEntry {
  id: string;
  message: string;
  detail: string;
  timestamp: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  category: 'starters' | 'mains' | 'desserts' | 'drinks';
  image: string;
  available: boolean;
  tags: string[];
  inspiredBy?: string;
  featured?: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  date: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category?: string;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  items: OrderItem[];
  paymentMethod: "card" | "bank";
  status: "new" | "preparing" | "ready" | "completed" | "cancelled";
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount?: number;
  totalAmount: number;
  specialNotes?: string;
  orderedAt: string;
}

export interface CustomPageSection {
  id: string;
  type: "hero" | "text" | "cta" | "image-text";
  heading?: string;
  subheading?: string;
  body?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  alignment?: "left" | "center" | "right";
}

export interface CustomPage {
  id: string;
  name: string;
  slug: string;
  visible: boolean;
  showInNav: boolean;
  showInFooter: boolean;
  sections: CustomPageSection[];
  createdAt: string;
}
