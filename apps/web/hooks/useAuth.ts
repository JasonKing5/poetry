import { useUserStore } from '@/store/user';
import http from '@/lib/http';

export function useAuth() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  // 登出函数
  const logout = async () => {
    try {
      await http.post('/auth/signout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearUser();
    }
  };

  return {
    user: user || null,
    isAuthenticated: !!user,
    setUser,
    clearUser: logout,
  };
}