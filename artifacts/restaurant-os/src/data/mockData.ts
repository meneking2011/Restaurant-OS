import { RestaurantConfig, MenuItem, Service, Testimonial, GalleryImage } from "../types/restaurant";

export const restaurantConfig: RestaurantConfig = {
  id: "reassurance-demo-1",
  name: "Reassurance",
  tagline: "Uncompromising culinary excellence.",
  description: "A sanctuary of fine dining where every detail is considered. We focus on farm-to-table ingredients, exceptional service, and an atmosphere of refined elegance.",
  address: {
    street: "123 Sanctuary Way",
    city: "Holistic Springs",
    state: "CA",
    zip: "90210",
    country: "USA"
  },
  phone: "(555) RE-ASSUR (555-732-7787)",
  email: "reassurance.support@gmail.com",
  openingHours: [
    { day: "Monday", hours: "Closed" },
    { day: "Tuesday", hours: "5:00 PM - 10:00 PM" },
    { day: "Wednesday", hours: "5:00 PM - 10:00 PM" },
    { day: "Thursday", hours: "5:00 PM - 10:00 PM" },
    { day: "Friday", hours: "5:00 PM - 11:00 PM" },
    { day: "Saturday", hours: "5:00 PM - 11:00 PM" },
    { day: "Sunday", hours: "4:00 PM - 9:00 PM" }
  ],
  socials: [
    { platform: "Instagram", url: "#" },
    { platform: "Facebook", url: "#" },
    { platform: "TikTok", url: "#" }
  ],
  currency: "USD",
  currencySymbol: "$",
  logo: "flame",
  heroImage: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1920&q=80"
};

export const menuItems: MenuItem[] = [
  {
    id: "m1",
    name: "Seared Duck Breast",
    description: "Served with a rich pomegranate glaze and root vegetables.",
    price: 48,
    category: "mains",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
    available: true,
    tags: ["Gluten-Free"],
    featured: true,
    inspiredBy: "Autumn Harvests"
  },
  {
    id: "m2",
    name: "Herb-Crusted Halibut",
    description: "Line-caught halibut with lemon-herb crust and asparagus.",
    price: 55,
    category: "mains",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=600&q=80",
    available: true,
    tags: ["Sustainable Seafood"],
    featured: true,
    inspiredBy: "Coastal Traditions"
  },
  {
    id: "m3",
    name: "Heirloom Tomato & Burrata Caprese",
    description: "Fresh burrata, basil, balsamic reduction, olive oil.",
    price: 26,
    category: "starters",
    image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=600&q=80",
    available: true,
    tags: ["Vegetarian", "Farm-to-Table Ethos"],
    featured: false
  },
  {
    id: "m4",
    name: "A5 Wagyu Medallions",
    description: "Premium cuts served with a truffle wine reduction.",
    price: 110,
    category: "mains",
    image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=600&q=80",
    available: true,
    tags: ["Signature"],
    featured: true,
    inspiredBy: "Japanese Mastery"
  },
  {
    id: "m5",
    name: "Chocolate Avocado Mousse",
    description: "Rich dark chocolate folded with avocado and raspberry coulis.",
    price: 22,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80",
    available: true,
    tags: ["Vegan", "Plant-Based Artistry"],
    featured: true
  },
  {
    id: "m6",
    name: "Wild Mushroom Risotto",
    description: "Arborio rice, porcini broth, shaved parmesan, truffle oil.",
    price: 36,
    category: "mains",
    image: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=600&q=80",
    available: true,
    tags: ["Vegetarian"],
    featured: false
  },
  {
    id: "m7",
    name: "Smoked Old Fashioned",
    description: "Bourbon, bitters, orange peel, served under hickory smoke.",
    price: 24,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80",
    available: true,
    tags: ["Signature"],
    featured: false
  },
  {
    id: "m8",
    name: "Oysters on the Half Shell",
    description: "Half dozen seasonal oysters with mignonette.",
    price: 32,
    category: "starters",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80",
    available: true,
    tags: ["Raw Bar"],
    featured: false
  }
];

export const services: Service[] = [
  {
    id: "s1",
    title: "Seasonal Curated Dining",
    description: "Our tasting menus shift with the seasons, ensuring every ingredient is at its absolute peak. We work directly with local farmers to bring the harvest to your table.",
    icon: "leaf"
  },
  {
    id: "s2",
    title: "Private Events & Celebrations",
    description: "From corporate dinners to intimate anniversaries, our private dining rooms offer an exclusive atmosphere tailored entirely to your party's needs.",
    icon: "glass"
  },
  {
    id: "s3",
    title: "Concierge & White-Glove Service",
    description: "Experience highly managed dining. Our dedicated concierge team ensures your preferences, dietary requirements, and special requests are anticipated before you arrive.",
    icon: "bell"
  }
];

// No seeded/demo reviews — testimonials are populated exclusively by real
// guest submissions (see TestimonialsSection's review form) or by the admin.
export const testimonials: Testimonial[] = [];

export const galleryImages: GalleryImage[] = [
  { id: "g1", src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80", alt: "Elegant table setting with candlelight", category: "Ambiance" },
  { id: "g2", src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80", alt: "Restaurant dining room ambiance", category: "Interior" },
  { id: "g3", src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80", alt: "Beautifully plated gourmet dish", category: "Food" },
  { id: "g4", src: "https://images.unsplash.com/photo-1482049016688-2d3e1da311f5?auto=format&fit=crop&w=800&q=80", alt: "Fine dining plate presentation", category: "Food" },
  { id: "g5", src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80", alt: "Restaurant interior with warm lighting", category: "Interior" },
  { id: "g6", src: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80", alt: "Artisan bread and wine pairing", category: "Food" },
];
