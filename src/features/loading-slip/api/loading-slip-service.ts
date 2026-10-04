import type { LoadingSlip } from '@/types/loading-slip'
import { apiClient } from '@/api/axios-instance'

// TODO: confirm the endpoint path once the backend shares the loading slip API.
const LOADING_SLIP_ENDPOINT = '/loading-slips'

export interface LoadingSlipListParams {
  page?: number
  pageSize?: number
  search?: string
}

function normalizeListResponse(responseData: unknown): { data: LoadingSlip[]; total: number } {
  if (Array.isArray(responseData)) {
    return { data: responseData as LoadingSlip[], total: responseData.length }
  }
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    const { data, total } = responseData as { data?: unknown; total?: unknown }
    if (Array.isArray(data)) {
      const count = Number(total)
      return { data: data as LoadingSlip[], total: Number.isFinite(count) ? count : data.length }
    }
  }
  return { data: [], total: 0 }
}

export async function fetchLoadingSlips(
  params: LoadingSlipListParams = {},
): Promise<{ data: LoadingSlip[]; total: number }> {
  const { page = 1, pageSize = 20, search } = params
  const { data } = await apiClient.get(LOADING_SLIP_ENDPOINT, {
    params: { page, pageSize, ...(search ? { search } : {}) },
  })
  return normalizeListResponse(data)
}

export async function fetchLoadingSlipById(id: string | number): Promise<LoadingSlip | undefined> {
  const response = await apiClient.get(`${LOADING_SLIP_ENDPOINT}/${id}`)
  return response.data?.data ?? response.data ?? undefined
}

export async function createLoadingSlip(payload: Omit<LoadingSlip, 'id'>): Promise<LoadingSlip> {
  const response = await apiClient.post(LOADING_SLIP_ENDPOINT, payload)
  return response.data?.data ?? response.data
}

export async function updateLoadingSlip(id: number | string, payload: Omit<LoadingSlip, 'id'>): Promise<LoadingSlip> {
  const response = await apiClient.put(`${LOADING_SLIP_ENDPOINT}/${id}`, payload)
  return response.data?.data ?? response.data
}
