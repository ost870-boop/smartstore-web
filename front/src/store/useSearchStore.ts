import { create } from 'zustand';

const RECENT_KEY = 'smartstore-recent-searches';
const MAX_RECENT = 8;

function loadRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}

function saveRecent(list: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
}

interface SearchStore {
  liveQuery: string;
  recentSearches: string[];
  setLiveQuery: (q: string) => void;
  clearQuery: () => void;
  addRecentSearch: (q: string) => void;
  removeRecentSearch: (q: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  liveQuery: '',
  recentSearches: loadRecent(),
  setLiveQuery: (q) => set({ liveQuery: q }),
  clearQuery: () => set({ liveQuery: '' }),
  addRecentSearch: (q) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    set((state) => {
      const updated = [trimmed, ...state.recentSearches.filter(s => s !== trimmed)].slice(0, MAX_RECENT);
      saveRecent(updated);
      return { recentSearches: updated };
    });
  },
  removeRecentSearch: (q) => set((state) => {
    const updated = state.recentSearches.filter(s => s !== q);
    saveRecent(updated);
    return { recentSearches: updated };
  }),
  clearRecentSearches: () => {
    saveRecent([]);
    set({ recentSearches: [] });
  },
}));

// 인기 검색어 (B2B 배관자재 기준 고정 목록 — 추후 API 연동 가능)
export const POPULAR_SEARCHES = [
  'PVC 엘보', '스텐 주름관', '볼밸브', '동 티', '수도계량기',
  'PE 수도관', '에어컨 냉매관', '스텐 부속',
];
