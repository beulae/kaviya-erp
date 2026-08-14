/**
 * Pure calculation helpers for the Transport Quotation form.
 *
 * These functions are deterministic, side-effect free and independent of the
 * DOM so they can be unit tested and reused from both the form (via
 * useMemo/useWatch) and the review step.
 */

export type WeightUnit = 'MT' | 'QT' | 'KG'
export type RateType = 'Per MT' | 'Per QT' | 'Per KG' | 'Fixed'

/** Multiplier to convert a weight unit into kilograms. */
const UNIT_TO_KG: Record<WeightUnit, number> = {
  MT: 1000,
  QT: 100,
  KG: 1,
}

/** Convert a weight value in the given unit into kilograms. */
export function convertToKg(weight: number, unit: WeightUnit): number {
  const value = Number.isFinite(weight) ? weight : 0
  return value * (UNIT_TO_KG[unit] ?? 1)
}

export interface CalculateFreightInput {
  guaranteeWeight: number
  guaranteeWeightUnit: WeightUnit
  rate: number
  rateType: RateType
  numberOfVehicles: number
}

/**
 * Freight Amount = f(Guarantee Weight, Rate, Rate Type, No. of Vehicles)
 *
 * - Fixed:   rate x numberOfVehicles
 * - Per MT:  (rate / 1000) x weightInKg x numberOfVehicles
 * - Per QT:  (rate / 100)  x weightInKg x numberOfVehicles
 * - Per KG:  rate x weightInKg x numberOfVehicles
 */
export function calculateFreight({
  guaranteeWeight,
  guaranteeWeightUnit,
  rate,
  rateType,
  numberOfVehicles,
}: CalculateFreightInput): number {
  const safeRate = Number.isFinite(rate) ? rate : 0
  const safeVehicles = Number.isFinite(numberOfVehicles) ? numberOfVehicles : 0
  const weightInKg = convertToKg(guaranteeWeight, guaranteeWeightUnit)

  switch (rateType) {
    case 'Fixed':
      return round2(safeRate * safeVehicles)
    case 'Per MT':
      return round2((safeRate / 1000) * weightInKg * safeVehicles)
    case 'Per QT':
      return round2((safeRate / 100) * weightInKg * safeVehicles)
    case 'Per KG':
      return round2(safeRate * weightInKg * safeVehicles)
    default:
      return 0
  }
}

export interface CalculateTotalFreightInput {
  freightAmount: number
  loadingCharge: number
  unloadingCharge: number
  serviceCharge: number
  odcCharge: number
  otherCharge: number
  tollTax: number
}

/** Total Freight = Freight Amount + all supplementary charges. */
export function calculateTotalFreight(input: CalculateTotalFreightInput): number {
  const sum =
    (input.freightAmount || 0) +
    (input.loadingCharge || 0) +
    (input.unloadingCharge || 0) +
    (input.serviceCharge || 0) +
    (input.odcCharge || 0) +
    (input.otherCharge || 0) +
    (input.tollTax || 0)
  return round2(sum)
}

/** GST Amount = Total Freight x GST% / 100 */
export function calculateGstAmount(totalFreight: number, gstPercent: number): number {
  if (!gstPercent) return 0
  return round2((totalFreight || 0) * (gstPercent / 100))
}

/** Freight Amount With GST = Total Freight + GST Amount */
export function calculateFreightWithGst(totalFreight: number, gstAmount: number): number {
  return round2((totalFreight || 0) + (gstAmount || 0))
}

function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
