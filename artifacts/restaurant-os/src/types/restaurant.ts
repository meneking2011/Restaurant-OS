export interface RestaurantConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  address: { street: string; city: string; state: string; zip: string; country: string };
  phone: string;
  email: string;
  openingHours: { day: string; hours: string }[];
  socials: { platform: string; url: string }[];
  currency: string;
  currencySymbol: string;
  logo: string;
  heroImage: string;
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
}

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
