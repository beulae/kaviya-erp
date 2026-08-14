import type { Quotation } from '@/types/quotation'
import { MOCK_QUOTATIONS } from '@/services/mock-data'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface QuotationListParams {
  search?: string
  status?: string
}

export async function fetchQuotations(params: QuotationListParams = {}): Promise<{ data: Quotation[]; total: number }> {
  await delay(350)
  let result = [...MOCK_QUOTATIONS]
  if (params.search) {
    const q = params.search.toLowerCase()
    result = result.filter(
      (r) => r.quotationNumber.toLowerCase().includes(q) || r.customerName.toLowerCase().includes(q),
    )
  }
  if (params.status) result = result.filter((r) => r.status === params.status)
  return { data: result, total: result.length }
}

export async function createQuotation(payload: Partial<Quotation>): Promise<Quotation> {
  await delay(450)
  const rate = payload.rate || 0
  const gstPercent = payload.gstPercent ?? 5
  const discount = payload.discount || 0
  // Prefer an explicitly computed total (e.g. Freight Amount With GST from the
  // quotation wizard) and only fall back to the legacy rate/GST/discount
  // calculation when the caller hasn't supplied one.
  const total = payload.total ?? Math.round(rate * (1 + gstPercent / 100) - discount)
  const created: Quotation = {
    id: `quote-${Date.now()}`,
    quotationNumber: `KRW-Q${Math.floor(Math.random() * 9000 + 1000)}`,
    date: new Date().toISOString(),
    customerName: payload.customerName || '',
    vehicleType: payload.vehicleType || '',
    pickup: payload.pickup || '',
    destination: payload.destination || '',
    weightKg: payload.weightKg || 0,
    rate,
    gstPercent,
    discount,
    total,
    validity: payload.validity || new Date(Date.now() + 7 * 864e5).toISOString(),
    status: 'draft',
    detail: payload.detail,
  }
  MOCK_QUOTATIONS.unshift(created)
  return created
}
