import { create } from "zustand";
import { Image } from "@/types";

interface SearchFilters {
  grade: string[];
  subject: string[];
  type: string[];
  premium: boolean | null;
  syllabus: string[];
  medium: string[];
}

interface SearchState {
  query: string;
  filters: SearchFilters;
  sort: "relevant" | "popular" | "newest";
  results: Image[];
  total: number;
  page: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;

  setQuery: (q: string) => void;
  setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
  clearFilters: () => void;
  setSort: (sortMode: "relevant" | "popular" | "newest") => void;
  search: (isLoadMore?: boolean) => Promise<void>;
  loadMore: () => void;
}

const initialFilters: SearchFilters = {
  grade: [],
  subject: [],
  type: [],
  premium: null,
  syllabus: [],
  medium: [],
};

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  filters: { ...initialFilters },
  sort: "relevant",
  results: [],
  total: 0,
  page: 1,
  loading: false,
  error: null,
  hasMore: false,

  setQuery: (q) => {
    set({ query: q, page: 1 });
    get().search();
  },

  setFilter: (key, value) => {
    const updatedFilters = { ...get().filters, [key]: value };
    set({ filters: updatedFilters, page: 1 });
    get().search();
  },

  clearFilters: () => {
    set({ filters: { ...initialFilters }, page: 1 });
    get().search();
  },

  setSort: (sortMode) => {
    set({ sort: sortMode, page: 1 });
    get().search();
  },

  search: async (isLoadMore = false) => {
    set({ loading: true, error: null });
    const { query, filters, sort, page, results } = get();

    try {
      // Build API query parameters
      const params = new URLSearchParams();
      if (query) params.append("q", query);
      if (sort) params.append("sort", sort);
      params.append("page", String(isLoadMore ? page + 1 : 1));

      // Append multi-select filters
      filters.grade.forEach((g) => params.append("grade", g));
      filters.subject.forEach((s) => params.append("subject", s));
      filters.type.forEach((t) => params.append("type", t));
      filters.syllabus.forEach((sy) => params.append("syllabus", sy));
      filters.medium.forEach((m) => params.append("medium", m));
      if (filters.premium !== null) {
        params.append("premium", String(filters.premium));
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search query failed");

      const data = await res.json();

      set({
        results: isLoadMore ? [...results, ...data.images] : data.images,
        total: data.total,
        page: isLoadMore ? page + 1 : 1,
        hasMore: data.hasMore,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || "An error occurred during search",
        loading: false,
      });
    }
  },

  loadMore: () => {
    const { hasMore, loading } = get();
    if (hasMore && !loading) {
      get().search(true);
    }
  },
}));
