import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type User = {
  id: number;
  name: string;
  email: string;
  roles: string[];
};

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-storage', // 存储键名
      storage: createJSONStorage(() => localStorage), // 使用 localStorage
    }
  )
);