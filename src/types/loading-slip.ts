export interface LoadingSlip {
  id: number | string
  loadingSlipNo: string
  billGenerateDate: string
  branchCode?: string
  financialYear?: string

  partyName?: string
  partyContactNo?: string
  partyGstin?: string
  partyEmail?: string
  bankName?: string
  partyAddress?: string

  vehicleNumber: string
  vehicleType: string
  vehicleSize?: string
  openingKm?: number
  closingKm?: number
  driverName?: string
  driverNumber?: string
  dlNumber?: string
  vehicleOwnerName?: string
  vehicleOwnerMobile?: string
  vehicleOwnerPan?: string
  vehicleOwnerAddress?: string

  fromLocation?: string
  toLocation?: string
  materialDetails?: string

  actualWeight?: number
  guaranteeWeight?: number
  unit?: string
  rate?: number
  isRateFixed?: boolean
  freightAmount?: number
  haltingCharge?: number
  otherCharges?: number
  totalAmount?: number
  advanceAmount?: number
  balanceAmount?: number

  truckHireRate?: number
  isTruckHireRateFixed?: boolean
  truckHireCost?: number
  commissionAmount?: number

  remarks?: string
  hideSupplierDetailsFromPdf?: boolean
  hideGeneratedDatetimeFromPdf?: boolean
}
