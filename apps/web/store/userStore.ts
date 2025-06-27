import { create } from 'zustand';

interface UserState {
  page: number;
  pageSize: number;
  name: string;
  setFilters: (filters: Partial<UserState>) => void;
  resetFilters: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  page: 1,
  pageSize: 18,
  name: '',
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ page: 1, pageSize: 18, name: '' }),
}));