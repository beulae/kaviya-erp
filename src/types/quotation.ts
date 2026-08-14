export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'

export interface QuotationArticle {
  numberOfArticle: number
  length: number
  width: number
  height: number
}

/**
 * Full transport-quotation detail captured by the multi-step quotation wizard
 * (see features/quotation/schemas/quotation-schema.ts). Stored alongside the
 * summary `Quotation` fields below so list views keep working unchanged while
 * the complete payload is preserved for the review screen / backend.
 */
export interface QuotationDetail {
  quotationNo: number
  quotationDate: string
  companyName: string
  companyContactNo?: string
  companyGstNo?: string
  companyAddress?: string

  enquiryDate?: string
  referenceDocumentId?: string
  enquiryByPerson?: string

  materialName?: string
  packagingType?: string
  weight: number
  unit: string
  articles: QuotationArticle[]

  loadType: string
  fromAddresses: string[]
  toAddresses: string[]
  loadingDate?: string
  tripType: string

  vehicleType: string
  guaranteeWeight: number
  guaranteeWeightUnit: string
  rate: number
  rateType: string
  oversize: string
  oversizeSide?: string
  noOfVehicle: number

  freightAmount: number
  loadingCharge: number
  unloadingCharge: number
  serviceCharge: number
  odcCharge: number
  otherCharge: number
  tollTax: number
  totalFreight: number
  gstPercent: number
  freightAmountWithGst: number

  paidBy: string
  requiredDriverCash: number
  advanceType: string
  advanceAmount: number
  paymentCycle: string
  quotationValidUpto: string
  remarks?: string

  demurrageCharge: number
  demurrageChargeType: string
  demurrageChargeApplicableAfter?: string

  hideGeneratedDatetimeFromPdf: boolean
}

export interface Quotation {
  id: string
  quotationNumber: string
  date: string
  customerName: string
  vehicleType: string
  pickup: string
  destination: string
  weightKg: number
  rate: number
  gstPercent: number
  discount: number
  total: number
  validity: string
  status: QuotationStatus
  /** Complete wizard payload, present for quotations created via the new form. */
  detail?: QuotationDetail
}
