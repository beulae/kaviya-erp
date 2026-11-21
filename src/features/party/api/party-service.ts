import type { Party } from '@/types/party'
import { apiClient } from '@/api/axios-instance'

// TODO: confirm the endpoint path once the backend shares the party API.
const PARTY_ENDPOINT = '/parties'

export interface PartyListParams {
  page?: number
  pageSize?: number
  search?: string
}

function normalizeListResponse(responseData: unknown): { data: Party[]; total: number } {
  if (Array.isArray(responseData)) {
    return { data: responseData as Party[], total: responseData.length }
  }
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    const { data, total } = responseData as { data?: unknown; total?: unknown }
    if (Array.isArray(data)) {
      const count = Number(total)
      return { data: data as Party[], total: Number.isFinite(count) ? count : data.length }
    }
  }
  return { data: [], total: 0 }
}

export async function fetchParties(params: PartyListParams = {}): Promise<{ data: Party[]; total: number }> {
  const { page = 1, pageSize = 20, search } = params
  const { data } = await apiClient.get(PARTY_ENDPOINT, {
    params: { page, pageSize, ...(search ? { search } : {}) },
  })
  return normalizeListResponse(data)
}

export async function fetchPartyById(id: string | number): Promise<Party | undefined> {
  const response = await apiClient.get(`${PARTY_ENDPOINT}/${id}`)
  return response.data?.data ?? response.data ?? undefined
}

export async function createParty(payload: Omit<Party, 'id'>): Promise<Party> {
  const response = await apiClient.post(PARTY_ENDPOINT, payload)
  return response.data?.data ?? response.data
}

export async function updateParty(id: number | string, payload: Omit<Party, 'id'>): Promise<Party> {
  const response = await apiClient.put(`${PARTY_ENDPOINT}/${id}`, payload)
  return response.data?.data ?? response.data
}
