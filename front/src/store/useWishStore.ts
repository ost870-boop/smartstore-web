import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishStore {
  items: any[];
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  toggleItem: (item: any) => void;
  isLiked: (id: string) => boolean;
  getCount: () => number;
}

export const useWishStore = create<WishStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      toggleItem: (item) => set((state) => {
        const exists = state.items.find(i => i.id === item.id);
        if (exists) {
          return { items: state.items.filter(i => i.id !== item.id) };
        }
        return {
          items: [
            { id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, brand: item.brand, savedAt: Date.now() },
            ...state.items,
          ],
        };
      }),

      isLiked: (id) => get().items.some(i => i.id === id),
      getCount: () => get().items.length,
    }),
    {
      name: 'smartstore-wishlist',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
