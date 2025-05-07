import React from 'react';
import { DYNASTY_MAP } from '@repo/common'

interface PoetryCardProps {
  title: string;
  author: string;
  dynasty: string;
  tags: string[];
  content?: string[];
}

export default function PoetryCard({ title, author, dynasty, tags, content }: PoetryCardProps) {
  return (
    <div className="bg-[#f8f9f9] rounded-lg shadow p-6 mb-4 border border-[#e5e7eb]">
      <div className="flex flex-col items-start mb-2">
        <div className="text-lg font-bold text-[#2563eb] mr-2">{title}</div>
        <div className="text-sm text-gray-500">{author} · {DYNASTY_MAP[dynasty as keyof typeof DYNASTY_MAP]}</div>
      </div>
      {Array.isArray(content) && content.length > 0 && (
        <div className="text-gray-800 mb-2 leading-relaxed">
          {content.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 mt-2">
        {tags.map(tag => (
          <span key={tag} className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded">{tag}</span>
        ))}
      </div>
    </div>
  );
}