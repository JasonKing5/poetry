import { create } from 'zustand';

interface PoemState {
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
  setFilters: (filters: Partial<PoemState>) => void;
  resetFilters: () => void;
}

export const usePoemStore = create<PoemState>((set) => ({
  page: 1,
  pageSize: 12,
  title: '',
  type: '',
  tags: [],
  source: '',
  dynasty: '',
  submitter: '',
  author: '',
  status: 'approved',
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  resetFilters: () => set({ page: 1, pageSize: 12, title: '', type: '', tags: [], source: '', dynasty: '', submitter: '', author: '', status: 'approved' }),
}));