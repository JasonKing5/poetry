'use client';

import { useAuth } from '@/hooks/useAuth';
import { RequireAuth } from '@/components/RequireAuth';
import { useAllLikes } from '@/services/like.service';
import { Like, Poem, Author, Collection } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import PoemCard from '@/components/PoemCard';
import CollectionCard from '@/components/CollectionCard';

export default function MePage() {
  const { isAuthenticated, user } = useAuth();
  const { data: likesPage, element: likesLoadingElement } = withLoadingError(useAllLikes({ currentUser: true, targetType: 'POEM' }));
  const { data: collectionsPage, element: collectionsLoadingElement } = withLoadingError(useAllLikes({ currentUser: true, targetType: 'COLLECTION' }));

  if (likesLoadingElement || collectionsLoadingElement) {
    return likesLoadingElement || collectionsLoadingElement;
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
        <div className="w-full">
          <h2 className="text-2xl font-bold tracking-tight mb-4">我喜欢的诗词合集</h2>
          <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collectionsPage?.list?.length > 0 ? (
              collectionsPage?.list.map((like: Like & { collection: Collection & { creator: { name: string } } }) => (
                <li className="w-full" key={like.id}>
                  <CollectionCard
                    id={like.collection?.id}
                    mode="simple"
                    title={like.collection?.title}
                    creator={like.collection?.creator.name}
                  />
                </li>
              ))
            ) : <div className='min-h-40 flex justify-center items-center'>无结果</div>
          }
          </ul>
          
        </div>
        {/* 我发布的诗词作品列表 */}
        
        {/* 我创建的诗词单子列表 */}
      </div>
      
    </div>
  );
}