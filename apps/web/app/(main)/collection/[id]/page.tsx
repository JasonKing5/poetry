'use client';

import { useParams } from 'next/navigation';
import { useGet } from '@/lib/request';
import { Collection, Poem } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import { constants } from '@repo/common';

const { DYNASTY_MAP } = constants;

export default function CollectionDetailPage() {
  const { id } = useParams(); // 获取路由参数
  const { data, element } = withLoadingError(useGet<Collection & { creator: { name: string } }>(`/collection/${id}`));
  if (element) {
    return element;
  }

  return (
    <div className="w-full flex justify-center">
      <div className='max-w-5xl w-full flex flex-col items-center justify-center py-2'>
        <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
        <p className="text-gray-600 mb-1">作者：{data.creator.name}</p>
        <div className="card-ink flex flex-wrap gap-2 mt-2">
          {Array.isArray(data.poems) && data.poems.length > 0 && (
            <div className="text-gray-800 mb-2 leading-relaxed flex flex-col items-center justify-center">
              {data.poems.map((poem: Poem, idx: number) => (
                <div key={idx}>{poem.title}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}