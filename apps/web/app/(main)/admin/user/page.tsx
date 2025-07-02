'use client';

import { useUserStore } from '@/store/userStore';
import { useGetAllUsers } from '@/services/user.service';
import Table from '@/components/Table'
import { User } from '@repo/types';
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
import { Button } from '@/components/ui/button';
import { useUpdateUser } from '@/services/user.service';
import { toast } from 'sonner';

export default function UserPage() {
  const { page, pageSize, setFilters } = useUserStore();

  const { data: pageData, element } = withLoadingError(useGetAllUsers({ page, pageSize }));
  if (element) {
    return element;
  }

  const { list, total } = pageData || {};

  // const { mutate: updateUser } = useUpdateUser({
  //   onSuccess: () => {
  //     toast.success('更新成功');
  //   }
  // });

  const handleDelete = (id: number) => {
    console.log('delete', id);
  };

  const handleUpdate = (id: number) => {
    console.log('update', id);
    // updateUser({
    //   id,
    //   name: "test",
    // });
  };

  const columns: ColumnDef<User & { userRoles: any[] }>[] = [
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
      accessorKey: "email",
      header: "邮箱",
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "userRoles",
      header: "角色",
      cell: ({ row }) => {
        console.log('roles', row.getValue("userRoles"))
        const roles = (row.getValue("userRoles") as any[])?.map((role: any) => role.role.name);
        return <div>{roles?.join(", ")}</div>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "创建时间",
      cell: ({ row }) => <div>{row.getValue("createdAt")}</div>,
    },
    {
      accessorKey: "updatedAt",
      header: "更新时间",
      cell: ({ row }) => <div>{row.getValue("updatedAt")}</div>,
    },
    {
      accessorKey: "isDeleted",
      header: "操作",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleUpdate(row.getValue("id"))}
            >
              编辑
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(row.getValue("id"))}
            >
              删除
            </Button>
          </div>
        );
      },
    },
  ]

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <Table data={list as User[]} columns={columns} />

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