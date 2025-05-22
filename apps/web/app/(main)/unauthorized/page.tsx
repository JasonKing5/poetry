'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function UnauthorizedPage() {

  return (
    <div className="p-6 flex flex-col justify-center items-center">
      <div className="mb-6 flex items-center gap-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <svg 
            className="h-6 w-6 text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">访问受限</h1>
      </div>
      <p className="text-gray-600 mb-6">
        抱歉，您没有权限访问此页面
      </p>
      <Button asChild>
        <Link href="/" className="px-6">
          返回首页
        </Link>
      </Button>
    </div>
  );
}