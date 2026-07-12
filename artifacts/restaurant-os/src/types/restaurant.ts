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
