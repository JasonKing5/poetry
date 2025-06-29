'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (!user?.roles?.includes('admin')) {
      router.push('/unauthorized');
    }
  }, [user, router, pathname, isLoading]);

  return (
    <div className="flex flex-1">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden pl-4">
        {children}
      </div>
    </div>
  );
}
