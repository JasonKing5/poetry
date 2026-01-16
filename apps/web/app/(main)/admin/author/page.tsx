'use client';

import { useState } from 'react';
import { useAuthorStore } from '@/store/authorStore';
import { useAllAuthors } from '@/services/author.service';
import Table from '@/components/Table'
import { Author } from '@repo/types';
import { ColumnDef } from '@tanstack/react-table';
import { PaginationWrapper } from "@/components/PaginationWrapper"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/http';

export default function AuthorPage() {
  const { page, pageSize, name, setFilters } = useAuthorStore();
  const [nameInput, setNameInput] = useState(name);
  const [isComposing, setIsComposing] = useState(false);

  // 所有hooks必须在顶部调用
  const { data: pageData, isLoading, error, refetch } = useAllAuthors({ page, pageSize, name });

  const handleSearch = () => {
    // 触发搜索，重置到第一页
    setFilters({ name: nameInput, page: 1 });
  };

  const clearSearch = () => {
    setNameInput('');
    // 不清除store中的搜索状态，用户需要手动点击搜索按钮
  };

  const handleMoveAction = async (id: number, action: 'up' | 'down' | 'top' | 'bottom') => {
    try {
      let url = '';
      switch (action) {
        case 'up':
          url = `/authors/${id}/move-up`;
          break;
        case 'down':
          url = `/authors/${id}/move-down`;
          break;
        case 'top':
          url = `/authors/${id}/move-to-top`;
          break;
        case 'bottom':
          url = `/authors/${id}/move-to-bottom`;
          break;
      }

      await axios.patch(url);
      toast.success(`操作成功`);
      refetch(); // 刷新数据
    } catch (error: any) {
      toast.error(`操作失败: ${error.message}`);
    }
  };

  // 处理加载状态
  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2">加载中...</p>
        </div>
      </div>
    );
  }

  // 处理错误状态
  if (error) {
    return (
      <div className="w-full flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">加载失败</div>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  const { list, total } = pageData || {};

  const columns: ColumnDef<Author>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "name",
      header: "姓名",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "description",
      header: "描述",
      cell: ({ row }) => (
        <div className="max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[800px] truncate">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "order",
      header: "排序",
      cell: ({ row }) => <div>{row.getValue("order")}</div>,
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => {
        const author = row.original;

        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleMoveAction(author.id, 'top')}
              title="移至顶部"
            >
              <ChevronsUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleMoveAction(author.id, 'up')}
              title="上移"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleMoveAction(author.id, 'down')}
              title="下移"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleMoveAction(author.id, 'bottom')}
              title="移至底部"
            >
              <ChevronsDown className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ]

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* 搜索栏 */}
      <div className="flex gap-2 w-full max-w-4xl mb-6">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="搜索作者姓名..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isComposing) {
                handleSearch();
              }
            }}
            className="pl-10 pr-10"
          />
          {nameInput && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <Button onClick={handleSearch}>
          搜索
        </Button>
      </div>
      {name && (
        <div className="w-full max-w-4xl mt-2 text-sm text-gray-500 mb-2">
          搜索: "{name}"，共找到 {total} 条结果
        </div>
      )}

      <Table data={list as Author[]} columns={columns} />

      <div className="flex gap-2 mt-4">
        <PaginationWrapper
          total={total || 0}
          current={page}
          pageSize={pageSize}
          onChange={(newPage) => setFilters({ page: newPage })}
        />
      </div>
    </div>
  );
}