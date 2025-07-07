'use client';

import { usePoemStore } from '@/store/poemStore';
import { usePoemList } from '@/services/poem.service';
import Table from '@/components/Table'
import { Poem } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import { ColumnDef } from '@tanstack/react-table';
import { PaginationWrapper } from "@/components/PaginationWrapper"

export default function PoemPage() {
  const { page, pageSize, setFilters } = usePoemStore();

  const { data: pageData, element } = withLoadingError(usePoemList({ page, pageSize }));
  if (element) {
    return element;
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
      accessorKey: "submitterId",
      header: "提交者",
      cell: ({ row }) => (
        <div className="max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[800px] truncate">
          {row.getValue("submitterId")}
        </div>
      ),
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