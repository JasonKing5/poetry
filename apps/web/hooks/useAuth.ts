import { useUserStore } from '@/store/user';

export function useAuth() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  return {
    user,
    isAuthenticated: !!user,
    setUser,
    clearUser,
  };
}