import { z } from 'zod'

export const biltyBasicSchema = z.object({
  biltyDate: z.string().min(1, 'Bilty date is required'),
  bookingBranch: z.string().min(1, 'Select a booking branch'),
  deliveryBranch: z.string().min(1, 'Select a delivery branch'),
  transportType: z.string().min(1, 'Select transport type'),
  paymentType: z.string().min(1, 'Select payment type'),
})

export const biltyPartySchema = z.object({
  consignorName: z.string().min(2, 'Consignor name is required'),
  consignorAddress: z.string().min(2, 'Consignor address is required'),
  consigneeName: z.string().min(2, 'Consignee name is required'),
  consigneeAddress: z.string().min(2, 'Consignee address is required'),
  fromCity: z.string().min(1, 'Origin city is required'),
  toCity: z.string().min(1, 'Destination city is required'),
})

export const biltyGoodsSchema = z.object({
  vehicleNumber: z.string().min(3, 'Vehicle number is required'),
  driverName: z.string().min(2, 'Driver name is required'),
  driverMobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid mobile number'),
  goodsDescription: z.string().min(2, 'Describe the goods'),
  weightKg: z.coerce.number().positive('Weight must be greater than 0'),
  freightAmount: z.coerce.number().nonnegative('Freight cannot be negative'),
  remarks: z.string().optional(),
})

export const createBiltySchema = biltyBasicSchema.merge(biltyPartySchema).merge(biltyGoodsSchema)
export type CreateBiltyFormValues = z.infer<typeof createBiltySchema>
