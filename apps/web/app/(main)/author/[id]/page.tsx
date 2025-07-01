'use client';

import { useParams } from 'next/navigation';
import { useGet } from '@/lib/request';
import { Author } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import { PoemListResponse, PoemProps } from '../../poem/page';
import PoemCard from '@/components/PoemCard';
import { usePoemList } from '@/services/poem.service';

export default function AuthorDetailPage() {
  const { id } = useParams(); // 获取路由参数
  const { data, element } = withLoadingError(useGet<Author>(`/authors/${id}`));
  const { data: poemPageRes, element: poemElement } = withLoadingError(usePoemList({ author: Number(id), pageSize: 12 }));

  const getShortContent = (content: string[], length: number) => {
    if (content.length <= length) {
      return content;
    }
    return content.slice(0, length);
  };

  if (element) {
    return element;
  }

  return (
    <div className="w-full flex justify-center">
      <div className='max-w-5xl w-full flex flex-col items-start justify-start gap-4'>
        <h1 className="text-2xl font-bold mb-2 flex justify-center items-center w-full">{data.name}</h1>
        <div className='flex flex-col gap-2'>
          <div className='text-xl'>作者简介</div>
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="text-gray-800 mb-2 leading-relaxed flex flex-col items-center justify-center">
              {data.description ? data.description : '暂无简介'}
            </div>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <div className='text-xl'>主要作品</div>
          <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {poemElement ? poemElement : (poemPageRes as PoemListResponse)?.list?.length > 0 ? (
              ((poemPageRes as PoemListResponse)?.list as PoemProps[]).map((poem) => (
                <li className="w-full" key={poem.id}>
                  <PoemCard
                    id={poem.id}
                    title={poem.title}
                    author={poem.author.name}
                    dynasty={poem.dynasty}
                    content={getShortContent(poem.content, 8)}
                  />
                </li>
              ))
            ) : <div className='min-h-40 flex justify-center items-center'>无结果</div>}
          </ul>
        </div>
      </div>
    </div>
  );
}