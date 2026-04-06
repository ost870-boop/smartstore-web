import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface RecentStore {
  items: any[];
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  addRecent: (item: any) => void;
  clearRecent: () => void;
}

export const useRecentStore = create<RecentStore>()(
  persist(
    (set) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      addRecent: (item) => set((state) => {
        const withoutOld = state.items.filter(i => i.id !== item.id);
        const newItems = [{ ...item, viewedAt: Date.now() }, ...withoutOld].slice(0, 50);
        return { items: newItems };
      }),
      clearRecent: () => set({ items: [] })
    }),
    {
      name: 'smartstore-recent',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
