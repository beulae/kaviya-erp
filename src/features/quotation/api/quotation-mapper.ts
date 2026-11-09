import type { Quotation } from '@/types/quotation'
import { convertToKg } from '../utils/quotation-calculations'
import type { CreateQuotationFormValues } from '../schemas/quotation-schema'

/**
 * Maps the quotation wizard's form values onto the existing `Quotation` API
 * payload shape. Keeps the summary fields the list page already renders
 * (customerName, pickup, destination, total, ...) populated, while attaching
 * the complete captured detail under `detail` so nothing entered by the user
 * is silently dropped from the submission.
 */
export function mapQuotationFormToPayload(values: CreateQuotationFormValues): Partial<Quotation> & Record<string, unknown> {
  const cargoWeightKg = values.weight
    ? convertToKg(values.weight, values.unit === 'Fixed' ? 'KG' : values.unit)
    : convertToKg(values.guaranteeWeight, values.guaranteeWeightUnit)

  return {
    quotationNumber: String(values.quotationNo),
    quotationGeneratedDate: values.quotationDate,
    companyName: values.companyName,
    contactNumber: values.companyContactNo || undefined,
    gstNumber: values.companyGstNo || undefined,
    companyAddress: values.companyAddress || undefined,
    enquiryDate: values.enquiryDate || undefined,
    referenceDocumentId: values.referenceDocumentId || undefined,
    enquiryByPerson: values.enquiryByPerson || undefined,
    materialName: values.materialName || undefined,
    packagingType: values.packagingType || undefined,
    weight: values.weight,
    weightUnit: values.unit,
    loadType: values.loadType === 'Full Load' ? 'FTL' : 'PTL',
    loadingDate: values.loadingDate || undefined,
    tripType: values.tripType === 'Oneway' ? 'One Way' : 'Round Trip',
    vehicleType: values.vehicleType,
    guaranteeWeight: values.guaranteeWeight,
    vehicleWeightUnit: values.guaranteeWeightUnit,
    rate: values.rate,
    rateType: values.rateType === 'Per MT' ? 'Per Ton' : values.rateType,
    numberOfVehicle: values.noOfVehicle,
    freightAmount: values.freightAmount,
    loadingCharge: values.loadingCharge,
    unloadingCharge: values.unloadingCharge,
    serviceCharge: values.serviceCharge,
    odcCharge: values.odcCharge,
    otherCharge: values.otherCharge,
    tollTax: values.tollTax,
    totalFreight: values.totalFreight,
    applicableGstPercent: Number(values.gstPercent),
    paidBy: values.paidBy,
    requiredDriverCash: values.requiredDriverCash,
    advanceType: values.advanceType,
    advanceAmount: values.advanceAmount,
    paymentCycle: values.paymentCycle,
    quotationValidUpto: values.quotationValidUpto,
    remarks: values.remarks || undefined,
    hideGeneratedDateFromPdf: values.hideGeneratedDatetimeFromPdf,
    materials: values.articles.map((article) => ({
      numberOfArticle: article.numberOfArticle,
      length: article.length,
      width: article.width,
      height: article.height,
    })),
    addresses: [
      ...values.fromAddresses.map((item, index) => ({
        addressType: 'FROM' as const,
        sequenceNo: index + 1,
        address: item.value,
      })),
      ...values.toAddresses.map((item, index) => ({
        addressType: 'TO' as const,
        sequenceNo: index + 1,
        address: item.value,
      })),
    ],
    weightKg: cargoWeightKg,
  }
}