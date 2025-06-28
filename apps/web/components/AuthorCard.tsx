'use client'

import React from 'react';
import { useRouter } from "next/navigation"

interface AuthorCardProps {
  id: number;
  name: string;
  description: string;
}

export default function AuthorCard({ id, name, description }: AuthorCardProps) {
  const navigate = useRouter()
  return (
    <div
      className="card-ink relative rounded-xl shadow-lg mb-4 border border-[#e5e7eb] overflow-hidden author-bg-animate"
    >
      {/* 宣纸纹理叠加 */}
      <div className="absolute inset-0 pointer-events-none opacity-25" style={{
        backgroundImage: 'url("https://img.alicdn.com/imgextra/i2/6000000000427/O1CN01v8wQ2n1pQb5Qy5p7z_!!6000000000427-2-tps-800-800.png")',
        backgroundSize: 'cover',
        zIndex: 1
      }} />
      <div className="relative p-6 z-10">
        <div className="flex flex-col items-start mb-2">
          <div
            className="text-xl font-bold text-[#374151] mr-2 cursor-pointer transition hover:text-[#2563eb]"
            onClick={() => navigate.push(`/author/${id}`)}
          >
            {name}
          </div>
        </div>
        <div className="text-gray-500 leading-relaxed font-serif tracking-wide truncate text-ellipsis text-[14px]">
          {description ? description : '暂无简介'}
        </div>
      </div>
      {/* 动态渐变动画 */}
      <style jsx>{`
        .author-bg-animate {
          animation: authorGradientMove 10s ease-in-out infinite alternate;
          background-size: 200% 200%;
        }
        @keyframes authorGradientMove {
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