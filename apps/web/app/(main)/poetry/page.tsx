'use client';

import useSWR from 'swr';
import { usePoetryStore } from '@/store/poetryStore';
import { getPoetryList, GetPoetryListProps } from '@/services/poetry.service';
import { getAllAuthor } from '@/services/author.service';
import { getAllTags } from '@/services/poetry-prop.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { POETRY_TYPE_MAP, DYNASTY_MAP } from '@repo/common'
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

import PoetryCard from '@/components/PoetryCard';

const fetcher = (params: GetPoetryListProps) => getPoetryList(params).then(res => res.data);

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// 新增：将页面内容提取为子组件
function PoetryPageContent() {
  const searchParams = useSearchParams();
  const { page, pageSize, title, type, tags, source, dynasty, submitter, author, status, setFilters, resetFilters } = usePoetryStore();

  // 作者列表用 SWR
  const { data: authorData } = useSWR('all-authors', getAllAuthor, { suspense: false });
  const authors = authorData?.data || [];

  // 诗词列表用 SWR
  const { data, isLoading, error } = useSWR(
    ['poetry-list', { page, pageSize, title, type, tags, source, dynasty, submitter, author, status }],
    ([, params]) => fetcher(params),
    { keepPreviousData: true }
  );

  const { data: tagData } = useSWR(
    ['all-tags'],
    getAllTags,
    { suspense: false },
  );
  const allTags = tagData?.data || [];

  const handleValueChange = (type: string, value: string | string[]) => {
    setFilters({ [type]: value, page: 1 });
  };

  const handleReset = () => {
    resetFilters();
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

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-5xl w-full">
        <div className="flex gap-2 mb-4">
          <Select onValueChange={(value) => handleValueChange('author', value)} value={author}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="作者" />
            </SelectTrigger>
            <SelectContent>
              {authors?.map(({id, name}: {id: string, name: string}) => (<SelectItem key={id} value={String(id)}>{name}</SelectItem>))}
            </SelectContent>
          </Select>
          
          <Select onValueChange={(value) => handleValueChange('type', value)} value={type}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(POETRY_TYPE_MAP).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleValueChange('dynasty', value)} value={dynasty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="朝代" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DYNASTY_MAP).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => handleValueChange('tags', [value])} value={dynasty}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="标签" />
            </SelectTrigger>
            <SelectContent>
              {allTags.map((tag: string) => (<SelectItem key={tag} value={tag}>{tag}</SelectItem>))}
            </SelectContent>
          </Select>
          <Input
            type="text"
            className="w-[180px] px-2 py-1 border border-gray-300 rounded"
            placeholder="标题"
            value={title}
            onChange={(e) => handleValueChange('title', e.target.value)}
          />
          <Button onClick={handleReset} >重置</Button>
        </div>

        {isLoading ? (
          <div>加载中...</div>
        ) : error ? (
          <div>加载失败</div>
        ) : (
          <ul className="mb-4">
            {data?.list?.length > 0 ? data?.list?.map((item: {id: string, title: string, author: {name: string}, dynasty: string, tags: string[], content: string[]}) => (
              <li key={item.id}>
                <PoetryCard
                  title={item.title}
                  author={item.author.name}
                  dynasty={item.dynasty}
                  tags={item.tags}
                  content={item.content}
                />
              </li>
            )) : <div>无结果</div>}
          </ul>
        )}

        <div className="flex gap-2">
          {/* 分页功能 */}
          {(() => {
            const totalPages = Math.max(1, Math.ceil((data?.total || 0) / pageSize));
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