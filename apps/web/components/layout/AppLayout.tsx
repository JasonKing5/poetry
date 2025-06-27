'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, clearUser, isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 shadow bg-white">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Image src="/logo.png" width={30} height={30} alt="Logo" />
          <span className='p-4 pl-0'>醉诗词</span>
        </Link>
        <nav className="flex items-center gap-6 text-xl">
          <Link
            href="/"
            className={cn(
              "transition-colors",
              pathname === "/" 
                ? "text-blue-600 font-bold" 
                : "text-gray-700 hover:text-blue-400"
            )}
          >
            首页
          </Link>
          <Link
            href="/poetry"
            className={cn(
              "transition-colors",
              pathname === "/poetry" 
                ? "text-blue-600 font-bold" 
                : "text-gray-700 hover:text-blue-400"
            )}
          >
            诗词
          </Link>
          <Link
            href="/poetry-list"
            className={cn(
              "transition-colors",
              pathname === "/poetry-list" 
                ? "text-blue-600 font-bold" 
                : "text-gray-700 hover:text-blue-400"
            )}
          >
            诗单
          </Link>
          <Link
            href="/author"
            className={cn(
              "transition-colors",
              pathname.startsWith("/author") 
                ? "text-blue-600 font-bold" 
                : "text-gray-700 hover:text-blue-400"
            )}
          >
            作者
          </Link>
          <Link
            href="/me"
            className={cn(
              "transition-colors",
              pathname.startsWith("/me") 
                ? "text-blue-600 font-bold" 
                : "text-gray-700 hover:text-blue-400"
            )}
          >
            我的
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "transition-colors",
                pathname.startsWith("/admin") 
                  ? "text-blue-600 font-bold" 
                  : "text-gray-700 hover:text-blue-400"
              )}
            >
              后台管理
            </Link>
          )}
        </nav>
        <div className='flex gap-4'>
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 p-0 rounded-full hover:bg-accent hover:text-accent-foreground cursor-pointer"
                >
                  <div className="flex items-center justify-center h-full w-full rounded-full bg-primary/10">
                    <span className="text-xl font-medium">
                      {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || '用户'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>设置</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => {
                    clearUser();
                    window.location.href = '/login';
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button className='cursor-pointer' variant={'ghost'} onClick={() => window.location.href = '/login'}>
                登录
              </Button>
            </Link>
          )}
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
            className="text-gray-500 hover:underline ml-1"
          >
            豫ICP备2022004823号-1
          </a>
        </div>
        <div>
          &copy; {new Date().getFullYear()} 醉诗词
        </div>
      </footer>
    </div>
  );
}