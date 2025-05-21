'use client';

import { useParams } from 'next/navigation';
import { useGet } from '@/lib/request';
import { Author, Poetry } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import { usePoetryList } from '@/services/poetry.service'
import { PoetryListResponse, PoetryProps } from '../../poetry/page';
import PoetryCard from '@/components/PoetryCard';

export default function AuthorDetailPage() {
  const { id } = useParams(); // 获取路由参数
  const { data, element } = withLoadingError(useGet<Author>(`/authors/${id}`));
  const { data: poetryPageRes, element: poetryElement } = withLoadingError(usePoetryList({ author: Number(id), pageSize: 12 }));

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
            {poetryElement ? poetryElement : (poetryPageRes as PoetryListResponse)?.list?.length > 0 ? (
              ((poetryPageRes as PoetryListResponse)?.list as PoetryProps[]).map((poetry) => (
                <li className="w-full" key={poetry.id}>
                  <PoetryCard
                    id={poetry.id}
                    title={poetry.title}
                    author={poetry.author.name}
                    dynasty={poetry.dynasty}
                    tags={poetry.tags}
                    content={getShortContent(poetry.content, 8)}
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