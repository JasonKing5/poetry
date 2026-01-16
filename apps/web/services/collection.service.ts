import { useGet, usePatch } from '@/lib/request'

 export type GetCollectionPageProps = {
  page?: number;
  pageSize?: number;
  title?: string;
  type?: string;
  status?: string;
  currentUser?: boolean
 }

export const useCollectionPage = (params: GetCollectionPageProps) => {
 return useGet('/collection', {params});
}

export const useCollectionPoems = (id: number) => {
 return useGet(`/collection/${id}/poems`);
}

export const useMoveCollectionUp = (id: number) => {
  return usePatch(`/collection/${id}/move-up`, {
    successMessage: '合集上移成功',
    invalidate: true,
  });
};

export const useMoveCollectionDown = (id: number) => {
  return usePatch(`/collection/${id}/move-down`, {
    successMessage: '合集下移成功',
    invalidate: true,
  });
};

export const useMoveCollectionToTop = (id: number) => {
  return usePatch(`/collection/${id}/move-to-top`, {
    successMessage: '合集移至顶部成功',
    invalidate: true,
  });
};

export const useMoveCollectionToBottom = (id: number) => {
  return usePatch(`/collection/${id}/move-to-bottom`, {
    successMessage: '合集移至底部成功',
    invalidate: true,
  });
};
