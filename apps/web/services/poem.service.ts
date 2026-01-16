import { useGet, usePatch } from '@/lib/request'

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

export const useMovePoemUp = (id: number) => {
  return usePatch(`/poem/${id}/move-up`, {
    successMessage: '诗词上移成功',
    invalidate: true,
  });
};

export const useMovePoemDown = (id: number) => {
  return usePatch(`/poem/${id}/move-down`, {
    successMessage: '诗词下移成功',
    invalidate: true,
  });
};

export const useMovePoemToTop = (id: number) => {
  return usePatch(`/poem/${id}/move-to-top`, {
    successMessage: '诗词移至顶部成功',
    invalidate: true,
  });
};

export const useMovePoemToBottom = (id: number) => {
  return usePatch(`/poem/${id}/move-to-bottom`, {
    successMessage: '诗词移至底部成功',
    invalidate: true,
  });
};
