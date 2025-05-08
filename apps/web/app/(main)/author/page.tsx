'use client';

import useSWR from 'swr';
import { useAuthorStore } from '@/store/authorStore';
import { getPoetryList } from '@/services/poetry.service';
import { getAllAuthor } from '@/services/author.service';
import AuthorTable from './table'
import { getAllTags } from '@/services/poetry-prop.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { POETRY_SOURCE_MAP, POETRY_TYPE_MAP, DYNASTY_MAP } from '@repo/common'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function AuthorPage() {
  const { page, pageSize, setFilters, resetFilters } = useAuthorStore();

  // 作者列表用 SWR
  const { data: authorData } = useSWR('all-authors', getAllAuthor, { suspense: false });
  const data = authorData?.data || [];
  

  return (
    <div className="w-full flex justify-center">
      <div className="max-w-5xl w-full">
        
        <AuthorTable data={data?.slice((page - 1) * pageSize, page * pageSize)} />

        <div className="flex gap-2 mt-4">
          {(() => {
            const totalPages = Math.max(1, Math.ceil((data?.length || 0) / pageSize));
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
                  {filteredPageNumbers.map((num, idx) =>
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