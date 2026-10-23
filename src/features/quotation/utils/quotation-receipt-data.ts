import type { Quotation } from '@/types/quotation'
import type { TransporterProfile } from '@/types/profile'
import { amountInWords } from './amount-in-words'
import { calculateFreightWithGst, calculateGstAmount } from './quotation-calculations'

/**
 * Everything the quotation receipt PDF prints, already resolved to display
 * strings. Keeping this a plain, DOM-free structure means the PDF renderer
 * has zero business logic and the mapping can be unit tested on its own.
 */
export interface QuotationReceiptData {
  transporter: {
    name: string
    address: string
    transportRegNo: string
    email: string
    gstin: string
    mobile: string
  }
  quotationNo: string
  date: string
  customer: { name: string; gstin: string; contactNo: string; address: string }
  enquiryLine: string
  material: { name: string; packagingLines: string[]; weight: string; articleLines: string[] }
  trip: {
    loadType: string
    fromLines: string[]
    toLines: string[]
    tripLabel: string
    trucks: string
    guaranteeWeight: string
    freightRate: string
  }
  terms: {
    validUpto: string
    loadingDate: string
    freightPayableBy: string
    advance: string
    requiredDriverCash: string
    paymentCycle: string
    remark: string
    demurrageAfter: string
    demurrageCharges: string
  }
  charges: { label: string; amount: string }[]
  totals: {
    totalFreight: string
    gstLabel: string
    gstAmount: string
    totalWithGst: string
    inWords: string
  }
  /** Undefined when the user ticked "hide generated datetime from PDF". */
  generatedAt?: string
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** dd/mm/yyyy, without letting timezones shift date-only strings. */
export function formatReceiptDate(value?: string | Date | null): string {
  if (!value) return ''
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (match) return `${match[3]}/${match[2]}/${match[1]}`
  }
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`
}

function formatGeneratedAt(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
}

const num = (value: number | undefined | null): string =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number.isFinite(value) ? Number(value) : 0)

const clean = (value?: string | null) => (value ?? '').trim()
const upper = (value?: string | null) => clean(value).toUpperCase()

/** Zero-padded quotation number as printed on the receipt (e.g. 3 → "0003"). */
export function formatQuotationNo(quotation: Quotation): string {
  const fromDetail = quotation.detail?.quotationNo
  if (fromDetail !== undefined && fromDetail !== null && Number.isFinite(Number(fromDetail))) {
    return String(fromDetail).padStart(4, '0')
  }
  return String(quotation.quotationNumber ?? quotation.id ?? '')
}

function addressLines(quotation: Quotation, type: 'FROM' | 'TO'): string[] {
  const detailLines = type === 'FROM' ? quotation.detail?.fromAddresses : quotation.detail?.toAddresses
  if (detailLines?.length) return detailLines.map(clean).filter(Boolean)

  const fromApi = (quotation.addresses ?? [])
    .filter((item) => item.addressType === type)
    .sort((a, b) => a.sequenceNo - b.sequenceNo)
    .map((item) => clean(item.address))
    .filter(Boolean)
  if (fromApi.length) return fromApi

  const single = type === 'FROM' ? quotation.pickup : quotation.destination
  return single ? [clean(single)] : []
}

function demurrageUnit(type?: string): string {
  return type === '1' ? 'HOUR' : 'DAY'
}

export function buildQuotationReceiptData(
  quotation: Quotation,
  profile: Pick<
    TransporterProfile,
    'transporterName' | 'address' | 'registrationNumber' | 'email' | 'gstNumber' | 'contactNo1'
  >,
  now: Date = new Date(),
): QuotationReceiptData {
  const d = quotation.detail

  const gstPercent = Number(d?.gstPercent ?? quotation.gstPercent ?? 0)
  // Legacy summary rows only store `total`, which already includes GST, so the
  // pre-GST freight is backed out of it instead of being taxed a second time.
  const totalFreight = Number(
    d?.totalFreight ??
      quotation.totalFreight ??
      (quotation.total !== undefined ? Math.round((quotation.total / (1 + gstPercent / 100)) * 100) / 100 : 0),
  )
  const gstAmount = calculateGstAmount(totalFreight, gstPercent)
  const totalWithGst = calculateFreightWithGst(totalFreight, gstAmount)
  // Summary-only records (no wizard detail) only know the grand total, so it
  // is shown against the freight line rather than silently dropped.
  const freightAmount = Number(d?.freightAmount ?? (d ? 0 : totalFreight))

  const articles = d?.articles ?? []
  const packagingType = clean(d?.packagingType)
  const dimensionLines = articles.map((a) => `${num(a.length)} x ${num(a.width)} x ${num(a.height)}`)
  const packagingLines = [...(packagingType ? [packagingType] : []), ...dimensionLines]
  // Keep the article counts on the same rows as their dimensions.
  const articleLines = [...(packagingType ? [''] : []), ...articles.map((a) => String(a.numberOfArticle))]

  const weight = Number(d?.weight ?? 0)
  const tripType = d?.tripType === 'Round' ? 'Round' : d?.tripType === 'Oneway' ? 'Oneway' : ''
  const rate = Number(d?.rate ?? quotation.rate ?? 0)
  const advanceType = clean(d?.advanceType)
  const advanceAmount = num(d?.advanceAmount)
  const paymentCycle = Number(d?.paymentCycle ?? 0)
  const referenceId = clean(d?.referenceDocumentId)

  return {
    transporter: {
      name: upper(profile.transporterName),
      address: upper(profile.address),
      transportRegNo: clean(profile.registrationNumber),
      email: clean(profile.email),
      gstin: clean(profile.gstNumber),
      mobile: clean(profile.contactNo1),
    },
    quotationNo: formatQuotationNo(quotation),
    date: formatReceiptDate(d?.quotationDate ?? quotation.quotationGeneratedDate ?? quotation.date),
    customer: {
      name: upper(d?.companyName ?? quotation.companyName ?? quotation.customerName),
      gstin: clean(d?.companyGstNo),
      contactNo: clean(d?.companyContactNo),
      address: clean(d?.companyAddress),
    },
    enquiryLine: `WE ARE SENDING THE QUOTATION AGAINST YOUR ENQUIRY/REFERENCE ID : ${referenceId} DATED ${formatReceiptDate(d?.enquiryDate)} BY ${clean(d?.enquiryByPerson)} REGARDING YOUR MATERIAL AS BELOW.`,
    material: {
      name: clean(d?.materialName),
      packagingLines,
      weight: weight > 0 ? `${num(weight)} ${clean(d?.unit)}`.trim() : '',
      articleLines,
    },
    trip: {
      loadType: clean(d?.loadType),
      fromLines: addressLines(quotation, 'FROM'),
      toLines: addressLines(quotation, 'TO'),
      tripLabel: tripType ? `(${tripType} Trip)` : '(Trip)',
      trucks: d
        ? `${clean(d.vehicleType ?? quotation.vehicleType)} x ${Number(d.noOfVehicle ?? 0)}`.trim()
        : clean(quotation.vehicleType),
      guaranteeWeight: d
        ? `${num(d.guaranteeWeight ?? 0)} ${clean(d.guaranteeWeightUnit)}`.trim()
        : quotation.weightKg
          ? `${num(quotation.weightKg)} KG`
          : '0',
      freightRate: `Rs. ${num(rate)}${d?.rateType ? ` ${d.rateType}` : ''}`,
    },
    terms: {
      validUpto: formatReceiptDate(d?.quotationValidUpto ?? quotation.quotationValidUpto ?? quotation.validity),
      loadingDate: formatReceiptDate(d?.loadingDate),
      freightPayableBy: clean(d?.paidBy),
      advance: advanceType && advanceType !== 'Fixed' ? `${advanceAmount} (${advanceType})` : advanceAmount,
      requiredDriverCash: num(d?.requiredDriverCash),
      paymentCycle: paymentCycle > 0 ? `${paymentCycle} Days` : '0',
      remark: clean(d?.remarks),
      demurrageAfter: clean(d?.demurrageChargeApplicableAfter),
      demurrageCharges: `Rs. ${num(d?.demurrageCharge)} PER ${demurrageUnit(d?.demurrageChargeType)}`,
    },
    charges: [
      { label: 'FREIGHT AMOUNT', amount: num(freightAmount) },
      { label: 'LOADING CHARGES', amount: num(d?.loadingCharge) },
      { label: 'UNLOADING CHARGES', amount: num(d?.unloadingCharge) },
      { label: 'SERVICE CHARGES', amount: num(d?.serviceCharge) },
      { label: 'ODC CHARGES', amount: num(d?.odcCharge) },
      { label: 'OTHER CHARGES', amount: num(d?.otherCharge) },
      { label: 'TOLL TAX', amount: num(d?.tollTax) },
    ],
    totals: {
      totalFreight: num(totalFreight),
      gstLabel: `GST (${num(gstPercent)} %)`,
      gstAmount: num(gstAmount),
      totalWithGst: num(totalWithGst),
      inWords: amountInWords(totalWithGst),
    },
    generatedAt: d?.hideGeneratedDatetimeFromPdf ? undefined : formatGeneratedAt(now),
  }
}
