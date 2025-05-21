'use client';

import { useParams } from 'next/navigation';
import { useGet } from '@/lib/request';
import { Author } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';

export default function AuthorDetailPage() {
  const { id } = useParams(); // 获取路由参数
  const { data, element } = withLoadingError(useGet<Author>(`/authors/${id}`));
  if (element) {
    return element;
  }

  return (
    <div className="w-full flex justify-center">
      <div className='max-w-5xl w-full flex flex-col items-center justify-center'>
        <h1 className="text-2xl font-bold mb-2">{data.name}</h1>
        <div className='flex flex-col gap-2'>
          <div className='text-xl'>作者简介</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="text-gray-800 mb-2 leading-relaxed flex flex-col items-center justify-center">
              {data.description ? data.description : '暂无简介'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}