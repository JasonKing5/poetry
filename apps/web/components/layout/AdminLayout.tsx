'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('admin user', user);
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (!user?.roles?.includes('admin')) {
      router.push('/unauthorized');
    }
  }, [user, router, pathname]);

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user.roles.includes('admin')) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
