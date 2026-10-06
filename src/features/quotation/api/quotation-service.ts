import type { Quotation } from '@/types/quotation'
import { apiClient } from '@/api/axios-instance'

export interface QuotationListParams {
  page?: number
  pageSize?: number
  search?: string
  searchFields?: string
  status?: string
}

const QUOTATION_SEARCH_FIELDS = 'quotationNumber,customerName,companyName,materialName,from,to'

function pickFirstDefined<T>(...values: Array<T | undefined | null>): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }
  return undefined
}

function toCamelCase(value: string): string {
  return value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

function normalizeStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[|,;\n]+/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function normalizeAddresses(value: unknown): Quotation['addresses'] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null

      const record = item as Record<string, unknown>
      const address = pickFirstDefined(
        String(record.address ?? ''),
        String(record.value ?? ''),
        String(record.location ?? ''),
      )

      if (!address) return null

      return {
        addressType: pickFirstDefined(record.addressType, record.address_type, 'FROM') as 'FROM' | 'TO',
        sequenceNo: Number(pickFirstDefined(record.sequenceNo, record.sequence_no, 1)) || 1,
        address,
      }
    })
    .filter(Boolean) as Quotation['addresses']
}

function normalizeQuotationRecord(record: unknown): Quotation | undefined {
  if (!record || typeof record !== 'object') {
    return undefined
  }

  const item = record as Record<string, unknown>
  const detail = item.detail && typeof item.detail === 'object' ? (item.detail as Record<string, unknown>) : {}
  const explicitDetail = Object.fromEntries(
    Object.entries(detail).map(([key, value]) => [toCamelCase(key), value]),
  )

  const rawFromAddresses = Array.isArray(explicitDetail.fromAddresses)
    ? explicitDetail.fromAddresses
    : Array.isArray(explicitDetail.from_addresses)
      ? explicitDetail.from_addresses
      : []

  const rawToAddresses = Array.isArray(explicitDetail.toAddresses)
    ? explicitDetail.toAddresses
    : Array.isArray(explicitDetail.to_addresses)
      ? explicitDetail.to_addresses
      : []

  const companyName = pickFirstDefined(
    item.companyName,
    item.company_name,
    item.company,
    explicitDetail.companyName,
    explicitDetail.company_name,
  ) as string | undefined

  const customerName = pickFirstDefined(
    item.customerName,
    item.customer_name,
    item.customer,
    explicitDetail.customerName,
    explicitDetail.customer_name,
  ) as string | undefined

  const contactNumber = pickFirstDefined(
    item.contactNumber,
    item.contact_number,
    item.contact,
    explicitDetail.contactNumber,
    explicitDetail.contact_number,
  ) as string | number | undefined

  const quotationNumber = pickFirstDefined(
    item.quotationNumber,
    item.quotation_number,
    item.quotationNo,
    item.quotation_no,
    explicitDetail.quotationNumber,
    explicitDetail.quotation_number,
  ) as string | undefined

  const quotationGeneratedDate = pickFirstDefined(
    item.quotationGeneratedDate,
    item.quotation_generated_date,
    item.quotationDate,
    item.quotation_date,
    item.date,
    explicitDetail.quotationGeneratedDate,
    explicitDetail.quotation_generated_date,
    explicitDetail.quotationDate,
  ) as string | undefined

  const materialName = pickFirstDefined(
    item.materialName,
    item.material_name,
    explicitDetail.materialName,
    explicitDetail.material_name,
  ) as string | undefined

  const pickup = pickFirstDefined(
    item.pickup,
    item.pickupAddress,
    item.pickup_address,
    item.from,
    explicitDetail.pickup,
    explicitDetail.pickupAddress,
    explicitDetail.pickup_address,
    Array.isArray(rawFromAddresses) ? rawFromAddresses[0] : undefined,
    Array.isArray(rawFromAddresses) ? String(rawFromAddresses[0] ?? '') : undefined,
  ) as string | undefined

  const destination = pickFirstDefined(
    item.destination,
    item.destinationAddress,
    item.destination_address,
    item.to,
    explicitDetail.destination,
    explicitDetail.destinationAddress,
    explicitDetail.destination_address,
    Array.isArray(rawToAddresses) ? rawToAddresses[0] : undefined,
    Array.isArray(rawToAddresses) ? String(rawToAddresses[0] ?? '') : undefined,
  ) as string | undefined

  const addresses = normalizeAddresses(
    pickFirstDefined(item.addresses, item.addressesList, explicitDetail.addresses, explicitDetail.addressesList),
  ) ?? []

  const normalizedFromAddresses = normalizeStringList(
    pickFirstDefined(
      item.fromAddresses,
      item.from_addresses,
      explicitDetail.fromAddresses,
      explicitDetail.from_addresses,
      item.from,
      item.fromAddress,
      item.from_address,
    ),
  )

  const normalizedToAddresses = normalizeStringList(
    pickFirstDefined(
      item.toAddresses,
      item.to_addresses,
      explicitDetail.toAddresses,
      explicitDetail.to_addresses,
      item.to,
      item.toAddress,
      item.to_address,
    ),
  )

  const total = pickFirstDefined(
    item.total,
    item.totalFreight,
    item.total_freight,
    item.freightAmountWithGst,
    item.freight_amount_with_gst,
    explicitDetail.total,
    explicitDetail.totalFreight,
    explicitDetail.total_freight,
    explicitDetail.freightAmountWithGst,
  ) as number | undefined

  const vehicleType = pickFirstDefined(
    item.vehicleType,
    item.vehicle_type,
    explicitDetail.vehicleType,
    explicitDetail.vehicle_type,
  ) as string | undefined

  const materials = Array.isArray(item.materials)
    ? item.materials.map((material) => {
        const record = material as Record<string, unknown>
        return {
          numberOfArticle: Number(record.numberOfArticle ?? 0),
          length: Number(record.length ?? 0),
          width: Number(record.width ?? 0),
          height: Number(record.height ?? 0),
        }
      })
    : undefined

  const detailRecord = {
    ...explicitDetail,
    quotationNo: pickFirstDefined(item.quotationNo, item.quotation_no, explicitDetail.quotationNo, explicitDetail.quotation_no),
    quotationDate: pickFirstDefined(
      item.quotationDate,
      item.quotation_date,
      item.quotationGeneratedDate,
      item.quotation_generated_date,
      explicitDetail.quotationDate,
      explicitDetail.quotation_date,
      explicitDetail.quotationGeneratedDate,
      explicitDetail.quotation_generated_date,
    ),
    companyName,
    customerName,
    companyContactNo: contactNumber === undefined ? undefined : String(contactNumber),
    companyGstNo: item.gstNumber ?? item.gst_number,
    companyAddress: item.companyAddress ?? item.company_address,
    materialName,
    enquiryDate: item.enquiryDate ?? item.enquiry_date,
    referenceDocumentId: item.referenceDocumentId ?? item.reference_document_id,
    enquiryByPerson: item.enquiryByPerson ?? item.enquiry_by_person,
    packagingType: item.packagingType ?? item.packaging_type,
    weight: Number(item.weight ?? 0),
    unit: item.weightUnit ?? item.weight_unit ?? 'MT',
    articles: materials ?? [],
    loadType: item.loadType,
    fromAddresses: normalizedFromAddresses.length > 0 ? normalizedFromAddresses : undefined,
    toAddresses: normalizedToAddresses.length > 0 ? normalizedToAddresses : undefined,
    loadingDate: item.loadingDate ?? item.loading_date,
    tripType: item.tripType ?? item.trip_type,
    vehicleType,
    guaranteeWeight: Number(item.guaranteeWeight ?? 0),
    guaranteeWeightUnit: item.vehicleWeightUnit ?? item.vehicle_weight_unit ?? 'MT',
    rate: Number(item.rate ?? 0),
    rateType: item.rateType ?? item.rate_type,
    oversize: String(item.overSize ?? item.oversize ?? '0'),
    noOfVehicle: Number(item.numberOfVehicle ?? item.noOfVehicle ?? 0),
    freightAmount: pickFirstDefined(
      item.freightAmount,
      item.freight_amount,
      explicitDetail.freightAmount,
      explicitDetail.freight_amount,
    ) as number | undefined,
    loadingCharge: Number(item.loadingCharge ?? item.loading_charge ?? 0),
    unloadingCharge: Number(item.unloadingCharge ?? item.unloading_charge ?? 0),
    serviceCharge: Number(item.serviceCharge ?? item.service_charge ?? 0),
    odcCharge: Number(item.odcCharge ?? item.odc_charge ?? 0),
    otherCharge: Number(item.otherCharge ?? item.other_charge ?? 0),
    tollTax: Number(item.tollTax ?? item.toll_tax ?? 0),
    totalFreight: pickFirstDefined(
      item.totalFreight,
      item.total_freight,
      explicitDetail.totalFreight,
      explicitDetail.total_freight,
      total,
    ) as number | undefined,
    quotationValidUpto: pickFirstDefined(
      item.quotationValidUpto,
      item.quotation_valid_upto,
      item.validity,
      explicitDetail.quotationValidUpto,
      explicitDetail.quotation_valid_upto,
      explicitDetail.validity,
    ) as string | undefined,
    gstPercent: Number(item.applicableGstPercent ?? item.applicable_gst_percent ?? 0),
    freightAmountWithGst: Number(item.freightAmountWithGst ?? item.freight_amount_with_gst ?? 0),
    requiredDriverCash: Number(item.requiredDriverCash ?? item.required_driver_cash ?? 0),
    advanceType: item.advanceType ?? item.advance_type,
    advanceAmount: Number(item.advanceAmount ?? item.advance_amount ?? 0),
    remarks: item.remarks,
    demurrageCharge: Number(item.demurrageCharge ?? item.demurrage_charge ?? 0),
    demurrageChargeType: String(item.demurrageChargeType ?? item.demurrage_charge_type ?? '1'),
    demurrageChargeApplicableAfter: item.demurrageChargeApplicableAfter ?? item.demurrage_charge_applicable_after ?? '',
    hideGeneratedDatetimeFromPdf: item.hideGeneratedDateFromPdf ?? item.hide_generated_date_from_pdf ?? false,
    paymentCycle: pickFirstDefined(item.paymentCycle, item.payment_cycle, explicitDetail.paymentCycle, explicitDetail.payment_cycle),
    paidBy: pickFirstDefined(item.paidBy, item.paid_by, explicitDetail.paidBy, explicitDetail.paid_by),
  }

  const normalized: Quotation = {
    id: pickFirstDefined(item.id, item.quotationId, item.quotation_id, item.quotationNo, item.quotation_no) as
      | string
      | number
      | undefined,
    quotationNumber: String(quotationNumber ?? item.id ?? ''),
    date: String(quotationGeneratedDate ?? item.date ?? ''),
    quotationGeneratedDate: String(quotationGeneratedDate ?? item.date ?? ''),
    customerName: String(customerName ?? companyName ?? ''),
    companyName: String(companyName ?? customerName ?? ''),
    vehicleType: String(vehicleType ?? ''),
    pickup: String(pickup ?? normalizedFromAddresses[0] ?? ''),
    destination: String(destination ?? normalizedToAddresses[0] ?? ''),
    addresses: addresses.length > 0 ? addresses : undefined,
    weightKg: Number(pickFirstDefined(item.weightKg, item.weight_kg, explicitDetail.weightKg, explicitDetail.weight_kg, 0) ?? 0),
    rate: Number(pickFirstDefined(item.rate, explicitDetail.rate, 0) ?? 0),
    gstPercent: Number(pickFirstDefined(item.gstPercent, item.gst_percent, explicitDetail.gstPercent, explicitDetail.gst_percent, 0) ?? 0),
    discount: Number(pickFirstDefined(item.discount, explicitDetail.discount, 0) ?? 0),
    total: Number(total ?? 0),
    totalFreight: Number(pickFirstDefined(item.totalFreight, item.total_freight, explicitDetail.totalFreight, explicitDetail.total_freight, total, 0) ?? 0),
    validity: pickFirstDefined(item.validity, item.quotationValidUpto, item.quotation_valid_upto, explicitDetail.validity, explicitDetail.quotationValidUpto, explicitDetail.quotation_valid_upto) as string | undefined,
    quotationValidUpto: pickFirstDefined(item.quotationValidUpto, item.quotation_valid_upto, item.validity, explicitDetail.quotationValidUpto, explicitDetail.quotation_valid_upto, explicitDetail.validity) as string | undefined,
    status: pickFirstDefined(item.status, item.quotationStatus, item.quotation_status, explicitDetail.status, explicitDetail.quotationStatus, explicitDetail.quotation_status) as Quotation['status'],
    detail: detailRecord as unknown as Quotation['detail'],
    contactNumber: contactNumber === undefined ? undefined : String(contactNumber),
    materials,
  }

  return normalized
}

