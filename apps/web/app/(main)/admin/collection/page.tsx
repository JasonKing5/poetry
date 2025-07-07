'use client';

import { useCollectionStore } from '@/store/collectionStore';
import { useCollectionPage } from '@/services/collection.service';
import Table from '@/components/Table'
import { Collection } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import { ColumnDef } from '@tanstack/react-table';
import { PaginationWrapper } from "@/components/PaginationWrapper"

export default function CollectionPage() {
  const { page, pageSize, setFilters } = useCollectionStore();

  const { data: pageData, element } = withLoadingError(useCollectionPage({ page, pageSize }));
  if (element) {
    return element;
  }

  const { list, total } = pageData || {};

  const columns: ColumnDef<Collection & { creator: { name: string } }>[] = [
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
      accessorKey: "creator",
      header: "创建者",
      cell: ({ row }) => (
        <div className="max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[800px] truncate">
          {(row.getValue("creator") as { name: string })?.name}
        </div>
      ),
    },
  ]

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Table data={list as Collection[]} columns={columns} />

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