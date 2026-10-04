const round2 = (value: number) => Math.round(value * 100) / 100
const num = (value: unknown) => (Number.isFinite(Number(value)) ? Number(value) : 0)

/** Billable weight is the higher of actual and guaranteed weight. */
export function getChargeableWeight(actualWeight: unknown, guaranteeWeight: unknown): number {
  return Math.max(num(actualWeight), num(guaranteeWeight))
}

/** Rate × chargeable weight, or the rate itself when it is a fixed (lump-sum) amount. */
export function calculateFreightAmount(rate: unknown, chargeableWeight: number, isFixed: boolean): number {
  return round2(isFixed ? num(rate) : num(rate) * chargeableWeight)
}

export function calculateTotalAmount(freightAmount: number, haltingCharge: unknown, otherCharges: unknown): number {
  return round2(freightAmount + num(haltingCharge) + num(otherCharges))
}

export function calculateBalance(totalAmount: number, advanceAmount: unknown): number {
  return round2(totalAmount - num(advanceAmount))
}

export interface LoadingSlipTotals {
  freightAmount: number
  totalAmount: number
  balanceAmount: number
  truckHireCost: number
}

export function calculateLoadingSlipTotals(values: {
  actualWeight: unknown
  guaranteeWeight: unknown
  rate: unknown
  isRateFixed: boolean
  haltingCharge: unknown
  otherCharges: unknown
  advanceAmount: unknown
  truckHireRate: unknown
  isTruckHireRateFixed: boolean
}): LoadingSlipTotals {
  const weight = getChargeableWeight(values.actualWeight, values.guaranteeWeight)
  const freightAmount = calculateFreightAmount(values.rate, weight, values.isRateFixed)
  const totalAmount = calculateTotalAmount(freightAmount, values.haltingCharge, values.otherCharges)
  return {
    freightAmount,
    totalAmount,
    balanceAmount: calculateBalance(totalAmount, values.advanceAmount),
    truckHireCost: calculateFreightAmount(values.truckHireRate, weight, values.isTruckHireRateFixed),
  }
}
