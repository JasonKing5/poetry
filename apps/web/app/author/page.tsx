'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AuthorPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Author 页面</h1>
      <p>这里是公开内容，所有人都可以访问。</p>

      {isAuthenticated && (
        <div className="mt-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            编辑内容（{user?.name}）
          </button>
        </div>
      )}
    </div>
  );
}