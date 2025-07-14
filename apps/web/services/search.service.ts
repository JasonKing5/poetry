import { usePost } from '@/lib/request';
// import { ChatResponse } from '@repo/types';

export const useSearch = () => {
  return usePost<any>('/chat');
}
