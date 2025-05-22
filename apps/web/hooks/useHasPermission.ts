import { useAuth } from './useAuth';

/**
 * 权限判断 Hook
 * @param role 'admin' | 'user' 等
 * @returns boolean 是否有该权限
 */
export function useHasPermission(role: string): boolean {
  const { user } = useAuth();
  console.log('useHasPermission user', user);
  return user?.roles?.some(r => r === role) || false;
}