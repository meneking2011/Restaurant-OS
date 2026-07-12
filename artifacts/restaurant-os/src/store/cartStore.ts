import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem } from '../types/restaurant';

interface CartState {
  items: CartItem[];
  addItem: (menuItem: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (menuItem: MenuItem) =>
        set((state) => {
          const existing = state.items.find((item) => item.menuItem.id === menuItem.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.menuItem.id === menuItem.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { menuItem, quantity: 1 }] };
        }),
      removeItem: (id: string) =>
        set((state) => ({
          items: state.items.filter((item) => item.menuItem.id !== id),
        })),
      updateQuantity: (id: string, qty: number) =>
        set((state) => {
          if (qty <= 0) {
            return { items: state.items.filter((item) => item.menuItem.id !== id) };
          }
          return {
            items: state.items.map((item) =>
              item.menuItem.id === id ? { ...item, quantity: qty } : item
            ),
          };
        }),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.menuItem.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'restaurant-cart',
    }
  )
);
