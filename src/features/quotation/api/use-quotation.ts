import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchQuotations, createQuotation, type QuotationListParams } from './quotation-service'
import type { Quotation } from '@/types/quotation'

export const quotationKeys = {
  all: ['quotations'] as const,
  list: (params: QuotationListParams) => [...quotationKeys.all, 'list', params] as const,
}

export function useQuotations(params: QuotationListParams) {
  return useQuery({
    queryKey: quotationKeys.list(params),
    queryFn: () => fetchQuotations(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateQuotation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<Quotation>) => createQuotation(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: quotationKeys.all }),
  })
}
