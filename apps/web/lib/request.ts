import axios from "./axios"
import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

type QueryParamsProps = Record<string, unknown>;
type PathParamProps = string | number;

interface GlobalSuccessOptions {
  successMessage?: string;
  invalidate?: boolean;
  onSuccess?: (data: unknown, ...rest: unknown[]) => void;
  [key: string]: unknown;
}

export function useGet<T = unknown>(
  url: string,
  options?: {
    params?: QueryParamsProps,
    path?: PathParamProps,
    [key: string]: unknown
  }
): UseQueryResult<T, Error> {
  const { params, path, ...rest } = options || {};
  let realUrl = url;
  if (path !== undefined && path !== null) {
    realUrl = `${url}/${path}`;
  }
  return useQuery<T, Error, T>({
    queryKey: [realUrl, params],
    queryFn: async () => {
      const response = await axios.get<T>(realUrl, { params });
      return response.data;
    },
    ...rest,
  });
}

function useWithGlobalSuccess(url: string, options?: GlobalSuccessOptions) {
  const queryClient = useQueryClient();
  const { successMessage, invalidate = true, ...restOptions } = options || {};
  return {
    ...restOptions,
    onSuccess: (data: unknown, ...rest: unknown[]) => {
      if (restOptions?.onSuccess) restOptions.onSuccess(data, ...rest);
      if (successMessage) {
        toast.success(successMessage);
      }
      if (invalidate) {
        queryClient.invalidateQueries({ queryKey: [url] });
      }
    }
  };
}

export function usePost<T = unknown, D = unknown>(
  url: string,
  options?: GlobalSuccessOptions
): UseMutationResult<T, Error, D> {
  return useMutation<T, Error, D>({
    mutationFn: (data: D) => axios.post(url, data),
    ...useWithGlobalSuccess(url, options),
  });
}

export function usePut<T = unknown, D = unknown>(
  url: string,
  options?: GlobalSuccessOptions
): UseMutationResult<T, Error, D> {
  return useMutation<T, Error, D>({
    mutationFn: (data: D) => axios.put(url, data),
    ...useWithGlobalSuccess(url, options),
  });
}

export function useDel<T = unknown, D = unknown>(
  url: string,
  options?: GlobalSuccessOptions
): UseMutationResult<T, Error, D> {
  return useMutation<T, Error, D>({
    mutationFn: (data: D) => {
      if (typeof data === 'number' || typeof data === 'string') {
        return axios.delete(`${url}/${data}`)
      } else if (data && typeof data === 'object' && 'id' in data) {
        return axios.delete(`${url}/${(data as { id: PathParamProps }).id}`)
      } else {
        return axios.delete(url)
      }
    },
    ...useWithGlobalSuccess(url, options),
  });
}
