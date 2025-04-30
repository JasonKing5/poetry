'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user';

export const useRouteGuard = () => {
  const user = useUserStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);
};