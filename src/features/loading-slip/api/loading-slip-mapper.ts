import type { LoadingSlip } from '@/types/loading-slip'
import type { LoadingSlipFormValues } from '../schemas/loading-slip-schema'
import { calculateLoadingSlipTotals } from '../utils/loading-slip-calculations'

// NOTE: The backend contract for loading slips is not finalised yet. Field
// names below mirror the form; adjust this mapper (and only this mapper) once
// the POST endpoint's payload shape is confirmed.

export function joinVehicleNumber(
  v: Pick<LoadingSlipFormValues, 'vehicleState' | 'vehicleDistrict' | 'vehicleSeries' | 'vehicleDigits'>,
) {
  return [v.vehicleState, v.vehicleDistrict.padStart(2, '0'), v.vehicleSeries, v.vehicleDigits.padStart(4, '0')]
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean)
    .join('')
}

/** Best-effort split of e.g. "TN12BM1848" / "TN 12 BM 1848" into its four parts. */
export function splitVehicleNumber(vehicleNumber = '') {
  const match = vehicleNumber
    .replace(/[\s-]/g, '')
    .toUpperCase()
    .match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{1,4})$/)
  return {
    vehicleState: match?.[1] ?? '',
    vehicleDistrict: match?.[2] ?? '',
    vehicleSeries: match?.[3] ?? '',
    vehicleDigits: match?.[4] ?? '',
  }
}

export function mapLoadingSlipFormToPayload(values: LoadingSlipFormValues): Omit<LoadingSlip, 'id'> {
  const { vehicleState, vehicleDistrict, vehicleSeries, vehicleDigits, ...rest } = values
  return {
    ...rest,
    vehicleNumber: joinVehicleNumber({ vehicleState, vehicleDistrict, vehicleSeries, vehicleDigits }),
    partyGstin: values.partyGstin?.toUpperCase(),
    vehicleOwnerPan: values.vehicleOwnerPan?.toUpperCase(),
    ...calculateLoadingSlipTotals(values),
  }
}

export function mapLoadingSlipToFormValues(slip: LoadingSlip): Partial<LoadingSlipFormValues> {
  const { vehicleNumber, ...rest } = slip
  // Server-computed amounts are recalculated by the form, so drop them.
  const formFields: Record<string, unknown> = { ...rest }
  for (const key of ['id', 'freightAmount', 'totalAmount', 'balanceAmount', 'truckHireCost']) delete formFields[key]
  return {
    ...formFields,
    billGenerateDate: slip.billGenerateDate?.slice(0, 10),
    ...splitVehicleNumber(vehicleNumber),
  } as Partial<LoadingSlipFormValues>
}
