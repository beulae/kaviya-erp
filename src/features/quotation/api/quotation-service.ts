import type { Quotation } from '@/types/quotation'
import { apiClient } from '@/api/axios-instance'

export interface QuotationListParams {
  page?: number
  pageSize?: number
  search?: string
  searchFields?: string
  status?: string
}

const QUOTATION_SEARCH_FIELDS = 'quotationNumber,customerName,companyName,materialName,from,to'

function normalizeListResponse(responseData: unknown): { data: Quotation[]; total: number } {
  if (responseData && typeof responseData === 'object') {
    const data = 'data' in responseData ? (responseData as { data?: unknown }).data : undefined
    const total = 'total' in responseData ? Number((responseData as { total?: unknown }).total ?? 0) : undefined

    if (Array.isArray(data)) {
      return {
        data: data as Quotation[],
        total: Number.isFinite(total) ? Number(total) : data.length,
      }
    }
  }

  if (Array.isArray(responseData)) {
    return { data: responseData as Quotation[], total: responseData.length }
  }

  return { data: [], total: 0 }
}

export async function fetchQuotations(params: QuotationListParams = {}): Promise<{ data: Quotation[]; total: number }> {
  const { page = 1, pageSize = 20, search, status } = params

  const { data } = await apiClient.get('/transport-quotations', {
    params: {
      page,
      pageSize,
      ...(search ? { search } : {}),
      ...(search ? { searchFields: QUOTATION_SEARCH_FIELDS } : {}),
      ...(status ? { status } : {}),
    },
  })

  return normalizeListResponse(data)
}

export async function fetchQuotationById(id: string | number): Promise<Quotation | undefined> {
  const response = await apiClient.get(`/transport-quotations/${id}`)
  return response.data?.data ?? response.data ?? undefined
}

export async function createQuotation(payload: Partial<Quotation>): Promise<Quotation> {
  const response = await apiClient.post('/transport-quotations', payload)
  return response.data?.data ?? response.data
}

export async function updateQuotation(id: number | string, payload: Partial<Quotation>): Promise<Quotation> {
  const response = await apiClient.put(`/transport-quotations/${id}`, payload)
  return response.data?.data ?? response.data
}

export async function deleteQuotation(id: number | string): Promise<void> {
  await apiClient.delete(`/transport-quotations/${id}`)
}
