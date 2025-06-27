'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Users,
  BookOpen,
  BarChart3,
  Home,
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  {
    name: '首页总览',
    href: '/admin',
    icon: <Home className="h-5 w-5" />,
  },
  {
    name: '用户管理',
    href: '/admin/user',
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: '作者管理',
    href: '/admin/author',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    name: '诗词管理',
    href: '/admin/poetry',
    icon: <BarChart3 className="h-5 w-5" />,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden h-screen w-38 border-r bg-white md:flex md:flex-shrink-0 md:flex-col pr-4">
      <div className="flex h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-shrink-0 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
          </div>
          <nav className="mt-2 flex-1 space-y-1 px-2">
            {navItems.map((item) => {
              console.log('item:', item, item.href, pathname);
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
