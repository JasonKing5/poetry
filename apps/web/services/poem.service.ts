import { useGet } from '@/lib/request'

 export type GetPoemListProps = {
  page?: number;
  pageSize?: number;
  title?: string;
  type?: string;
  source?: string;
  dynasty?: string;
  submitter?: string;
  author?: number;
  status?: string;
  currentUserId?: number | null;
 }

export const usePoemList = (params: GetPoemListProps) => {
 return useGet('/poem', {params});
}
