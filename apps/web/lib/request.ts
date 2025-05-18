import http from "./http"
import { useQuery, useMutation, UseQueryResult, UseMutationResult, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { toast } from 'sonner'

type QueryParams = Record<string, unknown>;
type PathParam = string | number;

interface GlobalOptions {
  successMessage?: string;
  invalidate?: boolean;
  onSuccess?: (data: unknown, ...rest: unknown[]) => void;
  [key: string]: unknown;
}

export function useGet<T = unknown>(
  url: string,
  params?: QueryParams,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
): UseQueryResult<T, Error> {
  let realUrl = url;
  return useQuery<T, Error, T>({
    queryKey: [realUrl, params],
    // @ts-ignore
    queryFn: async () => {
      const response = await http.get<T>(url, { params });
      return response;
    },
    ...options,
  });
}

function withSuccessHandler(options?: GlobalOptions) {
  const queryClient = useQueryClient();
  const { successMessage, invalidateKey, ...restOptions } = options || {};
  return {
    ...restOptions,
    onSuccess: (data: unknown, ...rest: unknown[]) => {
      if (restOptions?.onSuccess) restOptions.onSuccess(data, ...rest);
      if (successMessage) {
        toast.success(successMessage);
      }
      if (invalidateKey) {
        queryClient.invalidateQueries({ queryKey: [invalidateKey] });
      }
    }
  };
}

export function usePost<T = unknown, D = unknown>(
  url: string,
  options?: GlobalOptions
): UseMutationResult<T, Error, D> {
  return useMutation<T, Error, D>({
    mutationFn: (data: D) => http.post(url, data),
    ...withSuccessHandler(options),
  });
}

export function usePut<T = unknown, D = unknown>(
  url: string,
  options?: GlobalOptions
): UseMutationResult<T, Error, D> {
  return useMutation<T, Error, D>({
    mutationFn: (data: D) => http.put(url, data),
    ...withSuccessHandler(options),
  });
}

export function useDel<T = unknown, D = unknown>(
  url: string,
  options?: GlobalOptions
): UseMutationResult<T, Error, D> {
  return useMutation<T, Error, D>({
    mutationFn: (data: D) => {
      const id = !!data && typeof data === "object" && "id" in data ? data.id : data;
      return http.delete(`${url}/${id}`);
    },
    ...withSuccessHandler(options),
  });
}
