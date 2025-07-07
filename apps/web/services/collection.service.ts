import { useGet } from '@/lib/request'

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
