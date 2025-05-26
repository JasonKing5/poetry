'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReactNode } from "react";

interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
  redirectText?: string;
}

export function RequireAuth({ 
  children, 
  redirectTo = "/login",
  redirectText = "前往登录"
}: RequireAuthProps) {
  return (
    <div className="p-6 flex flex-col justify-center items-center min-h-[60vh]">
      <div className="mb-6 flex items-center gap-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <svg 
            className="h-6 w-6 text-blue-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">需要登录</h1>
      </div>
      <p className="text-gray-600 mb-6">
        请先登录以继续操作
      </p>
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/" className="px-6">
            返回首页
          </Link>
        </Button>
        <Button asChild>
          <Link href={redirectTo} className="px-6">
            {redirectText}
          </Link>
        </Button>
      </div>
      {children}
    </div>
  );
}