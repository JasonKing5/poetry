'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { RequireAuth } from '@/components/RequireAuth';
import { useAllLikes } from '@/services/like.service';
import { Like } from '@repo/types';

export default function MePage() {
  const { isAuthenticated, user } = useAuth();
  const { data: likesPage } = useAllLikes({ currentUser: true });

  if (!isAuthenticated) {
    return <RequireAuth children={<></>} />;
  }

  return (
    <div className="flex items-center gap-2 w-full">
      {/* 我喜欢的诗词作品列表 */}
      <div className="w-full">
        <h2 className="text-2xl font-bold tracking-tight">我喜欢的诗词作品</h2>
        <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {likesPage?.list?.map((like: Like) => (
            <li key={like.id}>
              <div className="bg-white rounded-lg shadow-sm px-4 py-3 mb-6 border border-gray-100">
                <h3 className="text-lg font-semibold mb-2">诗词作品 {like.id}</h3>
                <p className="text-gray-600">描述信息</p>
              </div>
            </li>
          ))}
        </ul> 
      </div>
      {/* 我喜欢的诗词作者列表 */}
      
      {/* 我发布的诗词作品列表 */}
      
      {/* 我创建的诗词单子列表 */}
      
    </div>
  );
}