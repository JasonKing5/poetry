'use client'

import React from 'react';
import { constants } from '@repo/common';
import { useRouter } from "next/navigation"

const { DYNASTY_MAP } = constants;

interface PoetryCardProps {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  tags: string[];
  content?: string[];
}

export default function PoetryCard({ id, title, author, dynasty, tags, content }: PoetryCardProps) {
  const navigate = useRouter()
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
      <div className="relative p-6 z-10">
        <div className="flex flex-col items-start mb-2">
        <div
          className="text-lg font-bold text-[#374151] mr-2 cursor-pointer transition hover:text-[#2563eb]"
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
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map(tag => (
            <span key={tag} className="bg-[#e5ebe7] text-[#4b5e53] text-xs px-2 py-0.5 rounded">{tag}</span>
          ))}
        </div>
      </div>
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