function normalizeListResponse(responseData: unknown): { data: Quotation[]; total: number } {
  const recordList = (() => {
    if (Array.isArray(responseData)) return responseData
    if (responseData && typeof responseData === 'object') {
      const candidates = ['data', 'items', 'result', 'rows', 'records']
      for (const key of candidates) {
        const value = (responseData as Record<string, unknown>)[key]
        if (Array.isArray(value)) return value
      }
    }
    return []
  })()

  const normalized = recordList
    .map((item) => normalizeQuotationRecord(item))
    .filter((item): item is Quotation => Boolean(item))

  const total =
    typeof responseData === 'object' && responseData !== null
      ? Number(
          pickFirstDefined(
            (responseData as Record<string, unknown>).total,
            (responseData as Record<string, unknown>).count,
            (responseData as Record<string, unknown>).totalCount,
            (responseData as Record<string, unknown>).totalRecords,
          ) ?? normalized.length,
        )
      : normalized.length

  return {
    data: normalized,
    total: Number.isFinite(total) ? Number(total) : normalized.length,
  }
}

export async function fetchQuotations(params: QuotationListParams = {}): Promise<{ data: Quotation[]; total: number }> {
  const { page = 1, pageSize = 20, search, status } = params

  const { data } = await apiClient.get('/transport-quotations', {
    params: {
      page,
      pageSize,
      ...(search ? { search } : {}),
      ...(search ? { searchFields: QUOTATION_SEARCH_FIELDS } : {}),
      ...(status ? { status } : {}),
    },
  })

  return normalizeListResponse(data)
}

