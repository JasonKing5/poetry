'use client'

import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, toast } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 分钟不重新请求
      retry: 1,                 // 最多重试 1 次
      // @ts-ignore
      // onError: ((error: unknown) => {
      //   console.log('providers queries:', error)
      //   if (error instanceof Error) {
      //     // @ts-ignore
      //     toast.error(error.response?.data?.message || error.message || "Unknown error");
      //   }
      // }),
    },
    mutations: {
      onError: (error: unknown) => {
        console.log('providers mutations:', error)
        if (error instanceof Error) {
          // @ts-ignore
          toast.error(error.response?.data?.message || error.message || "Unknown error");
        }
      },
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}