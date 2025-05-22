'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  BookOpen,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

type NavItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
};

const navItems: NavItem[] = [
  {
    name: '控制台',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    exact: true,
  },
  {
    name: '用户管理',
    href: '/admin/users',
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: '内容管理',
    href: '/admin/content',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    name: '数据分析',
    href: '/admin/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    name: '系统设置',
    href: '/admin/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { clearUser } = useAuth();

  return (
    <div className="hidden h-screen w-64 border-r bg-white md:flex md:flex-shrink-0 md:flex-col">
      <div className="flex h-0 flex-1 flex-col pt-5">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-shrink-0 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname?.startsWith(item.href);

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
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => clearUser()}
          >
            <LogOut className="mr-3 h-5 w-5" />
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}
