import { create } from 'zustand';

interface CollectionState {
  page: number;
  pageSize: number;
  title: string;
  setFilters: (filters: Partial<CollectionState>) => void;
  resetFilters: () => void;
}

export const useCollectionStore = create<CollectionState>((set) => ({
  page: 1,
  pageSize: 18,
  title: '',
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ page: 1, pageSize: 18, title: '' }),
}));