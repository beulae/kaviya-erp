import { z } from 'zod'

export const createQuotationSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  vehicleType: z.string().min(1, 'Select a vehicle type'),
  pickup: z.string().min(1, 'Pickup location is required'),
  destination: z.string().min(1, 'Destination is required'),
  weightKg: z.coerce.number().positive('Weight must be greater than 0'),
  rate: z.coerce.number().positive('Rate must be greater than 0'),
  gstPercent: z.coerce.number().min(0).max(28),
  discount: z.coerce.number().min(0).default(0),
  validity: z.string().min(1, 'Validity date is required'),
  terms: z.string().optional(),
  remarks: z.string().optional(),
})
export type CreateQuotationFormValues = z.infer<typeof createQuotationSchema>
