'use client';

import { useAuth } from '@/hooks/useAuth';
import { useHasPermission } from '@/hooks/useHasPermission';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const hasAccess = useHasPermission('admin');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !hasAccess) {
      router.replace('/login');
    }
  }, [isAuthenticated, hasAccess]);

  if (!isAuthenticated || !hasAccess) {
    return null; // 或者 Loading Spinner
  }

  return <>{children}</>;
}