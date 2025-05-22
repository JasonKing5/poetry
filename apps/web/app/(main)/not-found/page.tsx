'use client'

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-200">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">页面未找到</h1>
          <p className="mt-4 text-gray-600">
            抱歉，您访问的页面不存在或已被移除
          </p>
        </div>
        <Button asChild>
          <Link href="/" className="px-8 py-6 text-base">
            返回首页
          </Link>
        </Button>
      </div>
    </div>
  );
}