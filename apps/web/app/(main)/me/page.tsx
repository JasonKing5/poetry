'use client';

import { useAuth } from '@/hooks/useAuth';
import { RequireAuth } from '@/components/RequireAuth';
import { useAllLikes } from '@/services/like.service';
import { Like, Poem, Author } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import PoemCard from '@/components/PoemCard';

export default function MePage() {
  const { isAuthenticated, user } = useAuth();
  const { data: likesPage, element: likesLoadingElement } = withLoadingError(useAllLikes({ currentUser: true, targetType: 'POEM' }));

  if (likesLoadingElement) {
    return likesLoadingElement;
  }
  if (!isAuthenticated) {
    return <RequireAuth children={<></>} />;
  }

  return (
    <div className="flex items-center justify-center gap-2 w-full">
      <div className="max-w-5xl w-full">
        {/* 我喜欢的诗词作品列表 */}
        <div className="w-full">
          <h2 className="text-2xl font-bold tracking-tight mb-4">我喜欢的诗词作品</h2>
          <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {likesPage?.list?.length > 0 ? (
              likesPage?.list.map((like: Like & { poem: Poem & { author: Author } }) => (
                <li className="w-full" key={like.id}>
                  <PoemCard
                    id={like.poem?.id}
                    mode="simple"
                    title={like.poem?.title}
                    author={String(like.poem?.author?.name)}
                    dynasty={like.poem?.dynasty}
                  />
                </li>
              ))
            ) : <div className='min-h-40 flex justify-center items-center'>无结果</div>
          }
          </ul> 
        </div>
        {/* 我喜欢的诗词作者列表 */}
        
        {/* 我发布的诗词作品列表 */}
        
        {/* 我创建的诗词单子列表 */}
      </div>
      
    </div>
  );
}