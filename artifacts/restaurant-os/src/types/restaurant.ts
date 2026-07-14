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
  /** Destination address for all outbound system notifications (new order/reservation/message alerts). Falls back to `email` when unset. */
  notificationEmail?: string;
}

// ── Payments ──────────────────────────────────────────────────────────────

/** Independently toggleable checkout payment methods. Availability at checkout also requires the active provider to support the method. */
export type PaymentMethodId = "card" | "bankTransfer" | "mobileWallet" | "cashOnDelivery";

export const PAYMENT_METHODS: { key: PaymentMethodId; label: string; description: string }[] = [
  { key: "card", label: "Card Payments", description: "Visa, Mastercard, Amex via your connected provider" },
  { key: "bankTransfer", label: "Bank Transfer", description: "Direct transfer to your connected account" },
  { key: "mobileWallet", label: "Mobile Wallets", description: "Mobile money & wallet payments" },
  { key: "cashOnDelivery", label: "Cash on Delivery", description: "Pay when the order arrives" },
];

/**
 * Payment providers a restaurant can connect. Each entry is a self-contained descriptor —
 * adding a new provider means adding one entry here plus one connect-flow implementation;
 * nothing else in the payment system (checkout, store, Payment Center UI) needs to change.
 */
export type PaymentProviderId = "stripe" | "paystack" | "flutterwave" | "square" | "paypal";

export interface PaymentProviderMeta {
  id: PaymentProviderId;
  name: string;
  description: string;
  supportedMethods: PaymentMethodId[];
  /** Whether this build ships a working connect flow for this provider, vs. a "coming soon" card. */
  live: boolean;
}

export const PAYMENT_PROVIDERS: PaymentProviderMeta[] = [
  { id: "stripe", name: "Stripe", description: "Global cards, bank debits & wallets via Stripe Connect", supportedMethods: ["card", "bankTransfer"], live: true },
  { id: "paystack", name: "Paystack", description: "Cards, bank transfer & mobile money across Africa", supportedMethods: ["card", "bankTransfer", "mobileWallet"], live: false },
  { id: "flutterwave", name: "Flutterwave", description: "Cards, bank transfer & mobile money across Africa", supportedMethods: ["card", "bankTransfer", "mobileWallet"], live: false },
  { id: "square", name: "Square", description: "Cards and in-person payments via Square", supportedMethods: ["card"], live: false },
  { id: "paypal", name: "PayPal", description: "PayPal wallet & card checkout", supportedMethods: ["card"], live: false },
];

export interface PaymentProviderConnection {
  connected: boolean;
  /** Provider-side connected account reference (e.g. Stripe `acct_...`). Never a secret key. */
  accountId?: string;
  /** Human-readable label for the connected account (business name / masked identifier). */
  accountLabel?: string;
  connectedAt?: string;
}

export interface PaymentSettings {
  activeProvider: PaymentProviderId | null;
  connections: Partial<Record<PaymentProviderId, PaymentProviderConnection>>;
  methodsEnabled: Record<PaymentMethodId, boolean>;
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
  paymentMethod: PaymentMethodId;
  paymentStatus: "unpaid" | "paid" | "failed";
  paymentProvider?: PaymentProviderId;
  /** Provider-side charge/session reference, set once a payment has been initialized. */
  paymentReference?: string;
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
