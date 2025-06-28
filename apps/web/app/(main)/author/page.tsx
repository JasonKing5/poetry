'use client';

import { useAuthorStore } from '@/store/authorStore';
import { useAllAuthors } from '@/services/author.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { constants } from '@repo/common';
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Author } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';

import AuthorCard from '@/components/AuthorCard';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

type AuthorProps = Author;

export type AuthorListResponse = {
  list: AuthorProps[];
  total: number;
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
              name={item.label}
            >{item.label}</Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// 新增：将页面内容提取为子组件
function AuthorPageContent() {
  const searchParams = useSearchParams();
  const { page, pageSize, name, setFilters, resetFilters } = useAuthorStore();
  const [nameInput, setNameInput] = useState(name);

  const { data: authorsPageRes , element: element } = withLoadingError(useAllAuthors({page, pageSize, name}));
  const { list: authorList, total } = authorsPageRes || {};

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
    const urlName = searchParams.get('name');
    if (urlName) {
      setFilters({ name: urlName, page: 1 });
      setNameInput(urlName); // 保持input同步
    }
  }, [searchParams, setFilters]);

  useEffect(() => {
    setNameInput(name);
  }, [name]);

  if (element) {
    return element;
  }

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-5xl w-full">
      <div className="card-ink rounded-lg shadow-sm px-4 py-3 mb-6 border border-gray-100">
        {/* 搜索栏 */}
        <div className="flex justify-between items-center gap-2 mb-4">
            <span
              className="text-gray-700 whitespace-nowrap mr-2"
              style={{ fontWeight: 500, fontSize: 16, minWidth: 'fit-content' }}
            >{`搜索出 ${element ? 0 : total} 位作者`}</span>
          <Button variant="outline" className='hover:bg-primary/90 hover:text-white cursor-pointer transition' onClick={handleReset}>重置</Button>
        </div>
        {/* 筛选项 */}
        <div className="space-y-3">
          {/* 名字 */}
          <div className="flex items-center gap-2">
            <span className="text-gray-700 whitespace-nowrap mr-2" style={{ fontWeight: 500, fontSize: 16 }}>名字</span>
            <Input
              type="text"
              placeholder="请输入名字"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleValueChange('name', nameInput);
                }
              }}
            />
            <Button
              className="ml-2 hover:bg-primary/90 hover:text-white cursor-pointer transition"
              onClick={() => handleValueChange('name', nameInput)}
            >
              查询
            </Button>
          </div>
        </div>
      </div>
      <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {element ? element : (authorList as AuthorProps[])?.length > 0 ? (
          (authorList as AuthorProps[]).map((author) => (
            <li className="w-full" key={author.id}>
              <AuthorCard
                id={author.id}
                name={author.name}
                description={author.description}
              />
            </li>
          ))
        ) : <div className='min-h-40 flex justify-center items-center'>无结果</div>}
      </ul>

        <div className="flex gap-2">
          {/* 分页功能 */}
          {(() => {
            const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
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
export default function AuthorPage() {
  return (
    <Suspense>
      <AuthorPageContent />
    </Suspense>
  );
}