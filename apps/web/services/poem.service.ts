import { useGet, usePatch } from '@/lib/request'

export interface PoemSearchResult {
  id: number;
  title: string;
  author: string;     // 作者名字
  dynasty: string;
  content: string | string[];  // 诗句内容，可能是字符串或字符串数组
  distance: number;   // 向量距离（相似度），值越小越相似
}

export interface CalendarPoemResponse {
  poem: PoemSearchResult;
  searchQuery: string;
  hasDynamicResult: boolean;
}

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

// 日历诗句查询
export const useCalendarPoem = () => {
  return useGet<CalendarPoemResponse>('/poem/calendar-poem', {
    successMessage: '',  // 无成功提示
    invalidate: false,   // 不自动刷新
  });
};
