import { useUserStore } from '@/store/user';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// 验证 token 有效性的辅助函数
async function validateToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/validate');
    if (!response.ok) return false;
    const data = await response.json();
    return data.valid === true;
  } catch (error) {
    console.error('Token validation failed:', error);
    return false;
  }
}

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  // 检查并更新认证状态
  const checkAuth = async (): Promise<boolean> => {
    if (!user) return false;
    
    const isValid = await validateToken();
    if (!isValid) {
      clearUser();
    }
    return isValid;
  };

  // 初始化时检查认证状态
  useEffect(() => {
    let mounted = true;
    let timer: NodeJS.Timeout;

    const verifyAuth = async () => {
      if (user) {
        const isValid = await validateToken();
        if (mounted && !isValid) {
          clearUser();
        }
      }
      if (mounted) {
        setIsLoading(false);
      }
    };

    verifyAuth();

    // 定期检查 token 状态（每5分钟）
    timer = setInterval(verifyAuth, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [user, pathname]); // 当路由变化时也检查一次

  // 登出函数
  const logout = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearUser();
    }
  };

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading,
    setUser,
    clearUser: logout, // 使用封装的登出函数
    checkAuth, // 暴露检查方法供页面手动调用
  };
}