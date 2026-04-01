import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  optionId?: string;
  name: string;
  optionName?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, optionId?: string) => void;
  updateQuantity: (productId: string, optionId: string | undefined, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(i => i.productId === item.productId && i.optionId === item.optionId);
          if (existingItem) {
            return {
              items: state.items.map(i => 
                (i.productId === item.productId && i.optionId === item.optionId) 
                  ? { ...i, quantity: i.quantity + item.quantity } 
                  : i
              )
            };
          }
          return { items: [...state.items, item] };
        });
      },
      removeItem: (productId, optionId) => {
        set((state) => ({
          items: state.items.filter(i => !(i.productId === productId && i.optionId === optionId))
        }));
      },
      updateQuantity: (productId, optionId, qty) => {
        set((state) => ({
          items: state.items.map(i => 
            (i.productId === productId && i.optionId === optionId) ? { ...i, quantity: Math.max(1, qty) } : i
          )
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    { name: 'smartstore-cart' }
  )
);
