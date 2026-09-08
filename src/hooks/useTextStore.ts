import { create } from 'zustand';

type TextStore = {
  text: string;
  vendorsCount: number;
  searchQuery: string;
  isSearchOpen: boolean;
  keyword: string;
  setText: (t: string) => void;
  setVendorsCount: (count: number) => void;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (isOpen: boolean) => void;
  setKeyword: (keyword: string) => void;
  toggleSearchOpen: () => void;
  append: (t: string) => void;
  clear: () => void;
};

export const useTextStore = create<TextStore>((set) => ({
  text: '',
  vendorsCount: 0,
  searchQuery: '',
  isSearchOpen: false,
  keyword: '',
  setText: (t) => set({ text: t }),
  setVendorsCount: (count) => set({ vendorsCount: count }),
  setSearchQuery: (query) => set({ searchQuery: query.trim() }),
  setIsSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
  setKeyword: (keyword) => set({ keyword: keyword.trim() }),
  toggleSearchOpen: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
  append: (t) => set((s) => ({ text: s.text + t })),
  clear: () => set({ text: '', keyword: '' }),
}));
