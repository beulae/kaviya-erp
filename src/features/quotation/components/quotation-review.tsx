import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/utils/format'
import { OVERSIZE_SIDE_OPTIONS, DEMURRAGE_CHARGE_TYPE_OPTIONS } from '../constants/options'
import type { CreateQuotationFormValues } from '../schemas/quotation-schema'

interface QuotationReviewProps {
  values: CreateQuotationFormValues
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-xs text-[var(--color-muted-foreground)]">{label}</span>
      <span className="text-right text-sm font-medium text-[var(--color-foreground)]">{value}</span>
    </div>
  )
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-[var(--color-border)]/60">{children}</CardContent>
    </Card>
  )
}

const dateOrDash = (value?: string) => (value ? formatDate(value) : undefined)

export function QuotationReview({ values }: QuotationReviewProps) {
  const oversizeSideLabel = OVERSIZE_SIDE_OPTIONS.find((o) => o.value === values.oversizeSide)?.label
  const demurrageTypeLabel = DEMURRAGE_CHARGE_TYPE_OPTIONS.find((o) => o.value === values.demurrageChargeType)?.label

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-muted-foreground)]">
        Review every section below before generating the quotation. Use Back to make changes.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReviewSection title="Quotation">
          <Row label="Quotation No." value={values.quotationNo} />
          <Row label="Quotation Date" value={dateOrDash(values.quotationDate)} />
        </ReviewSection>

        <ReviewSection title="Company">
          <Row label="Company Name" value={values.companyName} />
          <Row label="Contact No." value={values.companyContactNo} />
          <Row label="GST No." value={values.companyGstNo} />
          <Row label="Address" value={values.companyAddress} />
        </ReviewSection>

        <ReviewSection title="Enquiry">
          <Row label="Enquiry Date" value={dateOrDash(values.enquiryDate)} />
          <Row label="Reference Document ID" value={values.referenceDocumentId} />
          <Row label="Enquiry By" value={values.enquiryByPerson} />
        </ReviewSection>

        <ReviewSection title="Material">
          <Row label="Material Name" value={values.materialName} />
          <Row label="Packaging Type" value={values.packagingType} />
          <Row label="Weight" value={values.weight ? `${values.weight} ${values.unit}` : undefined} />
          {values.articles.length > 0 && (
            <div className="pt-2">
              <p className="mb-1 text-xs font-medium text-[var(--color-muted-foreground)]">Articles</p>
              <ul className="space-y-1 text-sm text-[var(--color-foreground)]">
                {values.articles.map((a, i) => (
                  <li key={i}>
                    #{i + 1} — Qty {a.numberOfArticle}, {a.length} × {a.width} × {a.height}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ReviewSection>

        <ReviewSection title="Trip">
          <Row label="Load Type" value={values.loadType} />
          <Row label="Trip Type" value={values.tripType === 'Round' ? 'Round Trip' : 'Oneway Trip'} />
          <Row label="Loading Date" value={dateOrDash(values.loadingDate)} />
          <div className="pt-2">
            <p className="mb-1 text-xs font-medium text-[var(--color-muted-foreground)]">From</p>
            <p className="text-sm text-[var(--color-foreground)]">{values.fromAddresses.filter(Boolean).join(' • ')}</p>
          </div>
          <div className="pt-2">
            <p className="mb-1 text-xs font-medium text-[var(--color-muted-foreground)]">To</p>
            <p className="text-sm text-[var(--color-foreground)]">{values.toAddresses.filter(Boolean).join(' • ')}</p>
          </div>
        </ReviewSection>

        <ReviewSection title="Vehicle">
          <Row label="Vehicle Type" value={values.vehicleType} />
          <Row label="Guarantee Weight" value={`${values.guaranteeWeight} ${values.guaranteeWeightUnit}`} />
          <Row label="Rate" value={`${formatCurrency(values.rate)} (${values.rateType})`} />
          <Row label="No. of Vehicles" value={values.noOfVehicle} />
          <Row label="Oversize" value={values.oversize === '1' ? 'Yes' : 'No'} />
          {values.oversize === '1' && <Row label="Oversize Side" value={oversizeSideLabel} />}
        </ReviewSection>

        <ReviewSection title="Freight">
          <Row label="Freight Amount" value={formatCurrency(values.freightAmount)} />
          <Row label="Loading Charge" value={formatCurrency(values.loadingCharge)} />
          <Row label="Unloading Charge" value={formatCurrency(values.unloadingCharge)} />
          <Row label="Service Charge" value={formatCurrency(values.serviceCharge)} />
          <Row label="ODC Charge" value={formatCurrency(values.odcCharge)} />
          <Row label="Other Charge" value={formatCurrency(values.otherCharge)} />
          <Row label="Toll Tax" value={formatCurrency(values.tollTax)} />
          <Row label="Total Freight" value={<strong>{formatCurrency(values.totalFreight)}</strong>} />
          <Row label="GST %" value={`${values.gstPercent}%`} />
          <Row
            label="Freight Amount With GST"
            value={
              <strong className="text-[var(--color-primary)]">{formatCurrency(values.freightAmountWithGst)}</strong>
            }
          />
        </ReviewSection>

        <ReviewSection title="Payment">
          <Row label="Paid By" value={values.paidBy} />
          <Row label="Required Driver Cash" value={formatCurrency(values.requiredDriverCash)} />
          <Row label="Advance Type" value={values.advanceType} />
          <Row label="Advance Amount" value={formatCurrency(values.advanceAmount)} />
          <Row label="Payment Cycle" value={`${values.paymentCycle} Day(s)`} />
          <Row label="Quotation Valid Upto" value={dateOrDash(values.quotationValidUpto)} />
          <Row label="Remarks" value={values.remarks} />
        </ReviewSection>

        <ReviewSection title="Demurrage">
          <Row label="Demurrage Charge" value={formatCurrency(values.demurrageCharge)} />
          <Row label="Charge Type" value={demurrageTypeLabel} />
          <Row label="Applicable After" value={values.demurrageChargeApplicableAfter} />
        </ReviewSection>

        <ReviewSection title="PDF Options">
          <Row label="Hide Generated Datetime" value={values.hideGeneratedDatetimeFromPdf ? 'Yes' : 'No'} />
        </ReviewSection>
      </div>
    </div>
  )
}
