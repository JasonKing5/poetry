'use client';

import { useParams } from 'next/navigation';
import { useGet } from '@/lib/request';
import { Poetry } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import { constants } from '@repo/common';

const { DYNASTY_MAP } = constants;

export default function PoetryDetailPage() {
  const { id } = useParams(); // 获取路由参数
  const { data, element } = withLoadingError(useGet<Poetry & { author: { name: string } }>(`/poetry/${id}`));
  if (element) {
    return element;
  }

  return (
    <div className="w-full flex justify-center">
      <div className='max-w-5xl w-full flex flex-col items-center justify-center'>
        <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
        <p className="text-gray-600 mb-1">作者：{data.author.name}</p>
        <p className="text-gray-600 mb-1">朝代：{DYNASTY_MAP[data.dynasty as keyof typeof DYNASTY_MAP] || data.dynasty}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {Array.isArray(data.content) && data.content.length > 0 && (
            <div className="text-gray-800 mb-2 leading-relaxed flex flex-col items-center justify-center">
              {data.content.map((line: string, idx: number) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}