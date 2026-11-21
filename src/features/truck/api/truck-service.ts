import type { Truck } from '@/types/truck'
import { apiClient } from '@/api/axios-instance'

// TODO: confirm the endpoint path once the backend shares the truck API.
const TRUCK_ENDPOINT = '/trucks'

export interface TruckListParams {
  page?: number
  pageSize?: number
  search?: string
}

function normalizeListResponse(responseData: unknown): { data: Truck[]; total: number } {
  if (Array.isArray(responseData)) {
    return { data: responseData as Truck[], total: responseData.length }
  }
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    const { data, total } = responseData as { data?: unknown; total?: unknown }
    if (Array.isArray(data)) {
      const count = Number(total)
      return { data: data as Truck[], total: Number.isFinite(count) ? count : data.length }
    }
  }
  return { data: [], total: 0 }
}

export async function fetchTrucks(params: TruckListParams = {}): Promise<{ data: Truck[]; total: number }> {
  const { page = 1, pageSize = 20, search } = params
  const { data } = await apiClient.get(TRUCK_ENDPOINT, {
    params: { page, pageSize, ...(search ? { search } : {}) },
  })
  return normalizeListResponse(data)
}

export async function fetchTruckById(id: string | number): Promise<Truck | undefined> {
  const response = await apiClient.get(`${TRUCK_ENDPOINT}/${id}`)
  return response.data?.data ?? response.data ?? undefined
}

export async function createTruck(payload: Omit<Truck, 'id'>): Promise<Truck> {
  const response = await apiClient.post(TRUCK_ENDPOINT, payload)
  return response.data?.data ?? response.data
}

export async function updateTruck(id: number | string, payload: Omit<Truck, 'id'>): Promise<Truck> {
  const response = await apiClient.put(`${TRUCK_ENDPOINT}/${id}`, payload)
  return response.data?.data ?? response.data
}
