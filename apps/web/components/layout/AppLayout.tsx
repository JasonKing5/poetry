'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useHasPermission } from '@/hooks/useHasPermission';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react'; 
import { Button } from '../ui/button';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const isAdmin = useHasPermission('admin');
  const isUser = useHasPermission('user');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 shadow bg-white">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <LayoutGrid className="w-6 h-6" />
          <span className='p-4 pl-0'>中华诗词</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/">首页</Link>
          <Link href="/poetry">诗词</Link>
          <Link href="/author">作者</Link>
          <Link href="/me">我的</Link>
          {isAdmin && <Link href="/user">用户</Link>}
        </nav>
        <div className='flex gap-4'>
          {/* {user ? <span>{user.name}</span> : <Link href="/login"><Button className='cursor-pointer' variant={'ghost'} onClick={() => window.location.href = '/login'}>登录</Button></Link>} */}
        </div>
      </header>
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