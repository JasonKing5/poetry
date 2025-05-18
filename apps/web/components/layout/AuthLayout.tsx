'use client';

import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 p-6 flex items-center">{children}</main>
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