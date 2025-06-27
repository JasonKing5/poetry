'use client';

import { useAuthorStore } from '@/store/authorStore';
import { useAllAuthors } from '@/services/author.service';
import Table from '@/components/Table'
import { Author } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import { ColumnDef } from '@tanstack/react-table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

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
  );
}