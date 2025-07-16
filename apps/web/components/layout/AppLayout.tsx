'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Settings, LogOut, Menu, X, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { href: '/', label: '首页', exact: true },
  { href: '/poem', label: '诗词', exact: false },
  { href: '/collection', label: '合集', exact: false },
  { href: '/author', label: '作者', exact: false },
  { href: '/search', label: 'AI搜索', exact: false },
  { href: '/me', label: '我的', exact: false },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { user, clearUser, isAuthenticated, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Add scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const renderNavItems = (isMobile = false) => (
    <nav className={`${isMobile ? 'flex flex-col space-y-4 p-4' : 'hidden md:flex items-center gap-4'}`}>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'transition-colors py-2 px-3 rounded-md',
            (item.exact ? pathname === item.href : pathname.startsWith(item.href))
              ? 'text-blue-600 font-bold bg-blue-50'
              : 'text-gray-700 hover:text-blue-400 hover:bg-gray-50',
            isMobile ? 'text-lg' : 'text-base'
          )}
        >
          {item.label}
        </Link>
      ))}
      {isAdmin && (
        <Link
          href="/admin"
          className={cn(
            'transition-colors py-2 px-3 rounded-md',
            pathname.startsWith('/admin')
              ? 'text-blue-600 font-bold bg-blue-50'
              : 'text-gray-700 hover:text-blue-400 hover:bg-gray-50',
            isMobile ? 'text-lg' : 'text-base'
          )}
        >
          后台管理
        </Link>
      )}
    </nav>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header 
        className={cn(
          'fixed w-full z-50 transition-all duration-300',
          isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white shadow-sm'
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Image src="/logo.png" width={30} height={30} alt="Logo" />
              <span className="text-xl">醉诗词</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex-1 md:flex md:justify-center">
              {renderNavItems()}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-expanded="false"
              >
                <span className="sr-only">打开主菜单</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* User actions */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative group">
                <Image 
                  src="/wechat.png" 
                  width={32} 
                  height={32} 
                  alt="Wechat" 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                />
                <div className="absolute right-0 mt-2 w-64 p-4 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Image src="/poetry_service1.png" width={300} height={300} alt="微信客服二维码" className="w-full h-auto" />
                  <p className="text-center mt-2 text-sm text-gray-600">扫码添加客服微信</p>
                </div>
              </div>
              
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
                  <Button variant="outline" className="cursor-pointer">
                    登录
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div 
          className={cn(
            'md:hidden transition-all duration-300 ease-in-out overflow-hidden',
            isMobileMenuOpen ? 'max-h-screen' : 'max-h-0'
          )}
        >
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 bg-white border-t">
            {renderNavItems(true)}
            
            {/* Mobile user actions */}
            {isAuthenticated ? (
              <div className="pt-4 border-t mt-4">
                <div className="flex items-center px-3 py-2">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-700">
                        {(user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.name || '用户'}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    设置
                  </Link>
                  <button
                    onClick={() => {
                      clearUser();
                      window.location.href = '/login';
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t mt-4">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  登录 / 注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      {/* Add padding top to account for fixed header */}
      <main className="flex-1 pt-22 pb-6 px-4 md:px-6 main-bg-ink overflow-auto">
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      <footer className="bg-white shadow p-4 text-center text-sm text-gray-500">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
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
        </div>
      </footer>
      
      {/* Add overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}