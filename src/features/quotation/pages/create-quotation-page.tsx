import * as React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { formatCurrency } from '@/utils/format'

import { createQuotationSchema, type CreateQuotationFormValues } from '../schemas/quotation-schema'
import { useCreateQuotation } from '../api/use-quotation'
import { mapQuotationFormToPayload } from '../api/quotation-mapper'
import {
  calculateFreight,
  calculateGstAmount,
  calculateTotalFreight,
  calculateFreightWithGst,
  type RateType,
  type WeightUnit,
} from '../utils/quotation-calculations'
import { QuotationStepper } from '../components/quotation-stepper'
import { AutocompleteInput } from '../components/autocomplete-input'
import { QuotationArticleFields } from '../components/quotation-article-fields'
import { QuotationLocationFields } from '../components/quotation-location-fields'
import { QuotationReview } from '../components/quotation-review'
import {
  WEIGHT_UNITS,
  GUARANTEE_WEIGHT_UNITS,
  LOAD_TYPES,
  TRIP_TYPES,
  VEHICLE_TYPES,
  RATE_TYPES,
  OVERSIZE_OPTIONS,
  OVERSIZE_SIDE_OPTIONS,
  GST_PERCENT_OPTIONS,
  PAID_BY_OPTIONS,
  ADVANCE_TYPE_OPTIONS,
  PAYMENT_CYCLE_OPTIONS,
  DEMURRAGE_CHARGE_TYPE_OPTIONS,
  DEMURRAGE_APPLICABLE_AFTER_OPTIONS,
  COMPANY_NAME_SUGGESTIONS,
  MAX_FROM_ADDRESSES,
  MAX_TO_ADDRESSES,
} from '../constants/options'

const todayIso = () => new Date().toISOString().slice(0, 10)
const validUptoIso = () => new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10)

const STEPS = [
  {
    key: 'quotation',
    label: 'Quotation & Company',
    fields: ['quotationNo', 'quotationDate', 'companyName', 'companyContactNo', 'companyGstNo', 'companyAddress'],
  },
  {
    key: 'material',
    label: 'Enquiry & Material',
    fields: [
      'enquiryDate',
      'referenceDocumentId',
      'enquiryByPerson',
      'materialName',
      'packagingType',
      'weight',
      'unit',
      'articles',
    ],
  },
  {
    key: 'trip',
    label: 'Trip Details',
    fields: ['loadType', 'fromAddresses', 'toAddresses', 'loadingDate', 'tripType'],
  },
  {
    key: 'freight',
    label: 'Vehicle & Freight',
    fields: [
      'vehicleType',
      'guaranteeWeight',
      'guaranteeWeightUnit',
      'rate',
      'rateType',
      'oversize',
      'oversizeSide',
      'noOfVehicle',
      'loadingCharge',
      'unloadingCharge',
      'serviceCharge',
      'odcCharge',
      'otherCharge',
      'tollTax',
      'gstPercent',
    ],
  },
  {
    key: 'payment',
    label: 'Payment & Demurrage',
    fields: [
      'paidBy',
      'requiredDriverCash',
      'advanceType',
      'advanceAmount',
      'paymentCycle',
      'quotationValidUpto',
      'remarks',
      'demurrageCharge',
      'demurrageChargeType',
      'demurrageChargeApplicableAfter',
    ],
  },
  { key: 'review', label: 'Review & Generate', fields: [] },
] as const

