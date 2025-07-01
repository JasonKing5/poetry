'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { constants } from '@repo/common';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePoemStore } from '@/store/poemStore';
import { usePoemList } from '@/services/poem.service';
import { useAllAuthors } from '@/services/author.service';
import { withLoadingError } from '@/components/withLoadingError';
import PoemCard from '@/components/PoemCard';

const { POETRY_TYPE_MAP, DYNASTY_MAP } = constants;

// Author type
type Author = {
  id: number;
  name: string;
};

// Poem props type
export type PoemProps = {
  id: number;
  title: string;
  dynasty: string;
  tags: string[];
  content: string[];
  author: Author;
  likes?: {
    count: number;
    isLiked: boolean;
  };
};

// API response type
export type PoemListResponse = {
  list: PoemProps[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function FilterRow({ label, items, allSelected, onAllClick }: { label: string, items: any[], allSelected: boolean, onAllClick: () => void}) {
  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-gray-700 mr-2 min-w-fit">{label}</span>
      <Button
        variant={allSelected ? "default" : "outline"}
        size="sm"
        onClick={onAllClick}
        className={
          (allSelected
            ? "bg-primary text-white border-primary "
            : "") +
          "hover:bg-primary/90 hover:text-white cursor-pointer transition"
        }
      >全部</Button>
      <div className="flex-1 overflow-x-auto">
        <div className="flex items-center gap-2 flex-nowrap">
          {items.map(item => (
            <Button
              key={item.key}
              variant={item.selected ? "default" : "outline"}
              size="sm"
              onClick={item.onClick}
              className={
                (item.selected
                  ? "bg-primary text-white border-primary "
                  : "") +
                "hover:bg-primary/90 hover:text-white cursor-pointer transition"
              }
              style={{
                maxWidth: 96,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
              title={item.label}
            >{item.label}</Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 新增：将页面内容提取为子组件
function PoemPageContent() {
  const searchParams = useSearchParams();
  const { page, pageSize, title, type, tags, source, dynasty, submitter, author, status, setFilters, resetFilters } = usePoemStore();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [titleInput, setTitleInput] = useState(title);

  const { data: authors , element: authorsElement } = withLoadingError(useAllAuthors({all: true}));
  
  const poemListRes = usePoemList({
    page,
    pageSize,
    title,
    type,
    source,
    dynasty,
    submitter,
    author: author ? Number(author) : undefined,
    status,
  });
  const { data, element } = withLoadingError(poemListRes);

  const handleDebouncedTitleChange = (value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      handleValueChange('title', value);
    }, 400); // 400ms防抖
  };

  const handleValueChange = (type: string, value: string | string[]) => {
    setFilters({ [type]: value, page: 1 });
  };

  const handleReset = () => {
    resetFilters();
  };

  const getShortContent = (content: string[], length: number) => {
    if (content.length <= length) {
      return content;
    }
    return content.slice(0, length);
  };

  // 页面初始化时，如果URL有type参数，则同步到store
  useEffect(() => {
    const urlType = searchParams.get('type');
    const urlTitle = searchParams.get('title');
    if (urlType) {
      setFilters({ type: urlType, page: 1 });
    }
    if (urlTitle) {
      setFilters({ title: urlTitle, page: 1 });
      setTitleInput(urlTitle); // 保持input同步
    }
  }, [searchParams, setFilters]);

  useEffect(() => {
    setTitleInput(title);
  }, [title]);

  if (authorsElement) {
    return authorsElement;
  }

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-5xl w-full">
      <div className="card-ink bg-white rounded-lg shadow-sm px-4 py-3 mb-6 border border-gray-100">
        {/* 搜索栏 */}
        <div className="flex justify-between items-center gap-2 mb-4">
            <span
              className="text-gray-700 whitespace-nowrap mr-2"
              style={{ fontWeight: 500, fontSize: 16, minWidth: 'fit-content' }}
            >{`诗词 ${element ? 0 : data.total}`}</span>
          <Button variant="outline" className='hover:bg-primary/90 hover:text-white cursor-pointer transition' onClick={handleReset}>重置</Button>
        </div>
        {/* 筛选项 */}
        <div className="space-y-3">
          {/* 标题 */}
          <div className="flex items-center gap-2">
            <span className="text-gray-700 whitespace-nowrap mr-2" style={{ fontWeight: 500, fontSize: 16 }}>标题</span>
            <Input
              type="text"
              placeholder="请输入标题"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className="w-full"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleValueChange('title', titleInput);
                }
              }}
            />
            <Button
              className="ml-2 hover:bg-primary/90 hover:text-white cursor-pointer transition"
              onClick={() => handleValueChange('title', titleInput)}
            >
              查询
            </Button>
          </div>
          {/* 朝代 */}
          <FilterRow
            label="朝代"
            items={Object.entries(DYNASTY_MAP).map(([key, value]) => ({
              key,
              label: value,
              selected: dynasty === key,
              onClick: () => handleValueChange('dynasty', key),
            }))}
            allSelected={!dynasty}
            onAllClick={() => handleValueChange('dynasty', "")}
          />
          {/* 作者 */}
          <FilterRow
            label="诗人"
            items={(authors as Author[]).map(({ id, name }) => ({
              key: String(id),
              label: name,
              selected: author == String(id),
              onClick: () => handleValueChange('author', String(id)),
            }))}
            allSelected={!author}
            onAllClick={() => handleValueChange('author', "")}
          />
          {/* 分类（标签）多选 */}
          {/* <FilterRow
            label="分类"
            items={(allTags as string[]).map((tag) => ({
              key: tag,
              label: tag,
              selected: tags?.includes(tag),
              onClick: () => {
                let newTags = Array.isArray(tags) ? [...tags] : [];
                if (newTags.includes(tag)) {
                  newTags = newTags.filter(t => t !== tag);
                } else {
                  newTags.push(tag);
                }
                handleValueChange('tags', newTags);
              },
              multi: true,
            }))}
            allSelected={!tags || tags.length === 0}
            onAllClick={() => handleValueChange('tags', [])}
          /> */}
          {/* 类型 */}
          <FilterRow
            label="类型"
            items={Object.entries(POETRY_TYPE_MAP).map(([key, value]) => ({
              key,
              label: value,
              selected: type === key,
              onClick: () => handleValueChange('type', key),
            }))}
            allSelected={!type}
            onAllClick={() => handleValueChange('type', "")}
          />
        </div>
      </div>
      <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {element ? element : (data as PoemListResponse)?.list?.length > 0 ? (
          (data as PoemListResponse)?.list.map((poem) => (
            <li className="w-full" key={poem.id}>
              <PoemCard
                id={poem.id}
                title={poem.title}
                author={poem.author.name}
                dynasty={poem.dynasty}
                content={getShortContent(poem.content, 8)}
                likesCount={poem.likes?.count || 0}
                isLiked={poem.likes?.isLiked || false}
              />
            </li>
          ))
        ) : <div className='min-h-40 flex justify-center items-center'>无结果</div>}
      </ul>

        <div className="flex gap-2">
          {/* 分页功能 */}
          {(() => {
            const totalPages = Math.max(1, Math.ceil(((data as PoemListResponse)?.total || 0) / pageSize));
            const pageNumbers: (number | string)[] = [];
            for (let i = 1; i <= totalPages; i++) {
              if (
                i === 1 ||
                i === totalPages ||
                (i >= page - 2 && i <= page + 2)
              ) {
                pageNumbers.push(i);
              } else if (
                (i === page - 3 && page - 3 > 1) ||
                (i === page + 3 && page + 3 < totalPages)
              ) {
                pageNumbers.push('ellipsis-' + i);
              }
            }
            // 去重省略号
            const filteredPageNumbers = pageNumbers.filter((num, idx, arr) => {
              if (typeof num === 'string' && arr[idx - 1] === num) return false;
              return true;
            });
          
            return (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      className="cursor-pointer"
                      onClick={() => setFilters({ page: Math.max(1, page - 1) })}
                      aria-disabled={page === 1}
                    />
                  </PaginationItem>
                  {filteredPageNumbers.map((num) =>
                    typeof num === 'number' ? (
                      <PaginationItem key={num}>
                        <PaginationLink
                          className="cursor-pointer"
                          isActive={num === page}
                          onClick={() => setFilters({ page: num })}
                        >
                          {num}
                        </PaginationLink>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={num}>
                        <span className="px-2 text-gray-400 select-none">...</span>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      className="cursor-pointer"
                      onClick={() => setFilters({ page: Math.min(totalPages, page + 1) })}
                      aria-disabled={page === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// 外层组件用 Suspense 包裹
export default function PoemPage() {
  return (
    <Suspense>
      <PoemPageContent />
    </Suspense>
  );
}