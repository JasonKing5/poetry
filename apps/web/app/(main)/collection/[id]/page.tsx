'use client';

import { useParams } from 'next/navigation';
import { useGet } from '@/lib/request';
import { Collection, Poem } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import { constants } from '@repo/common';
import PoemCard from '@/components/PoemCard';

const { DYNASTY_MAP } = constants;

export default function CollectionDetailPage() {
  const { id } = useParams(); // 获取路由参数
  const { data, element } = withLoadingError(useGet<Collection & { creator: { name: string } }>(`/collection/${id}`));
  const { data: poems, element: poemsElement } = withLoadingError(useGet<Poem[]>(`/collection/${id}/poems`));
  if (element || poemsElement) {
    return element || poemsElement;
  }

  const getShortContent = (content: string[], length: number) => {
    if (content.length <= length) {
      return content;
    }
    return content.slice(0, length);
  };

  return (
    <div className="w-full flex justify-center flex-col items-center">
      <div className='max-w-5xl w-full flex flex-col items-center justify-center py-2'>
        <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
        <p className="text-gray-600 mb-1">创建者：{data.creator.name}</p>
        <div className="w-full flex flex-wrap gap-2 mt-2 text-gray-800 mb-2 leading-relaxed flex-col items-start justify-start">
          合集简介：{data.description ? data.description : '暂无简介'}
        </div>
        <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 w-full">
          {!poemsElement && poems?.length > 0 ? (
            poems.map((poem: Poem & { author: { name: string }, likes?: { count: number; isLiked: boolean } }) => (
              <li className="w-full" key={poem.id}>
                <PoemCard
                  id={poem.id}
                  title={poem.title}
                  author={poem.author.name}
                  dynasty={poem.dynasty}
                  content={getShortContent(poem.content, 8)}
                  likesCount={poem.likes?.count || 0}
                  isLiked={poem.likes?.isLiked || false}
                />
              </li>
            ))
          ) : <div className='min-h-40 flex justify-center items-center'>无结果</div>}
        </ul>
      </div>
    </div>
  );
}