export async function fetchQuotationNumber(): Promise<number> {
  const pageSize = 100
  const firstPage = await fetchQuotations({ page: 1, pageSize })
  let highestId = 0

  const includeIds = (quotations: Quotation[]) => {
    for (const quotation of quotations) {
      const id = Number(quotation.id)
      if (Number.isSafeInteger(id) && id > highestId) highestId = id
    }
  }

  includeIds(firstPage.data)
  const pageCount = Math.ceil(firstPage.total / pageSize)

  for (let page = 2; page <= pageCount; page += 1) {
    const result = await fetchQuotations({ page, pageSize })
    includeIds(result.data)
  }

  return highestId || 1
}

// Edit existing quotation
export async function fetchQuotationById(id: string | number): Promise<Quotation | undefined> {
  const response = await apiClient.get(`/transport-quotations/${id}`)
  const normalized = normalizeQuotationRecord(response.data?.data ?? response.data)
  return normalized ?? undefined
}

export async function createQuotation(payload: Partial<Quotation>): Promise<Quotation> {
  const response = await apiClient.post('/transport-quotations', payload)
  return normalizeQuotationRecord(response.data?.data ?? response.data) ?? (response.data?.data ?? response.data)
}

export async function updateQuotation(id: number | string, payload: Partial<Quotation>): Promise<Quotation> {
  const response = await apiClient.put(`/transport-quotations/${id}`, payload)
  return normalizeQuotationRecord(response.data?.data ?? response.data) ?? (response.data?.data ?? response.data)
}

export async function deleteQuotation(id: number | string): Promise<void> {
  await apiClient.delete(`/transport-quotations/${id}`)
}
