'use client';

import { usePoemStore } from '@/store/poemStore';
import { usePoemList } from '@/services/poem.service';
import Table from '@/components/Table'
import { Poem } from '@repo/types';
import { ColumnDef } from '@tanstack/react-table';
import { PaginationWrapper } from "@/components/PaginationWrapper"
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/http';

export default function PoemPage() {
  const { page, pageSize, setFilters } = usePoemStore();

  // 所有hooks必须在顶部调用
  const { data: pageData, isLoading, error, refetch } = usePoemList({ page, pageSize });

  const handleMoveAction = async (id: number, action: 'up' | 'down' | 'top' | 'bottom') => {
    try {
      let url = '';
      switch (action) {
        case 'up':
          url = `/poem/${id}/move-up`;
          break;
        case 'down':
          url = `/poem/${id}/move-down`;
          break;
        case 'top':
          url = `/poem/${id}/move-to-top`;
          break;
        case 'bottom':
          url = `/poem/${id}/move-to-bottom`;
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

  const columns: ColumnDef<Poem>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "title",
      header: "标题",
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "authorId",
      header: "作者",
      cell: ({ row }) => (
        <div className="max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[800px] truncate">
          {row.getValue("authorId")}
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
        const poem = row.original;

        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleMoveAction(poem.id, 'top')}
              title="移至顶部"
            >
              <ChevronsUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleMoveAction(poem.id, 'up')}
              title="上移"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleMoveAction(poem.id, 'down')}
              title="下移"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleMoveAction(poem.id, 'bottom')}
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
      <Table data={list as Poem[]} columns={columns} />

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