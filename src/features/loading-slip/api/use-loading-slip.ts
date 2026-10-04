import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchLoadingSlips,
  fetchLoadingSlipById,
  createLoadingSlip,
  updateLoadingSlip,
  type LoadingSlipListParams,
} from './loading-slip-service'
import type { LoadingSlip } from '@/types/loading-slip'

export const loadingSlipKeys = {
  all: ['loading-slips'] as const,
  list: (params: LoadingSlipListParams) => [...loadingSlipKeys.all, 'list', params] as const,
  detail: (id: string | number) => [...loadingSlipKeys.all, 'detail', id] as const,
}

export function useLoadingSlips(params: LoadingSlipListParams) {
  return useQuery({
    queryKey: loadingSlipKeys.list(params),
    queryFn: () => fetchLoadingSlips(params),
    placeholderData: (prev) => prev,
  })
}

export function useLoadingSlip(id: string | number) {
  return useQuery({
    queryKey: loadingSlipKeys.detail(id),
    queryFn: () => fetchLoadingSlipById(id),
    enabled: !!id,
  })
}

export function useCreateLoadingSlip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Omit<LoadingSlip, 'id'>) => createLoadingSlip(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loadingSlipKeys.all })
    },
  })
}

export function useUpdateLoadingSlip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Omit<LoadingSlip, 'id'> }) =>
      updateLoadingSlip(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loadingSlipKeys.all })
    },
  })
}
