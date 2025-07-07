'use client';

import { useUserStore } from '@/store/userStore';
import { useGetAllUsers } from '@/services/user.service';
import Table from '@/components/Table'
import { User } from '@repo/types';
import { withLoadingError } from '@/components/withLoadingError';
import { ColumnDef } from '@tanstack/react-table';
import { PaginationWrapper } from "@/components/PaginationWrapper"
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