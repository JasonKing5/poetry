import { create } from 'zustand';

type User = {
  id: string;
  name: string;
  email: string;
  roles: string[];
};

type LanguageState = {
  language: 'zh' | 'en';
  setLanguage: (lang: 'zh' | 'en') => void;
};

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'zh',
  setLanguage: (lang) => set({ language: lang }),
}));