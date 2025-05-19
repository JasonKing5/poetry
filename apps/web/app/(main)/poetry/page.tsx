'use client';

import { usePoetryStore } from '@/store/poetryStore';
import { usePoetryList } from '@/services/poetry.service';
import { useAllAuthors } from '@/services/author.service';
import { useAllTags } from '@/services/poetry-prop.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { constants } from '@repo/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Author, Poetry } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';

import PoetryCard from '@/components/PoetryCard';

import { JSX, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const { POETRY_TYPE_MAP, DYNASTY_MAP } = constants;

type PoetryProps = Poetry & {
 author: Author,
};

export type PoetryListResponse = {
  list: PoetryProps[];
  total: number;
};

// 新增：将页面内容提取为子组件
function PoetryPageContent() {
  const searchParams = useSearchParams();
  const { page, pageSize, title, type, tags, source, dynasty, submitter, author, status, setFilters, resetFilters } = usePoetryStore();

  const { data: authors , element: authorsElement } = withLoadingError(useAllAuthors());
  
  const poetryListRes = usePoetryList({
    page,
    pageSize,
    title,
    type,
    tags,
    source,
    dynasty,
    submitter,
    author,
    status,
  });
  const { data, element } = withLoadingError(poetryListRes);

  const { data: allTags, element: tagsElement } = withLoadingError(useAllTags());

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
    }
  }, [searchParams, setFilters]);

  if (authorsElement) {
    return authorsElement;
  }
  if (tagsElement) {
    return tagsElement;
  }
  if (element) {
    return element;
  }

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-5xl w-full">
      <div className="flex flex-wrap gap-2 mb-4">
          <div className="w-full sm:w-[48%] md:w-[32%]">
            <Select onValueChange={(value) => handleValueChange('author', value)} value={author}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="作者" />
              </SelectTrigger>
              <SelectContent>
                {(authors as Author[])?.map(({id, name}) => (<SelectItem key={id} value={String(id)}>{name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[48%] md:w-[32%]">
            <Select onValueChange={(value) => handleValueChange('type', value)} value={type}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(POETRY_TYPE_MAP).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[48%] md:w-[32%]">
            <Select onValueChange={(value) => handleValueChange('dynasty', value)} value={dynasty}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="朝代" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DYNASTY_MAP).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[48%] md:w-[32%]">
            <Select onValueChange={(value) => handleValueChange('tags', [value])} value={dynasty}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="标签" />
              </SelectTrigger>
              <SelectContent>
                {(allTags as string[]).map((tag: string) => (<SelectItem key={tag} value={tag}>{tag}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-[48%] md:w-[32%]">
            <Input
              type="text"
              className="w-full px-2 py-1 border border-gray-300 rounded"
              placeholder="标题"
              value={title}
              onChange={(e) => handleValueChange('title', e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[48%] md:w-[32%] flex items-center">
            <Button className="w-full" onClick={handleReset}>重置</Button>
          </div>
        </div>

        
        <ul className="mb-4">
          {(data as PoetryListResponse)?.list?.length > 0 ? (
            // 每两项一行
            ((data as PoetryListResponse)?.list as PoetryProps[]).reduce((rows: JSX.Element[], item, idx, arr) => {
              if (idx % 2 === 0) {
                // 取当前和下一个
                const items = arr.slice(idx, idx + 2);
                rows.push(
                  <div className="flex flex-col md:flex-row gap-4" key={idx}>
                    {items.map((poetry) => (
                      <li className="w-full md:w-1/2" key={poetry.id}>
                        <PoetryCard
                          title={poetry.title}
                          author={poetry.author.name}
                          dynasty={poetry.dynasty}
                          tags={poetry.tags}
                          content={getShortContent(poetry.content, 8)}
                        />
                      </li>
                    ))}
                  </div>
                );
              }
              return rows;
            }, [])
          ) : <div>无结果</div>}
        </ul>

        <div className="flex gap-2">
          {/* 分页功能 */}
          {(() => {
            const totalPages = Math.max(1, Math.ceil(((data as PoetryListResponse)?.total || 0) / pageSize));
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
export default function PoetryPage() {
  return (
    <Suspense>
      <PoetryPageContent />
    </Suspense>
  );
}