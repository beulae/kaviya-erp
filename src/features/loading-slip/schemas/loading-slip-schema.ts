import { z } from 'zod'

// Free-text fields accept letters, digits, whitespace and common address
// punctuation only — anything else is rejected by the backend PDF generator.
const SAFE_TEXT = /^[A-Za-z0-9\s.,/&()#:'-]*$/
export const SPECIAL_CHAR_HINT = 'Please avoid using special characters.'
const VEHICLE_NO_ERROR = 'Enter a valid vehicle number, e.g. TN 12 BM 1848'

const safeText = () => z.string().regex(SAFE_TEXT, SPECIAL_CHAR_HINT).optional()
const optionalPattern = (pattern: RegExp, message: string) =>
  z
    .string()
    .optional()
    .refine((v) => !v || pattern.test(v), message)

const amount = (label: string) => z.coerce.number().nonnegative(`${label} cannot be negative`)

export const loadingSlipSchema = z
  .object({
    loadingSlipNo: z.string().trim().min(1, 'Loading slip no. is required'),
    billGenerateDate: z.string().min(1, 'Bill generate date is required'),
    branchCode: z.string().optional(),
    financialYear: z.string().optional(),

    partyName: z.string().optional(),
    partyContactNumber: optionalPattern(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    partyGstin: optionalPattern(/^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/, 'Enter a valid GSTIN'),
    partyEmail: optionalPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address'),
    bankName: z.string().optional(),
    partyAddress: safeText(),

    vehicleState: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{2}$/, VEHICLE_NO_ERROR),
    vehicleDistrict: z
      .string()
      .trim()
      .regex(/^\d{1,2}$/, VEHICLE_NO_ERROR),
    vehicleSeries: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{0,3}$/, VEHICLE_NO_ERROR),
    vehicleDigits: z
      .string()
      .trim()
      .regex(/^\d{1,4}$/, VEHICLE_NO_ERROR),
    vehicleType: z.string().min(1, 'Select vehicle type'),
    vehicleSize: z.string().optional(),
    openingKm: amount('Opening KM'),
    closingKm: amount('Closing KM'),
    driverName: z.string().optional(),
    driverMobileNumber: optionalPattern(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    driverDlNumber: z.string().optional(),
    vehicleOwnerName: z.string().optional(),
    vehicleOwnerMobile: optionalPattern(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
    vehicleOwnerPan: z
      .string()
      .trim()
      .toUpperCase()
      .optional()
      .refine((v) => !v || /^[A-Z]{5}\d{4}[A-Z]$/.test(v), 'Enter a valid PAN (format: ABCDE1234F)'),
    vehicleOwnerAddress: safeText(),

    fromLocation: z.string().optional(),
    toLocation: z.string().optional(),
    materialDetails: safeText(),

    actualWeight: amount('Actual weight'),
    guaranteeWeight: amount('Guarantee weight'),
    unit: z.string().min(1, 'Select unit'),
    rate: amount('Rate'),
    isRateFixed: z.boolean(),
    haltingCharge: amount('Halting charge'),
    otherCharges: amount('Other charges'),
    advanceAmount: amount('Advance'),

    truckHireRate: amount('Truck hire rate'),
    isTruckHireRateFixed: z.boolean(),
    commissionAmount: amount('Commission'),

    remarks: safeText(),
    hideSupplierDetailsFromPdf: z.boolean(),
    hideGeneratedDatetimeFromPdf: z.boolean(),
  })
  .refine((v) => !v.closingKm || v.closingKm >= v.openingKm, {
    path: ['closingKm'],
    message: 'Closing KM must be greater than opening KM',
  })

export type LoadingSlipFormValues = z.infer<typeof loadingSlipSchema>
