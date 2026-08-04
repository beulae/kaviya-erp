export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'

export interface Quotation {
  id: string
  quotationNumber: string
  date: string
  customerName: string
  vehicleType: string
  pickup: string
  destination: string
  weightKg: number
  rate: number
  gstPercent: number
  discount: number
  total: number
  validity: string
  status: QuotationStatus
}