export default function CreateQuotationPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createQuotation = useCreateQuotation()
  const [step, setStep] = React.useState(0)

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateQuotationFormValues>({
    // `any` cast: zod's `coerce.number()` input/output types intentionally
    // diverge, which trips the strict Resolver generic — safe in practice
    // (same convention as CreateBiltyPage).
    resolver: zodResolver(createQuotationSchema) as any,
    defaultValues: {
      quotationDate: todayIso(),
      companyName: '',
      unit: 'MT',
      weight: 0,
      articles: [],
      loadType: 'Full Load',
      fromAddresses: [''],
      toAddresses: [''],
      tripType: 'Oneway',
      vehicleType: '',
      guaranteeWeight: 0,
      guaranteeWeightUnit: 'MT',
      rate: 0,
      rateType: 'Per MT',
      oversize: '0',
      noOfVehicle: 0,
      freightAmount: 0,
      loadingCharge: 0,
      unloadingCharge: 0,
      serviceCharge: 0,
      odcCharge: 0,
      otherCharge: 0,
      tollTax: 0,
      totalFreight: 0,
      gstPercent: '5',
      freightAmountWithGst: 0,
      paidBy: 'Consignor',
      requiredDriverCash: 0,
      advanceType: '10%',
      advanceAmount: 0,
      paymentCycle: '7',
      quotationValidUpto: validUptoIso(),
      demurrageCharge: 0,
      demurrageChargeType: '1',
      hideGeneratedDatetimeFromPdf: false,
      quotationId: 0,
      tag: 'insert',
    },
  })

  const oversize = watch('oversize')
  const companyName = watch('companyName')

  // --- Freight / GST calculation --------------------------------------------------
  // Derived purely from watched inputs via the pure calculation utilities —
  // no DOM access, no jQuery. Results are written back with setValue so the
  // review step and submission payload always carry the latest figures.
  const [guaranteeWeight, guaranteeWeightUnit, rate, rateType, noOfVehicle] = useWatch({
    control,
    name: ['guaranteeWeight', 'guaranteeWeightUnit', 'rate', 'rateType', 'noOfVehicle'],
  })
  const [loadingCharge, unloadingCharge, serviceCharge, odcCharge, otherCharge, tollTax, gstPercent] = useWatch({
    control,
    name: ['loadingCharge', 'unloadingCharge', 'serviceCharge', 'odcCharge', 'otherCharge', 'tollTax', 'gstPercent'],
  })

  const freightAmount = React.useMemo(
    () =>
      calculateFreight({
        guaranteeWeight: Number(guaranteeWeight) || 0,
        guaranteeWeightUnit: (guaranteeWeightUnit as WeightUnit) || 'MT',
        rate: Number(rate) || 0,
        rateType: (rateType as RateType) || 'Per MT',
        numberOfVehicles: Number(noOfVehicle) || 0,
      }),
    [guaranteeWeight, guaranteeWeightUnit, rate, rateType, noOfVehicle],
  )

  const totalFreight = React.useMemo(
    () =>
      calculateTotalFreight({
        freightAmount,
        loadingCharge: Number(loadingCharge) || 0,
        unloadingCharge: Number(unloadingCharge) || 0,
        serviceCharge: Number(serviceCharge) || 0,
        odcCharge: Number(odcCharge) || 0,
        otherCharge: Number(otherCharge) || 0,
        tollTax: Number(tollTax) || 0,
      }),
    [freightAmount, loadingCharge, unloadingCharge, serviceCharge, odcCharge, otherCharge, tollTax],
  )

  const gstAmount = React.useMemo(
    () => calculateGstAmount(totalFreight, Number(gstPercent) || 0),
    [totalFreight, gstPercent],
  )
  const freightAmountWithGst = React.useMemo(
    () => calculateFreightWithGst(totalFreight, gstAmount),
    [totalFreight, gstAmount],
  )

  React.useEffect(() => {
    setValue('freightAmount', freightAmount, { shouldValidate: false })
    setValue('totalFreight', totalFreight, { shouldValidate: false })
    setValue('freightAmountWithGst', freightAmountWithGst, { shouldValidate: false })
  }, [freightAmount, totalFreight, freightAmountWithGst, setValue])

  const reviewValues = useWatch({ control }) as CreateQuotationFormValues

  const goNext = async () => {
    const valid = await trigger(STEPS[step].fields as unknown as (keyof CreateQuotationFormValues)[])
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const onSubmit = async (values: CreateQuotationFormValues) => {
    const payload = mapQuotationFormToPayload(values)
    await createQuotation.mutateAsync(payload)
    toast({
      title: 'Quotation created',
      description: 'The transport quotation has been generated successfully.',
      variant: 'success',
    })
    navigate('/quotation')
  }

  return (
    <div>
      <PageHeader
        title="Create Transport Quotation"
        description="Fill in the details below to generate a new quotation."
      />

      <Card>
        <QuotationStepper steps={STEPS} activeStep={step} onStepClick={setStep} />

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Quotation Information</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Quotation Number" htmlFor="quotationNo" error={errors.quotationNo?.message} required>
                      <Input
                        id="quotationNo"
                        type="number"
                        min={0}
                        placeholder="Enter Quotation Number"
                        {...register('quotationNo')}
                      />
                    </Field>
                    <Field
                      label="Quotation Generate Date"
                      htmlFor="quotationDate"
                      error={errors.quotationDate?.message}
                      required
                    >
                      <Input id="quotationDate" type="date" {...register('quotationDate')} />
                    </Field>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Company Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Company Name" htmlFor="companyName" error={errors.companyName?.message} required>
                      <AutocompleteInput
                        id="companyName"
                        placeholder="Enter Company Name"
                        value={companyName ?? ''}
                        onValueChange={(v) => setValue('companyName', v, { shouldValidate: true, shouldDirty: true })}
                        suggestions={COMPANY_NAME_SUGGESTIONS}
                      />
                    </Field>
                    <Field
                      label="Contact Number"
                      htmlFor="companyContactNo"
                      error={errors.companyContactNo?.message}
                      hint="Maximum 10 digits"
                    >
                      <Input id="companyContactNo" type="tel" maxLength={10} {...register('companyContactNo')} />
                    </Field>
                    <Field
                      label="GST Number"
                      htmlFor="companyGstNo"
                      error={errors.companyGstNo?.message}
                      hint="Maximum 15 characters"
                    >
                      <Input
                        id="companyGstNo"
                        maxLength={15}
                        className="uppercase"
                        {...register('companyGstNo')}
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase()
                          register('companyGstNo').onChange(e)
                        }}
                      />
                    </Field>
                    <Field
                      label="Address"
                      htmlFor="companyAddress"
                      error={errors.companyAddress?.message}
                      className="sm:col-span-2 lg:col-span-3"
                      hint="Maximum 200 characters"
                    >
                      <Textarea id="companyAddress" rows={3} maxLength={200} {...register('companyAddress')} />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Enquiry Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Enquiry Date" htmlFor="enquiryDate" error={errors.enquiryDate?.message}>
                      <Input id="enquiryDate" type="date" {...register('enquiryDate')} />
                    </Field>
                    <Field
                      label="Reference Document ID"
                      htmlFor="referenceDocumentId"
                      error={errors.referenceDocumentId?.message}
                    >
                      <Input id="referenceDocumentId" {...register('referenceDocumentId')} />
                    </Field>
                    <Field label="Enquiry By Person" htmlFor="enquiryByPerson" error={errors.enquiryByPerson?.message}>
                      <Input id="enquiryByPerson" {...register('enquiryByPerson')} />
                    </Field>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Material Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Material Name" htmlFor="materialName" error={errors.materialName?.message}>
                      <Input id="materialName" {...register('materialName')} />
                    </Field>
                    <Field label="Packaging Type" htmlFor="packagingType" error={errors.packagingType?.message}>
                      <Input id="packagingType" {...register('packagingType')} />
                    </Field>
                    <Field label="Weight" htmlFor="weight" error={errors.weight?.message}>
                      <Input id="weight" type="number" min={0} step="0.01" {...register('weight')} />
                    </Field>
                    <Field label="Weight Unit" htmlFor="unit" error={errors.unit?.message}>
                      <Select id="unit" options={WEIGHT_UNITS} {...register('unit')} />
                    </Field>
                  </div>
                </div>

                <QuotationArticleFields control={control} register={register} errors={errors} />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Load Type</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Load Type" htmlFor="loadType" error={errors.loadType?.message} required>
                      <Select
                        id="loadType"
                        placeholder="Select load type"
                        options={LOAD_TYPES}
                        {...register('loadType')}
                      />
                    </Field>
                  </div>
                </div>

                <QuotationLocationFields
                  control={control}
                  setValue={setValue}
                  errors={errors}
                  name="fromAddresses"
                  label="Pickup Locations"
                  addLabel="Add From Address"
                  max={MAX_FROM_ADDRESSES}
                />

                <QuotationLocationFields
                  control={control}
                  setValue={setValue}
                  errors={errors}
                  name="toAddresses"
                  label="Delivery Locations"
                  addLabel="Add To Address"
                  max={MAX_TO_ADDRESSES}
                />

                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Trip Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Loading Date" htmlFor="loadingDate" error={errors.loadingDate?.message}>
                      <Input id="loadingDate" type="date" {...register('loadingDate')} />
                    </Field>
                    <Field label="Trip Type" htmlFor="tripType" error={errors.tripType?.message} required>
                      <Select id="tripType" options={TRIP_TYPES} {...register('tripType')} />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Vehicle Details</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Vehicle Type" htmlFor="vehicleType" error={errors.vehicleType?.message} required>
                      <Select
                        id="vehicleType"
                        placeholder="Select vehicle type"
                        options={VEHICLE_TYPES}
                        {...register('vehicleType')}
                      />
                    </Field>
                    <Field label="Guarantee Weight" htmlFor="guaranteeWeight" error={errors.guaranteeWeight?.message}>
                      <Input id="guaranteeWeight" type="number" min={0} step="0.01" {...register('guaranteeWeight')} />
                    </Field>
                    <Field
                      label="Guarantee Weight Unit"
                      htmlFor="guaranteeWeightUnit"
                      error={errors.guaranteeWeightUnit?.message}
                    >
                      <Select
                        id="guaranteeWeightUnit"
                        options={GUARANTEE_WEIGHT_UNITS}
                        {...register('guaranteeWeightUnit')}
                      />
                    </Field>
                    <Field label="No. of Vehicles" htmlFor="noOfVehicle" error={errors.noOfVehicle?.message}>
                      <Input id="noOfVehicle" type="number" min={0} {...register('noOfVehicle')} />
                    </Field>
                    <Field label="Rate" htmlFor="rate" error={errors.rate?.message}>
                      <Input id="rate" type="number" min={0} step="0.01" {...register('rate')} />
                    </Field>
                    <Field label="Rate Type" htmlFor="rateType" error={errors.rateType?.message}>
                      <Select id="rateType" options={RATE_TYPES} {...register('rateType')} />
                    </Field>
                    <Field label="Oversize" htmlFor="oversize" error={errors.oversize?.message}>
                      <Select id="oversize" options={OVERSIZE_OPTIONS} {...register('oversize')} />
                    </Field>
                    {oversize === '1' && (
                      <Field label="Oversize Side" htmlFor="oversizeSide" error={errors.oversizeSide?.message} required>
                        <Select
                          id="oversizeSide"
                          placeholder="Select oversize side"
                          options={OVERSIZE_SIDE_OPTIONS}
                          {...register('oversizeSide')}
                        />
                      </Field>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Freight Charges</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex flex-col justify-end rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] px-3 py-2">
                      <span className="text-xs text-[var(--color-muted-foreground)]">Freight Amount (calculated)</span>
                      <span className="text-lg font-semibold text-[var(--color-foreground)]">
                        {formatCurrency(freightAmount)}
                      </span>
                    </div>
                    <Field label="Loading Charge" htmlFor="loadingCharge" error={errors.loadingCharge?.message}>
                      <Input id="loadingCharge" type="number" min={0} {...register('loadingCharge')} />
                    </Field>
                    <Field label="Unloading Charge" htmlFor="unloadingCharge" error={errors.unloadingCharge?.message}>
                      <Input id="unloadingCharge" type="number" min={0} {...register('unloadingCharge')} />
                    </Field>
                    <Field label="Service Charge" htmlFor="serviceCharge" error={errors.serviceCharge?.message}>
                      <Input id="serviceCharge" type="number" min={0} {...register('serviceCharge')} />
                    </Field>
                    <Field label="ODC Charge" htmlFor="odcCharge" error={errors.odcCharge?.message}>
                      <Input id="odcCharge" type="number" min={0} {...register('odcCharge')} />
                    </Field>
                    <Field label="Other Charge" htmlFor="otherCharge" error={errors.otherCharge?.message}>
                      <Input id="otherCharge" type="number" min={0} {...register('otherCharge')} />
                    </Field>
                    <Field label="Toll Tax" htmlFor="tollTax" error={errors.tollTax?.message}>
                      <Input id="tollTax" type="number" min={0} {...register('tollTax')} />
                    </Field>
                    <Field label="Applicable GST %" htmlFor="gstPercent" error={errors.gstPercent?.message} required>
                      <Select
                        id="gstPercent"
                        placeholder="Select GST %"
                        options={GST_PERCENT_OPTIONS}
                        {...register('gstPercent')}
                      />
                    </Field>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col justify-end rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2">
                      <span className="text-xs text-[var(--color-muted-foreground)]">Total Freight</span>
                      <span className="text-lg font-semibold text-[var(--color-foreground)]">
                        {formatCurrency(totalFreight)}
                      </span>
                    </div>
                    <div className="flex flex-col justify-end rounded-[var(--radius-md)] border border-[var(--color-primary)] bg-[var(--color-surface-muted)] px-3 py-2">
                      <span className="text-xs text-[var(--color-muted-foreground)]">Freight Amount with GST</span>
                      <span className="text-lg font-semibold text-[var(--color-primary)]">
                        {formatCurrency(freightAmountWithGst)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Payment Terms</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Paid By" htmlFor="paidBy" error={errors.paidBy?.message} required>
                      <Select
                        id="paidBy"
                        placeholder="Select payer"
                        options={PAID_BY_OPTIONS}
                        {...register('paidBy')}
                      />
                    </Field>
                    <Field
                      label="Required Driver Cash"
                      htmlFor="requiredDriverCash"
                      error={errors.requiredDriverCash?.message}
                    >
                      <Input id="requiredDriverCash" type="number" min={0} {...register('requiredDriverCash')} />
                    </Field>
                    <Field label="Advance Type" htmlFor="advanceType" error={errors.advanceType?.message}>
                      <Select id="advanceType" options={ADVANCE_TYPE_OPTIONS} {...register('advanceType')} />
                    </Field>
                    <Field label="Advance Amount" htmlFor="advanceAmount" error={errors.advanceAmount?.message}>
                      <Input id="advanceAmount" type="number" min={0} {...register('advanceAmount')} />
                    </Field>
                    <Field label="Payment Cycle" htmlFor="paymentCycle" error={errors.paymentCycle?.message}>
                      <Select id="paymentCycle" options={PAYMENT_CYCLE_OPTIONS} {...register('paymentCycle')} />
                    </Field>
                    <Field
                      label="Quotation Valid Upto"
                      htmlFor="quotationValidUpto"
                      error={errors.quotationValidUpto?.message}
                      required
                    >
                      <Input id="quotationValidUpto" type="date" {...register('quotationValidUpto')} />
                    </Field>
                  </div>
                  <Field
                    label="Remarks"
                    htmlFor="remarks"
                    error={errors.remarks?.message}
                    className="mt-4"
                    hint="Optional — special instructions or notes."
                  >
                    <Textarea id="remarks" rows={3} {...register('remarks')} />
                  </Field>
                </div>

                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Demurrage Charges</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Demurrage Charge" htmlFor="demurrageCharge" error={errors.demurrageCharge?.message}>
                      <Input id="demurrageCharge" type="number" min={0} {...register('demurrageCharge')} />
                    </Field>
                    <Field
                      label="Demurrage Charge Type"
                      htmlFor="demurrageChargeType"
                      error={errors.demurrageChargeType?.message}
                    >
                      <Select
                        id="demurrageChargeType"
                        options={DEMURRAGE_CHARGE_TYPE_OPTIONS}
                        {...register('demurrageChargeType')}
                      />
                    </Field>
                    <Field
                      label="Demurrage Applicable After"
                      htmlFor="demurrageChargeApplicableAfter"
                      error={errors.demurrageChargeApplicableAfter?.message}
                    >
                      <Select
                        id="demurrageChargeApplicableAfter"
                        placeholder="Select duration"
                        options={DEMURRAGE_APPLICABLE_AFTER_OPTIONS}
                        {...register('demurrageChargeApplicableAfter')}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <label className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                  <input
                    type="checkbox"
                    id="hideGeneratedDatetimeFromPdf"
                    className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                    {...register('hideGeneratedDatetimeFromPdf')}
                  />
                  Hide Generated Datetime From PDF
                </label>

                <QuotationReview values={reviewValues} />
              </div>
            )}

            <div className="mt-6 flex justify-between border-t border-[var(--color-border)] pt-4">
              <Button type="button" variant="outline" onClick={() => (step === 0 ? navigate('/quotation') : goBack())}>
                {step === 0 ? 'Cancel' : 'Back'}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={goNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" loading={createQuotation.isPending}>
                  Generate Quotation
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
