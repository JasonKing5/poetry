import axios from "./http"
import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// get 支持 RESTful 路径参数和 query 参数
/**
 * @param url string 基础url（如 /users）
 * @param options object 可选：
 *   - params: query string 对象（如 { page: 1 }）
 *   - path: 路径参数（如 id，自动拼接到 url）
 *   - 其它 useQuery options
 */
export const useGet = <T = any>(url: string, options?: {
  params?: Record<string, any>,
  path?: string | number,
  disabled?: boolean,
  [key: string]: any
}): UseQueryResult<T | null, Error> => {
  const { params, path, disabled, ...rest } = options || {};
  // 拼接 RESTful 路径参数
  let realUrl = url;
  if (path !== undefined && path !== null) {
    realUrl = `${url}/${path}`;
  }
  return useQuery({
    queryKey: [realUrl, params],
    queryFn: () => {
      if (disabled) {
        return null
      }
      return axios.get<T>(realUrl, { params })
    },
    ...rest,
  });
}

// 通用 onSuccess 处理，自动 toast + invalidateQueries，可自定义 successMessage/invalidate
interface GlobalSuccessOptions {
  successMessage?: string;
  invalidate?: boolean;
  [key: string]: any; // 允许透传其它 mutation options
}
const withGlobalSuccess = (url: string, options?: GlobalSuccessOptions) => {
  const queryClient = useQueryClient();
  const { successMessage, invalidate = true, ...restOptions } = options || {};
  return {
    ...restOptions,
    onSuccess: (data: any, ...rest: any[]) => {
      restOptions?.onSuccess?.(data, ...rest);
      if (successMessage) {
        toast.success(successMessage);
      }
      if (invalidate) {
        queryClient.invalidateQueries({ queryKey: [url] });
      }
    }
  };
}

export const usePost = <T = any, D = any>(url: string, options?: GlobalSuccessOptions): UseMutationResult<T, Error, D> =>
  useMutation<T, Error, D>({
    mutationFn: (data: D) => axios.post(url, data),
    ...withGlobalSuccess(url, options),
  })

export const usePut = <T = any, D = any>(url: string, options?: GlobalSuccessOptions): UseMutationResult<T, Error, D> =>
  useMutation<T, Error, D>({
    mutationFn: (data: D) => axios.put(url, data),
    ...withGlobalSuccess(url, options),
  })

export const useDel = <T = any, D = any>(url: string, options?: GlobalSuccessOptions): UseMutationResult<T, Error, D> =>
  useMutation<T, Error, D>({
    mutationFn: (data: D) => {
      if (typeof data === 'number' || typeof data === 'string') {
        return axios.delete(`${url}/${data}`)
      } else if (data && typeof data === 'object' && 'id' in data) {
        return axios.delete(`${url}/${data.id}`)
      } else {
        return axios.delete(url)
      }
    },
    ...withGlobalSuccess(url, options),
  })
