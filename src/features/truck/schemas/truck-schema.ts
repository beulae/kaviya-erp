import { z } from 'zod'

const VEHICLE_NO_ERROR = 'Enter a valid vehicle number, e.g. TN 12 BM 1848'

export const truckSchema = z.object({
  vehicleType: z.enum(['own', 'market']),
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
  driverName: z.string().trim(),
  driverMobile: z
    .string()
    .trim()
    .refine((v) => v === '' || /^[6-9]\d{9}$/.test(v), 'Enter a valid 10-digit mobile number.'),
  driverDlNumber: z.string().trim(),
})

export type TruckFormValues = z.infer<typeof truckSchema>
