import axios from "./axios"
import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export const get = <T = any>(url: string, options?: {
  params?: Record<string, any>,
  path?: string | number,
  [key: string]: any
}): UseQueryResult<T, Error> => {
  const { params, path, ...rest } = options || {};
  let realUrl = url;
  if (path !== undefined && path !== null) {
    realUrl = `${url}/${path}`;
  }
  return useQuery({
    queryKey: [realUrl, params],
    queryFn: () => axios.get<T>(realUrl, { params }),
    ...rest,
  });
}

interface GlobalSuccessOptions {
  successMessage?: string;
  invalidate?: boolean;
  [key: string]: any;
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

export const post = <T = any, D = any>(url: string, options?: GlobalSuccessOptions): UseMutationResult<T, Error, D> =>
  useMutation<T, Error, D>({
    mutationFn: (data: D) => axios.post(url, data),
    ...withGlobalSuccess(url, options),
  })

export const put = <T = any, D = any>(url: string, options?: GlobalSuccessOptions): UseMutationResult<T, Error, D> =>
  useMutation<T, Error, D>({
    mutationFn: (data: D) => axios.put(url, data),
    ...withGlobalSuccess(url, options),
  })

export const del = <T = any, D = any>(url: string, options?: GlobalSuccessOptions): UseMutationResult<T, Error, D> =>
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
