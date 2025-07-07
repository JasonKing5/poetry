'use client';

import { useAuthorStore } from '@/store/authorStore';
import { useAllAuthors } from '@/services/author.service';
import Table from '@/components/Table'
import { Author } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import { ColumnDef } from '@tanstack/react-table';
import { PaginationWrapper } from "@/components/PaginationWrapper"

export default function AuthorPage() {
  const { page, pageSize, setFilters } = useAuthorStore();

  const { data: pageData, element } = withLoadingError(useAllAuthors({ page, pageSize }));
  if (element) {
    return element;
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
  ]

  return (
    <div className="w-full flex flex-col items-center justify-center">
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