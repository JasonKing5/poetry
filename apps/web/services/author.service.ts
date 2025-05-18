import { useGet } from '@/lib/request';

export const useAllAuthors = () => {
  return useGet('/authors');
};
