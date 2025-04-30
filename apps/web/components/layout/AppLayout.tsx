'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useHasPermission } from '@/hooks/useHasPermission';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react'; 

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const isAdmin = useHasPermission('admin');
  const isUser = useHasPermission('user');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 py-2 shadow bg-white">
        <div className="flex items-center gap-2 text-xl font-bold">
          <LayoutGrid className="w-6 h-6" />
          <span>中华诗词</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          {isAdmin && <Link href="/user">用户管理</Link>}
          <Link href="/author">作者管理</Link>
        </nav>
      </header>
      <main className="flex-1 container py-6">{children}</main>
    </div>
  );
}