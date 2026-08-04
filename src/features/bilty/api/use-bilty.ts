import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBilties, fetchBiltyById, createBilty, type BiltyListParams } from './bilty-service'
import type { Bilty } from '@/types/bilty'

export const biltyKeys = {
  all: ['bilties'] as const,
  list: (params: BiltyListParams) => [...biltyKeys.all, 'list', params] as const,
  detail: (id: string) => [...biltyKeys.all, 'detail', id] as const,
}

export function useBilties(params: BiltyListParams) {
  return useQuery({
    queryKey: biltyKeys.list(params),
    queryFn: () => fetchBilties(params),
    placeholderData: (prev) => prev,
  })
}

export function useBilty(id: string) {
  return useQuery({
    queryKey: biltyKeys.detail(id),
    queryFn: () => fetchBiltyById(id),
    enabled: !!id,
  })
}

export function useCreateBilty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Bilty>) => createBilty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: biltyKeys.all })
    },
  })
}
