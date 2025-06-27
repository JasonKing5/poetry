import { useUserStore } from '@/store/user';
import http from '@/lib/http';
import { useEffect, useState } from 'react';

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    // 状态恢复完成后设置加载状态为 false
    const unsubscribe = useUserStore.persist.onFinishHydration(() => {
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 登出函数
  const logout = async () => {
    try {
      await http.post('/auth/logout');
      console.log('Logout success');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearUser();
    }
  };

  return {
    user: user || null,
    isAuthenticated: !!user,
    isAdmin: user?.roles?.includes('admin') || false,
    setUser,
    clearUser: logout,
    isLoading,
  };
}