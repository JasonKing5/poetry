import { create } from 'zustand';

interface AuthorState {
  page: number;
  pageSize: number;
  setFilters: (filters: Partial<AuthorState>) => void;
  resetFilters: () => void;
}

export const useAuthorStore = create<AuthorState>((set) => ({
  page: 1,
  pageSize: 20,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ page: 1, pageSize: 10 }),
}));