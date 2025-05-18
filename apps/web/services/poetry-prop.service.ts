import { useGet } from '@/lib/request'

export const useAllTags = () => {
  return useGet('/poetryprops/tags');
};

export const useLunar = () => {
  return useGet('/poetryprops/lunar');
};
