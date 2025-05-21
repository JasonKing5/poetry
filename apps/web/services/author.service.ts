import { useGet } from '@/lib/request';

export type GetAllAuthorsProps = {
  page?: number;
  pageSize?: number;
  name?: string;
  all?: boolean;
 }

export const useAllAuthors = (params: GetAllAuthorsProps) => {
  return useGet('/authors', params);
};
