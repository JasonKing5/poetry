'use client'

import { useState } from 'react';
import { constants } from '@repo/common';
import { useRouter } from "next/navigation"
import { Heart } from 'lucide-react';
import { useCreateLike } from '@/services/like.service';
import { cn, getUserId } from '@/lib/utils';

const { DYNASTY_MAP } = constants;

// Local type for target type
const TargetType = {
  POETRY: 'POETRY',
  POETRY_LIST: 'POETRY_LIST',
  COMMENT: 'COMMENT',
} as const;

type TargetType = typeof TargetType[keyof typeof TargetType];

interface PoetryListCardProps {
  id: number;
  mode?: 'simple' | 'full';
  title: string;
  creator: string;
  likesCount?: number;
  isLiked?: boolean;
}

export default function PoetryListCard({ 
  id,
  mode = 'full',
  title, 
  creator, 
  likesCount = 0,
  isLiked: initialIsLiked = false 
}: PoetryListCardProps) {
  const navigate = useRouter()
  const { mutate: likePoetryMutate } = useCreateLike();
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLocalLikesCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));
    
    likePoetryMutate({ 
      targetType: TargetType.POETRY, 
      targetId: String(id), 
      userId: getUserId() 
    });
  }

  return (
    <div
      className="relative rounded-xl shadow-lg mb-4 border border-[#e5e7eb] overflow-hidden poetry-bg-animate"
      style={{
        background: 'linear-gradient(120deg, #f8f9f9 60%, #e5ebe7 100%)',
        boxShadow: '0 4px 24px 0 rgba(120,120,100,0.08), 0 1.5px 4px 0 rgba(120,120,100,0.10)'
      }}
    >
      {/* 宣纸纹理叠加 */}
      <div className="absolute inset-0 pointer-events-none opacity-25" style={{
        backgroundImage: 'url("https://img.alicdn.com/imgextra/i2/6000000000427/O1CN01v8wQ2n1pQb5Qy5p7z_!!6000000000427-2-tps-800-800.png")',
        backgroundSize: 'cover',
        zIndex: 1
      }} />
      {mode === 'full' && <div className="relative p-6 z-10">
        <div className="flex flex-col items-start mb-2">
          <div
            className="text-lg font-bold text-[#374151] mr-2 cursor-pointer transition hover:text-[#2563eb]"
            onClick={() => navigate.push(`/poetry/${id}`)}
          >
            {title}
          </div>
        </div>
        
        <div className="flex flex-wrap items-start gap-2 mt-2 justify-between">
          <div className="text-sm text-gray-500">{`创建者：${creator}`}</div>
          <div className="flex items-start">
          <div 
            className="flex flex-col items-center p-1 min-w-[40px]"
          >
            <div 
              className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100"
              onClick={handleLike}
            >
              <Heart 
                className={cn(
                  'w-4 h-4 cursor-pointer',
                  isLiked ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-300'
                )} 
                size={20}
              />
            </div>
            <span className="text-xs text-gray-600 leading-none mt-0.5">
              {localLikesCount}
            </span>
          </div>
          </div>
        </div>
      </div>}
      {mode === 'simple' && <div className="relative p-6 z-10">
        <div className="flex flex-row items-center gap-2 justify-between">
        <div
          className="text-lg font-bold text-[#374151] mr-2 cursor-pointer transition hover:text-[#2563eb] flex-1 truncate"
          onClick={() => navigate.push(`/poetry/${id}`)}
        >
          {title}
        </div>
        <div className="text-sm text-gray-500 flex flex-row items-center gap-2">{`创建者：${creator}`}</div>
        </div>
      </div>}
      {/* 动态渐变动画 */}
      <style jsx>{`
        .poetry-bg-animate {
          animation: poetryGradientMove 10s ease-in-out infinite alternate;
          background-size: 200% 200%;
        }
        @keyframes poetryGradientMove {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
}