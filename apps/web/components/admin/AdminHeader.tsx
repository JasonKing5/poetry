'use client';

import { User } from '@repo/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

type AdminHeaderProps = {
  user: Omit<User, 'password' | 'createdAt' | 'updatedAt'>;
  onToggleSidebar?: () => void;
};

export function AdminHeader({ user, onToggleSidebar }: AdminHeaderProps) {
  const { clearUser } = useAuth();

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-lg font-medium text-gray-900">
            {getHeaderTitle()}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <UserIcon className="h-5 w-5" />
                {/* {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || 'User'}
                    className="rounded-full"
                    width={32}
                    height={32}
                  />
                ) : (
                  <UserIcon className="h-5 w-5" />
                )} */}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>个人资料</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => clearUser()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function getHeaderTitle() {
  const pathname = window.location.pathname;
  
  if (pathname.startsWith('/admin/dashboard')) return '控制台';
  if (pathname.startsWith('/admin/users')) return '用户管理';
  if (pathname.startsWith('/admin/content')) return '内容管理';
  if (pathname.startsWith('/admin/analytics')) return '数据分析';
  if (pathname.startsWith('/admin/settings')) return '系统设置';
  
  return '管理后台';
}
