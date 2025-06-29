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

interface PoetryCardProps {
  id: number;
  mode?: 'simple' | 'full';
  title: string;
  author: string;
  dynasty: string;
  tags: string[];
  content?: string[];
  likesCount?: number;
  isLiked?: boolean;
}

export default function PoetryCard({ 
  id,
  mode = 'full',
  title, 
  author, 
  dynasty, 
  tags, 
  content, 
  likesCount = 0,
  isLiked: initialIsLiked = false 
}: PoetryCardProps) {
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
    <div className="card-ink">
      {/* 宣纸纹理叠加 */}
      <div className="absolute inset-0 pointer-events-none opacity-25" style={{
        backgroundImage: 'url("https://img.alicdn.com/imgextra/i2/6000000000427/O1CN01v8wQ2n1pQb5Qy5p7z_!!6000000000427-2-tps-800-800.png")',
        backgroundSize: 'cover',
        zIndex: 1
      }} />
      {mode === 'full' && <div className="relative p-6 z-10">
        <div className="flex flex-col mb-2 items-center">
        <div
          className="text-xl font-bold text-[#374151] mr-2 mb-1 cursor-pointer transition hover:text-[#2563eb]"
          onClick={() => navigate.push(`/poetry/${id}`)}
        >
          {title}
        </div>
          <div className="text-sm text-gray-500">{author} · {DYNASTY_MAP[dynasty as keyof typeof DYNASTY_MAP]}</div>
        </div>
        {Array.isArray(content) && content.length > 0 && (
          <div className="text-gray-700 mb-2 leading-relaxed font-serif tracking-wide">
            {content.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-start gap-2 mt-2 justify-between">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-h-[40px]">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="bg-[#e5ebe7] text-[#4b5e53] text-xs px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
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
          className="text-xl font-bold text-[#374151] mr-2 cursor-pointer transition hover:text-[#2563eb] flex-1 truncate"
          onClick={() => navigate.push(`/poetry/${id}`)}
        >
          {title}
        </div>
        <div className="text-sm text-gray-500 flex flex-row items-center gap-2">{author} · {DYNASTY_MAP[dynasty as keyof typeof DYNASTY_MAP]}</div>
        </div>
      </div>}
    </div>
  );
}