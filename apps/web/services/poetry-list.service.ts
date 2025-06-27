import { useGet } from '@/lib/request'

 export type GetPoetryListPageProps = {
  page?: number;
  pageSize?: number;
  title?: string;
  type?: string;
  status?: string;
  currentUser?: boolean
 }

export const usePoetryListPage = (params: GetPoetryListPageProps) => {
 return useGet('/poetry-list', params);
}
