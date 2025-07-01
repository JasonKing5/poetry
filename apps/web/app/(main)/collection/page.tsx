'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCollectionPage } from '@/services/collection.service';
import { withLoadingError } from '@/components/withLoadingError';
import CollectionCard from '@/components/CollectionCard';
import { useCollectionStore } from '@/store/collectionStore';

// Creator type
type Creator = {
  id: number;
  name: string;
};

// Collection props type
export type CollectionProps = {
  id: number;
  title: string;
  creator: Creator;
  likes?: {
    count: number;
    isLiked: boolean;
  };
};

// API response type
export type CollectionResponse = {
  list: CollectionProps[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// 新增：将页面内容提取为子组件
function CollectionPageContent() {
  const searchParams = useSearchParams();
  const { page, pageSize, title, setFilters, resetFilters } = useCollectionStore();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [titleInput, setTitleInput] = useState(title);

  const collectionRes = useCollectionPage({
    page,
    pageSize,
    title,
  });
  const { data, element } = withLoadingError(collectionRes);

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
    const urlTitle = searchParams.get('title');
    if (urlTitle) {
      setFilters({ title: urlTitle, page: 1 });
      setTitleInput(urlTitle); // 保持input同步
    }
  }, [searchParams, setFilters]);

  useEffect(() => {
    setTitleInput(title);
  }, [title]);

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-5xl w-full">
      <div className="card-ink rounded-lg shadow-sm px-4 py-3 mb-6 border border-gray-100">
        {/* 搜索栏 */}
        <div className="flex justify-between items-center gap-2 mb-4">
            <span
              className="text-gray-700 whitespace-nowrap mr-2"
              style={{ fontWeight: 500, fontSize: 16, minWidth: 'fit-content' }}
            >{`合集 ${element ? 0 : data.total}`}</span>
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
        </div>
      </div>
      <ul className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {element ? element : (data as CollectionResponse)?.list?.length > 0 ? (
          (data as CollectionResponse)?.list.map((collection) => (
            <li className="w-full" key={collection.id}>
              <CollectionCard
                id={collection.id}
                title={collection.title}
                creator={collection.creator.name}
                likesCount={collection.likes?.count || 0}
                isLiked={collection.likes?.isLiked || false}
              />
            </li>
          ))
        ) : <div className='min-h-40 flex justify-center items-center'>无结果</div>}
      </ul>

        <div className="flex gap-2">
          {/* 分页功能 */}
          {(() => {
            const totalPages = Math.max(1, Math.ceil(((data as CollectionResponse)?.total || 0) / pageSize));
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
export default function CollectionPage() {
  return (
    <Suspense>
      <CollectionPageContent />
    </Suspense>
  );
}