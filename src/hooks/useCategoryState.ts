import { create } from "zustand";

type CategoryRouteParams = {
  brand?: string | null;
  category: string;
};

type CategoryFilters = {
  search: string;
  sort: "newest" | "price_asc" | "price_desc";
  page: number;
};

type CategoryState = {
  route: CategoryRouteParams | null;
  filters: CategoryFilters;
  setRoute: (route: CategoryRouteParams) => void;
  setFilters: (filters: Partial<CategoryFilters>) => void;
  reset: () => void;
};

export const useCategoryState = create<CategoryState>((set) => ({
  route: null,
  filters: { search: "", sort: "newest", page: 1 },
  setRoute: (route) => set({ route }),
  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
  reset: () => set({ route: null, filters: { search: "", sort: "newest", page: 1 } }),
}));
