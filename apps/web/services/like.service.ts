import { useGet, usePost } from '@/lib/request';
import { Like, TargetType } from '@repo/types';

interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type GetAllLikesProps = {
  page?: number;
  pageSize?: number;
  targetType?: TargetType;
  targetId?: string;
  currentUser?: boolean;
}

export type CreateLikeProps = {
  targetType: TargetType;
  targetId: string;
}

export const useCreateLike = () => {
  return usePost<Like>('/likes');
}

export const useAllLikes = (params: GetAllLikesProps) => {
  return useGet<PaginatedResponse<Like>>('/likes', params);
};
