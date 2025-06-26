import { useGet } from '@/lib/request'

 export type GetPoetryListProps = {
  page?: number;
  pageSize?: number;
  title?: string;
  type?: string;
  tags?: string[];
  source?: string;
  dynasty?: string;
  submitter?: string;
  author?: number;
  status?: string;
  currentUserId?: number | null;
 }

export const usePoetryList = (params: GetPoetryListProps) => {
 return useGet('/poetry', params);
}
