import { create } from 'zustand';

interface PoetryState {
  page: number;
  pageSize: number;
  title: string;
  type: string;
  tags: string[];
  source: string;
  dynasty: string;
  submitter: string;
  author: string;
  status: string;
  setFilters: (filters: Partial<PoetryState>) => void;
  resetFilters: () => void;
}

export const usePoetryStore = create<PoetryState>((set) => ({
  page: 1,
  pageSize: 10,
  title: '',
  type: '',
  tags: [],
  source: '',
  dynasty: '',
  submitter: '',
  author: '',
  status: 'approved',
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ page: 1, pageSize: 10, title: '', type: '', tags: [], source: '', dynasty: '', submitter: '', author: '', status: 'approved' }),
}));