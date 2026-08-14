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
export function mapQuotationFormToPayload(values: CreateQuotationFormValues): Partial<Quotation> {
  const cargoWeightKg = values.weight
    ? convertToKg(values.weight, values.unit === 'Fixed' ? 'KG' : values.unit)
    : convertToKg(values.guaranteeWeight, values.guaranteeWeightUnit)

  return {
    customerName: values.companyName,
    vehicleType: values.vehicleType,
    pickup: values.fromAddresses[0] ?? '',
    destination: values.toAddresses[0] ?? '',
    weightKg: cargoWeightKg,
    rate: values.rate,
    gstPercent: Number(values.gstPercent),
    discount: 0,
    total: values.freightAmountWithGst,
    validity: values.quotationValidUpto,
    detail: {
      quotationNo: values.quotationNo,
      quotationDate: values.quotationDate,
      companyName: values.companyName,
      companyContactNo: values.companyContactNo || undefined,
      companyGstNo: values.companyGstNo || undefined,
      companyAddress: values.companyAddress || undefined,

      enquiryDate: values.enquiryDate || undefined,
      referenceDocumentId: values.referenceDocumentId || undefined,
      enquiryByPerson: values.enquiryByPerson || undefined,

      materialName: values.materialName || undefined,
      packagingType: values.packagingType || undefined,
      weight: values.weight,
      unit: values.unit,
      articles: values.articles,

      loadType: values.loadType,
      fromAddresses: values.fromAddresses,
      toAddresses: values.toAddresses,
      loadingDate: values.loadingDate || undefined,
      tripType: values.tripType,

      vehicleType: values.vehicleType,
      guaranteeWeight: values.guaranteeWeight,
      guaranteeWeightUnit: values.guaranteeWeightUnit,
      rate: values.rate,
      rateType: values.rateType,
      oversize: values.oversize,
      oversizeSide: values.oversize === '1' ? values.oversizeSide : undefined,
      noOfVehicle: values.noOfVehicle,

      freightAmount: values.freightAmount,
      loadingCharge: values.loadingCharge,
      unloadingCharge: values.unloadingCharge,
      serviceCharge: values.serviceCharge,
      odcCharge: values.odcCharge,
      otherCharge: values.otherCharge,
      tollTax: values.tollTax,
      totalFreight: values.totalFreight,
      gstPercent: Number(values.gstPercent),
      freightAmountWithGst: values.freightAmountWithGst,

      paidBy: values.paidBy,
      requiredDriverCash: values.requiredDriverCash,
      advanceType: values.advanceType,
      advanceAmount: values.advanceAmount,
      paymentCycle: values.paymentCycle,
      quotationValidUpto: values.quotationValidUpto,
      remarks: values.remarks || undefined,

      demurrageCharge: values.demurrageCharge,
      demurrageChargeType: values.demurrageChargeType,
      demurrageChargeApplicableAfter: values.demurrageChargeApplicableAfter || undefined,

      hideGeneratedDatetimeFromPdf: values.hideGeneratedDatetimeFromPdf,
    },
  }
}
