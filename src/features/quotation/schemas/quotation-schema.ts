import { z } from 'zod'

const MAX_QUOTATION_NO = 10 ** 15 - 1

export const quotationArticleSchema = z.object({
  numberOfArticle: z.coerce.number().int('Whole number only').min(0, 'Cannot be negative').default(0),
  length: z.coerce.number().min(0, 'Cannot be negative').default(0),
  width: z.coerce.number().min(0, 'Cannot be negative').default(0),
  height: z.coerce.number().min(0, 'Cannot be negative').default(0),
})

// --- Step 1: Quotation & Company -------------------------------------------------
export const quotationCompanySchema = z.object({
  quotationNo: z.coerce
    .number({ error: 'Quotation number is required' })
    .int('Must be a whole number')
    .min(0, 'Must be 0 or greater')
    .max(MAX_QUOTATION_NO, 'Must be at most 15 digits'),
  quotationDate: z.string().min(1, 'Quotation date is required'),

  companyName: z.string().trim().min(2, 'Company name is required'),
  companyContactNo: z
    .string()
    .trim()
    .max(10, 'Maximum 10 digits')
    .regex(/^\d*$/, 'Digits only')
    .optional()
    .or(z.literal('')),
  companyGstNo: z.string().trim().max(15, 'Maximum 15 characters').optional().or(z.literal('')),
  companyAddress: z.string().trim().max(200, 'Maximum 200 characters').optional().or(z.literal('')),
})

// --- Step 2: Enquiry & Material ----------------------------------------------------
export const quotationEnquiryMaterialSchema = z.object({
  enquiryDate: z.string().optional().or(z.literal('')),
  referenceDocumentId: z.string().trim().optional().or(z.literal('')),
  enquiryByPerson: z.string().trim().optional().or(z.literal('')),

  materialName: z.string().trim().optional().or(z.literal('')),
  packagingType: z.string().trim().optional().or(z.literal('')),
  weight: z.coerce.number().min(0, 'Cannot be negative').default(0),
  unit: z.enum(['MT', 'QT', 'KG', 'Fixed']).default('MT'),

  articles: z.array(quotationArticleSchema).max(5, 'Maximum 5 articles allowed').default([]),
})

// --- Step 3: Trip Details ------------------------------------------------------------

export const quotationLocationSchema = z.object({
  value: z.string().trim().min(1, 'Address is required'),
})

export const quotationTripSchema = z.object({
  loadType: z.enum(['Full Load', 'Part Load'], { error: 'Select a load type' }),
  fromAddresses: z
    .array(quotationLocationSchema)
    .min(1, 'At least one pickup address is required')
    .max(5, 'Maximum 5 pickup addresses allowed'),
  toAddresses: z
    .array(quotationLocationSchema)
    .min(1, 'At least one delivery address is required')
    .max(5, 'Maximum 5 delivery addresses allowed'),
  loadingDate: z.string().optional().or(z.literal('')),
  tripType: z.enum(['Oneway', 'Round'], { error: 'Select a trip type' }),
})
// --- Step 4: Vehicle & Freight -------------------------------------------------------
export const quotationVehicleFreightSchema = z.object({
  vehicleType: z.string().min(1, 'Select a vehicle type'),

  guaranteeWeight: z.coerce.number().min(0, 'Cannot be negative').default(0),
  guaranteeWeightUnit: z.enum(['MT', 'QT', 'KG']).default('MT'),
  rate: z.coerce.number().min(0, 'Cannot be negative').default(0),
  rateType: z.enum(['Per MT', 'Per QT', 'Per KG', 'Fixed']).default('Per MT'),
  oversize: z.enum(['0', '1']).default('0'),
  oversizeSide: z.enum(['driver', 'driver opposite', 'conductor', 'height', 'all']).optional(),
  noOfVehicle: z.coerce.number().int('Must be a whole number').min(0, 'Cannot be negative').default(0),

  freightAmount: z.coerce.number().min(0).default(0),
  loadingCharge: z.coerce.number().min(0, 'Cannot be negative').default(0),
  unloadingCharge: z.coerce.number().min(0, 'Cannot be negative').default(0),
  serviceCharge: z.coerce.number().min(0, 'Cannot be negative').default(0),
  odcCharge: z.coerce.number().min(0, 'Cannot be negative').default(0),
  otherCharge: z.coerce.number().min(0, 'Cannot be negative').default(0),
  tollTax: z.coerce.number().min(0, 'Cannot be negative').default(0),
  totalFreight: z.coerce.number().min(0).default(0),

  gstPercent: z.enum(['5', '12', '18', '28'], { error: 'Select applicable GST' }),
  freightAmountWithGst: z.coerce.number().min(0).default(0),
})

// --- Step 5: Payment & Demurrage -----------------------------------------------------
export const quotationPaymentDemurrageSchema = z.object({
  paidBy: z.enum(['Consignor', 'Consignee'], { error: 'Select who pays' }),
  requiredDriverCash: z.coerce.number().min(0, 'Cannot be negative').default(0),
  advanceType: z.enum(['10%', '20%', '30%', '40%', '50%', 'Fixed']).default('10%'),
  advanceAmount: z.coerce.number().min(0, 'Cannot be negative').default(0),
  paymentCycle: z.enum(['1', '2', '3', '7', '15', '30', '45', '60', '75', '90', '180']).default('7'),
  quotationValidUpto: z.string().min(1, 'Validity date is required'),
  remarks: z.string().trim().optional().or(z.literal('')),

  demurrageCharge: z.coerce.number().min(0, 'Cannot be negative').default(0),
  demurrageChargeType: z.enum(['1', '2']).default('1'),
  demurrageChargeApplicableAfter: z.string().optional().or(z.literal('')),
})

// --- PDF options + system fields -----------------------------------------------------
export const quotationPdfSchema = z.object({
  hideGeneratedDatetimeFromPdf: z.boolean().default(false),
})

export const quotationSystemSchema = z.object({
  quotationId: z.coerce.number().default(0),
  tag: z.enum(['insert', 'update']).default('insert'),
})

export const createQuotationSchema = quotationCompanySchema
  .extend(quotationEnquiryMaterialSchema.shape)
  .extend(quotationTripSchema.shape)
  .extend(quotationVehicleFreightSchema.shape)
  .extend(quotationPaymentDemurrageSchema.shape)
  .extend(quotationPdfSchema.shape)
  .extend(quotationSystemSchema.shape)
  .superRefine((values, ctx) => {
    if (values.oversize === '1' && !values.oversizeSide) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select an oversize side',
        path: ['oversizeSide'],
      })
    }
  })

export type CreateQuotationFormValues = z.infer<typeof createQuotationSchema>
export type QuotationArticleFormValues = z.infer<typeof quotationArticleSchema>
