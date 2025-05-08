'use client';

// import { useAuth } from '@/hooks/useAuth';

export default function MePage() {
  // const { isAuthenticated, user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Me 页面</h1>
      <p>这里是公开内容，所有人都可以访问。</p>
    </div>
  );
}