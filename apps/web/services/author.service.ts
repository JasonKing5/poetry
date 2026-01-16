import { useGet, usePatch } from '@/lib/request';

export type GetAllAuthorsProps = {
  page?: number;
  pageSize?: number;
  name?: string;
  dynasty?: string;
  all?: boolean;
 }

export const useAllAuthors = (params: GetAllAuthorsProps) => {
  return useGet('/authors', {params});
};

export const useMoveAuthorUp = (id: number) => {
  return usePatch(`/authors/${id}/move-up`, {
    successMessage: '作者上移成功',
    invalidate: true,
  });
};

export const useMoveAuthorDown = (id: number) => {
  return usePatch(`/authors/${id}/move-down`, {
    successMessage: '作者下移成功',
    invalidate: true,
  });
};

export const useMoveAuthorToTop = (id: number) => {
  return usePatch(`/authors/${id}/move-to-top`, {
    successMessage: '作者移至顶部成功',
    invalidate: true,
  });
};

export const useMoveAuthorToBottom = (id: number) => {
  return usePatch(`/authors/${id}/move-to-bottom`, {
    successMessage: '作者移至底部成功',
    invalidate: true,
  });
};
