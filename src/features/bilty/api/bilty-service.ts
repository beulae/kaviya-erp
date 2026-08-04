import type { Bilty } from '@/types/bilty'
import { MOCK_BILTIES } from '@/services/mock-data'

// NOTE: This service currently simulates network latency against in-memory
// mock data so the UI is fully functional standalone. Swap the body of each
// function for an `apiClient` call (see src/api/axios-instance.ts) once the
// REST backend is available — the function signatures are designed to match.

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface BiltyListParams {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}

export async function fetchBilties(params: BiltyListParams = {}): Promise<{ data: Bilty[]; total: number }> {
  await delay(400)
  let result = [...MOCK_BILTIES]

  if (params.search) {
    const q = params.search.toLowerCase()
    result = result.filter(
      (b) =>
        b.biltyNumber.toLowerCase().includes(q) ||
        b.consignorName.toLowerCase().includes(q) ||
        b.consigneeName.toLowerCase().includes(q),
    )
  }
  if (params.status) {
    result = result.filter((b) => b.status === params.status)
  }

  return { data: result, total: result.length }
}

export async function fetchBiltyById(id: string): Promise<Bilty | undefined> {
  await delay(300)
  return MOCK_BILTIES.find((b) => b.id === id)
}

export async function createBilty(payload: Partial<Bilty>): Promise<Bilty> {
  await delay(500)
  const created: Bilty = {
    id: `bilty-${Date.now()}`,
    biltyNumber: `KRW-B${Math.floor(Math.random() * 9000 + 1000)}`,
    date: new Date().toISOString(),
    consignorName: payload.consignorName || '',
    consigneeName: payload.consigneeName || '',
    fromCity: payload.fromCity || '',
    toCity: payload.toCity || '',
    vehicleNumber: payload.vehicleNumber || '',
    driverName: payload.driverName || '',
    goodsDescription: payload.goodsDescription || '',
    weightKg: payload.weightKg || 0,
    freightAmount: payload.freightAmount || 0,
    status: 'pending',
  }
  MOCK_BILTIES.unshift(created)
  return created
}
