'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useHasPermission } from '@/hooks/useHasPermission';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react'; 
import { Button } from '../ui/button';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { user } = useAuth();
  const isAdmin = useHasPermission('admin');
  const isUser = useHasPermission('user');

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-6">{children}</main>
      <footer className="bg-white shadow p-4 text-center text-sm text-gray-500 flex items-center justify-center gap-8">
        <div>
          ICP备案：
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            豫ICP备2022004823号-1
          </a>
        </div>
        <div>
          &copy; {new Date().getFullYear()} 中华诗词
        </div>
      </footer>
    </div>
  );
}