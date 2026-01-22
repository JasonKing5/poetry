import React from 'react';
import { PoemSearchResult } from '@/services/poem-search.service';
import { constants } from '@repo/common';

const { DYNASTY_MAP } = constants;

interface CalendarPoemDisplayProps {
  poem?: PoemSearchResult | null;
  isLoading?: boolean;
  error?: any;
  onClick?: () => void;
}

export const CalendarPoemDisplay: React.FC<CalendarPoemDisplayProps> = ({
  poem,
  isLoading = false,
  error,
  onClick
}) => {
  // 处理加载状态
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-8 py-2 md:py-4">
        {/* 骨架屏 */}
        <div className="w-full max-w-md mb-2">
          <div className="h-6 bg-white/20 rounded animate-pulse mb-1"></div>
          <div className="h-6 bg-white/20 rounded animate-pulse"></div>
        </div>
        <div className="w-3/4 max-w-sm">
          <div className="h-4 bg-white/20 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // 处理错误状态或没有诗句的情况
  if (error || !poem) {
    // 显示默认诗句（苏轼）
    return (
      <div className="flex-1 flex flex-col justify-center items-center px-4 md:px-8 py-2 md:py-4">
        <div className="text-white text-base md:text-[1.35rem] lg:text-2xl font-semibold tracking-wide text-left leading-relaxed drop-shadow-lg mb-1 md:mb-2">
          雪沫乳花浮午盏，蓼茸蒿笋试春盘。<br className="hidden md:block" />人间有味是清欢。
        </div>
        <div className="text-white text-sm md:text-base lg:text-lg text-left opacity-90 tracking-wide">
          —— 苏轼 · 宋 《浣溪沙·细雨斜风作晓寒》
        </div>
      </div>
    );
  }

  // 解析诗句内容
  // content字段可能是字符串数组，需要处理
  let displayContent = '';
  if (Array.isArray(poem.content)) {
    // 如果是数组，取前两句或适当拼接
    if (poem.content.length > 0) {
      // 清理每行末尾的句号（避免重复）
      const cleanedLines = poem.content.slice(0, 2).map(line => {
        // 移除行尾的句号（可能是一个或多个）
        return line.replace(/。+$/, '');
      });
      // 用句号连接，并在最后添加一个句号
      displayContent = cleanedLines.join('。') + (cleanedLines.length > 0 ? '。' : '');
    } else {
      displayContent = '';
    }
  } else if (typeof poem.content === 'string') {
    // 如果是字符串，直接使用（也清理重复句号）
    displayContent = poem.content.replaceAll(/。+/g, '。');
  }

  // 如果内容为空，使用标题作为备选
  if (!displayContent.trim() && poem.title) {
    displayContent = poem.title;
  }

  // 限制内容长度（防止过长破坏布局）
  if (displayContent.length > 60) {
    displayContent = displayContent.slice(0, 60) + '...';
  }

  // 处理作者和标题显示
  const authorDisplay = poem.author || '未知作者';
  const titleDisplay = poem.title || '无题';
  const dynastyValue = poem.dynasty || '';
  const dynastyDisplay = dynastyValue ? (DYNASTY_MAP[dynastyValue as keyof typeof DYNASTY_MAP] || dynastyValue) : '';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (poem?.id && poem.id !== 0) {
      // 默认行为：跳转到诗词详情页（id不为0时）
      // 使用window.location.href确保完全跳转
      window.location.href = `/poem/${poem.id}`;
    }
  };

  const hasClickAction = onClick || (poem?.id && poem.id !== 0);

  return (
    <div
      className={`flex-1 flex flex-col justify-center items-center px-4 md:px-8 py-2 md:py-4 ${hasClickAction ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
      onClick={hasClickAction ? handleClick : undefined}
    >
      <div className="text-white text-base md:text-[1.35rem] lg:text-2xl font-semibold tracking-wide text-left leading-relaxed drop-shadow-lg mb-1 md:mb-2">
        {displayContent}
      </div>
      <div className="text-white text-sm md:text-base lg:text-lg text-left opacity-90 tracking-wide">
        {dynastyDisplay ? `—— ${authorDisplay} · ${dynastyDisplay} 《${titleDisplay}》` : `—— ${authorDisplay} 《${titleDisplay}》`}
      </div>
    </div>
  );
};

export default CalendarPoemDisplay;