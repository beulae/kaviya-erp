export type BiltyStatus = 'draft' | 'pending' | 'in_transit' | 'delivered' | 'cancelled'

export interface Bilty {
  id: string
  biltyNumber: string
  date: string
  consignorName: string
  consigneeName: string
  fromCity: string
  toCity: string
  vehicleNumber: string
  driverName: string
  goodsDescription: string
  weightKg: number
  freightAmount: number
  status: BiltyStatus
}
