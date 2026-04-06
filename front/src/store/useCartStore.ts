import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, optionId?: string) => void;
  updateQuantity: (productId: string, optionId: string | undefined, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      addItem: (item) => set((state) => {
        const existing = state.items.find(
          i => i.productId === item.productId && i.optionId === item.optionId
        );
        if (existing) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId && i.optionId === item.optionId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          };
        }
        return { items: [...state.items, item] };
      }),

      removeItem: (productId, optionId) => set((state) => ({
        items: state.items.filter(
          i => !(i.productId === productId && i.optionId === optionId)
        )
      })),

      updateQuantity: (productId, optionId, qty) => set((state) => ({
        items: state.items.map(i =>
          i.productId === productId && i.optionId === optionId
            ? { ...i, quantity: Math.max(1, qty) }
            : i
        )
      })),

      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'smartstore-cart',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
