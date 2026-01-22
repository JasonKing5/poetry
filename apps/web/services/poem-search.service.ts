import { usePost } from '@/lib/request';

export interface SearchParams {
  input: string;      // 搜索文本
  limit?: number;     // 返回数量限制，默认10
}

export interface PoemSearchResult {
  id: number;
  title: string;
  author: string;     // 作者名字
  dynasty: string;
  content: string | string[];  // 诗句内容，可能是字符串或字符串数组
  distance: number;   // 向量距离（相似度），值越小越相似
}

export const usePoemSearch = () => {
  return usePost<PoemSearchResult[], SearchParams>('/poem/search', {
    successMessage: '',  // 无成功提示
    invalidate: false,   // 不自动刷新
  });
};