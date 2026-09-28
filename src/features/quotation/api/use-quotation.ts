import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchQuotations,
  fetchQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  type QuotationListParams,
} from './quotation-service'
import type { Quotation } from '@/types/quotation'

export const quotationKeys = {
  all: ['quotations'] as const,
  list: (params: QuotationListParams) => [...quotationKeys.all, 'list', params] as const,
  detail: (id: string | number) => [...quotationKeys.all, 'detail', id] as const,
}

export function useQuotations(params: QuotationListParams) {
  return useQuery({
    queryKey: quotationKeys.list(params),
    queryFn: () => fetchQuotations(params),
    placeholderData: (prev) => prev,
  })
}

export function useQuotation(id: string | number) {
  return useQuery({
    queryKey: quotationKeys.detail(id),
    queryFn: () => fetchQuotationById(id),
    enabled: !!id,
  })
}

export function useCreateQuotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<Quotation>) => createQuotation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all })
    },
  })
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<Quotation> }) =>
      updateQuotation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all })
    },
  })
}

export function useDeleteQuotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number | string) => deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quotationKeys.all })
    },
  })
}