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

export interface QuotationAddress {
  addressType: 'FROM' | 'TO'
  sequenceNo: number
  address: string
}

export interface QuotationMaterial {
  numberOfArticle: number
  length: number
  width: number
  height: number
}

export interface Quotation {
  id?: string | number
  quotationNumber?: string
  date?: string
  quotationGeneratedDate?: string
  customerName?: string
  companyName?: string
  contactNumber?: string
  vehicleType?: string
  pickup?: string
  destination?: string
  addresses?: QuotationAddress[]
  materials?: QuotationMaterial[]
  weightKg?: number
  rate?: number
  gstPercent?: number
  discount?: number
  total?: number
  totalFreight?: number
  validity?: string
  quotationValidUpto?: string
  status?: QuotationStatus
  /** Complete wizard payload, present for quotations created via the new form. */
  detail?: QuotationDetail
}
