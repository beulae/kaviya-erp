import * as React from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { List } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { getApiErrorMessage } from '@/api/axios-instance'

import { loadingSlipSchema, SPECIAL_CHAR_HINT, type LoadingSlipFormValues } from '../schemas/loading-slip-schema'
import { useCreateLoadingSlip, useLoadingSlip, useUpdateLoadingSlip } from '../api/use-loading-slip'
import { mapLoadingSlipFormToPayload, mapLoadingSlipToFormValues } from '../api/loading-slip-mapper'
import { calculateLoadingSlipTotals } from '../utils/loading-slip-calculations'
import { VEHICLE_TYPES, WEIGHT_UNITS, getCurrentFinancialYear, getFinancialYearOptions } from '../constants/options'

const todayIso = () => new Date().toISOString().slice(0, 10)
const toUpper = (v: unknown) => (typeof v === 'string' ? v.toUpperCase() : v)
const FINANCIAL_YEARS = getFinancialYearOptions()

const DEFAULT_VALUES: LoadingSlipFormValues = {
  loadingSlipNo: '',
  billGenerateDate: todayIso(),
  branchCode: '',
  financialYear: getCurrentFinancialYear(),
  partyName: '',
  partyContactNo: '',
  partyGstin: '',
  partyEmail: '',
  bankName: '',
  partyAddress: '',
  vehicleState: '',
  vehicleDistrict: '',
  vehicleSeries: '',
  vehicleDigits: '',
  vehicleType: '',
  vehicleSize: '',
  openingKm: 0,
  closingKm: 0,
  driverName: '',
  driverNumber: '',
  dlNumber: '',
  vehicleOwnerName: '',
  vehicleOwnerMobile: '',
  vehicleOwnerPan: '',
  vehicleOwnerAddress: '',
  fromLocation: '',
  toLocation: '',
  materialDetails: '',
  actualWeight: 0,
  guaranteeWeight: 0,
  unit: 'MT',
  rate: 0,
  isRateFixed: false,
  haltingCharge: 0,
  otherCharges: 0,
  advanceAmount: 0,
  truckHireRate: 0,
  isTruckHireRateFixed: false,
  commissionAmount: 0,
  remarks: '',
  hideSupplierDetailsFromPdf: false,
  hideGeneratedDatetimeFromPdf: false,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] px-4 py-2 text-sm font-semibold text-[var(--color-foreground)]">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 lg:grid-cols-12">{children}</div>
    </section>
  )
}

function ReadOnlyAmount({ id, value }: { id: string; value: number }) {
  return <Input id={id} readOnly tabIndex={-1} value={value} className="bg-[var(--color-surface-muted)]" />
}

function CheckboxField({ id, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
      <input
        type="checkbox"
        id={id}
        className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
        {...props}
      />
      {label}
    </label>
  )
}

export default function CreateLoadingSlipPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { toast } = useToast()
  const createLoadingSlip = useCreateLoadingSlip()
  const updateLoadingSlip = useUpdateLoadingSlip()
  const { data: existingSlip } = useLoadingSlip(id ?? '')

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoadingSlipFormValues>({
    // `any` cast: zod's `coerce.number()` input/output types intentionally
    // diverge, which trips the strict Resolver generic — safe in practice
    // (same convention as CreateBiltyPage).
    resolver: zodResolver(loadingSlipSchema) as any,
    defaultValues: DEFAULT_VALUES,
  })

  React.useEffect(() => {
    if (isEdit && existingSlip) {
      reset({ ...DEFAULT_VALUES, ...mapLoadingSlipToFormValues(existingSlip) })
    } else if (!isEdit) {
      reset(DEFAULT_VALUES)
    }
  }, [isEdit, existingSlip, reset])

  const [
    actualWeight,
    guaranteeWeight,
    rate,
    isRateFixed,
    haltingCharge,
    otherCharges,
    advanceAmount,
    truckHireRate,
    isTruckHireRateFixed,
  ] = useWatch({
    control,
    name: [
      'actualWeight',
      'guaranteeWeight',
      'rate',
      'isRateFixed',
      'haltingCharge',
      'otherCharges',
      'advanceAmount',
      'truckHireRate',
      'isTruckHireRateFixed',
    ],
  })

  const totals = calculateLoadingSlipTotals({
    actualWeight,
    guaranteeWeight,
    rate,
    isRateFixed,
    haltingCharge,
    otherCharges,
    advanceAmount,
    truckHireRate,
    isTruckHireRateFixed,
  })

  const isSaving = createLoadingSlip.isPending || updateLoadingSlip.isPending
  const vehicleNumberError =
    errors.vehicleState?.message ||
    errors.vehicleDistrict?.message ||
    errors.vehicleSeries?.message ||
    errors.vehicleDigits?.message

  const onSubmit = async (values: LoadingSlipFormValues) => {
    const payload = mapLoadingSlipFormToPayload(values)
    try {
      if (isEdit) {
        await updateLoadingSlip.mutateAsync({ id, payload })
        toast({ title: 'Loading slip updated', variant: 'success' })
      } else {
        await createLoadingSlip.mutateAsync(payload)
        toast({ title: 'Loading slip created', description: 'The loading slip has been saved.', variant: 'success' })
      }
      navigate('/loading-slip')
    } catch (error) {
      toast({ title: 'Save failed', description: getApiErrorMessage(error), variant: 'error' })
    }
  }

  return (
    <div>
      <PageHeader
        title="Loading Slip Form"
        actions={
          <Button type="button" size="sm" onClick={() => navigate('/loading-slip')}>
            <List className="h-4 w-4" /> Loading Slip List
          </Button>
        }
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Loading Slip No" htmlFor="loadingSlipNo" error={errors.loadingSlipNo?.message} required>
                <Input id="loadingSlipNo" placeholder="Loading Slip No" {...register('loadingSlipNo')} />
              </Field>
              <Field
                label="Bill Generate Date"
                htmlFor="billGenerateDate"
                error={errors.billGenerateDate?.message}
                required
              >
                <Input id="billGenerateDate" type="date" {...register('billGenerateDate')} />
              </Field>
              <Field label="Branch Code" htmlFor="branchCode" error={errors.branchCode?.message}>
                <Input id="branchCode" placeholder="Branch Code" {...register('branchCode')} />
              </Field>
              <Field label="Financial Year" htmlFor="financialYear" error={errors.financialYear?.message}>
                <Select
                  id="financialYear"
                  placeholder="Select Financial Year"
                  options={FINANCIAL_YEARS}
                  {...register('financialYear')}
                />
              </Field>
            </div>

            <Section title="Party Details">
              <Field label="Party Name" htmlFor="partyName" className="sm:col-span-6" error={errors.partyName?.message}>
                <Input id="partyName" placeholder="Party Name" {...register('partyName')} />
              </Field>
              <Field
                label="Contact Number"
                htmlFor="partyContactNo"
                className="sm:col-span-3"
                error={errors.partyContactNo?.message}
              >
                <Input
                  id="partyContactNo"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Contact Number"
                  {...register('partyContactNo')}
                />
              </Field>
              <Field label="GSTIN" htmlFor="partyGstin" className="sm:col-span-3" error={errors.partyGstin?.message}>
                <Input
                  id="partyGstin"
                  maxLength={15}
                  placeholder="GSTIN"
                  className="uppercase"
                  {...register('partyGstin', { setValueAs: toUpper })}
                />
              </Field>
              <Field label="Email" htmlFor="partyEmail" className="sm:col-span-6" error={errors.partyEmail?.message}>
                <Input id="partyEmail" type="email" placeholder="Email" {...register('partyEmail')} />
              </Field>
              <Field label="Bank Name" htmlFor="bankName" className="sm:col-span-6" error={errors.bankName?.message}>
                <Input id="bankName" placeholder="Bank Name" {...register('bankName')} />
              </Field>
              <Field
                label="Address"
                htmlFor="partyAddress"
                className="sm:col-span-6"
                error={errors.partyAddress?.message}
                hint={SPECIAL_CHAR_HINT}
              >
                <Textarea id="partyAddress" rows={2} placeholder="Address" {...register('partyAddress')} />
              </Field>
            </Section>

            <Section title="Truck Details">
              <Field
                label="Vehicle Number"
                htmlFor="vehicleState"
                className="sm:col-span-6 lg:col-span-9"
                error={vehicleNumberError}
                required
              >
                <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:grid-cols-12">
                  <Input
                    id="vehicleState"
                    aria-label="State code"
                    placeholder="TN"
                    maxLength={2}
                    className="uppercase lg:col-span-2"
                    error={!!errors.vehicleState}
                    {...register('vehicleState', { setValueAs: toUpper })}
                  />
                  <Input
                    aria-label="District code"
                    placeholder="12"
                    inputMode="numeric"
                    maxLength={2}
                    className="lg:col-span-2"
                    error={!!errors.vehicleDistrict}
                    {...register('vehicleDistrict')}
                  />
                  <Input
                    aria-label="Series"
                    placeholder="BM"
                    maxLength={3}
                    className="uppercase lg:col-span-2"
                    error={!!errors.vehicleSeries}
                    {...register('vehicleSeries', { setValueAs: toUpper })}
                  />
                  <Input
                    aria-label="Number"
                    placeholder="1848"
                    inputMode="numeric"
                    maxLength={4}
                    className="lg:col-span-6"
                    error={!!errors.vehicleDigits}
                    {...register('vehicleDigits')}
                  />
                </div>
              </Field>
              <Field
                label="Vehicle Type"
                htmlFor="vehicleType"
                className="sm:col-span-6 lg:col-span-3"
                error={errors.vehicleType?.message}
                required
              >
                <Select
                  id="vehicleType"
                  placeholder="Select Vehicle Type"
                  options={VEHICLE_TYPES}
                  {...register('vehicleType')}
                />
              </Field>
              <Field
                label="Vehicle Size"
                htmlFor="vehicleSize"
                className="sm:col-span-6"
                error={errors.vehicleSize?.message}
              >
                <Input id="vehicleSize" placeholder="e.g. 10 feet" {...register('vehicleSize')} />
              </Field>
              <Field label="Opening KM" htmlFor="openingKm" className="sm:col-span-3" error={errors.openingKm?.message}>
                <Input id="openingKm" type="number" min={0} step="0.01" {...register('openingKm')} />
              </Field>
              <Field label="Closing KM" htmlFor="closingKm" className="sm:col-span-3" error={errors.closingKm?.message}>
                <Input id="closingKm" type="number" min={0} step="0.01" {...register('closingKm')} />
              </Field>
              <Field
                label="Driver Name"
                htmlFor="driverName"
                className="sm:col-span-6"
                error={errors.driverName?.message}
              >
                <Input id="driverName" placeholder="Driver Name" {...register('driverName')} />
              </Field>
              <Field
                label="Driver Number"
                htmlFor="driverNumber"
                className="sm:col-span-3"
                error={errors.driverNumber?.message}
              >
                <Input
                  id="driverNumber"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Driver Number"
                  {...register('driverNumber')}
                />
              </Field>
              <Field label="DL Number" htmlFor="dlNumber" className="sm:col-span-3" error={errors.dlNumber?.message}>
                <Input
                  id="dlNumber"
                  placeholder="DL Number"
                  className="uppercase"
                  {...register('dlNumber', { setValueAs: toUpper })}
                />
              </Field>
              <Field
                label="Vehicle Owner / Supplier Name"
                htmlFor="vehicleOwnerName"
                className="sm:col-span-6"
                error={errors.vehicleOwnerName?.message}
              >
                <Input
                  id="vehicleOwnerName"
                  placeholder="Vehicle Owner / Supplier Name"
                  {...register('vehicleOwnerName')}
                />
              </Field>
              <Field
                label="Vehicle Owner Mobile"
                htmlFor="vehicleOwnerMobile"
                className="sm:col-span-3"
                error={errors.vehicleOwnerMobile?.message}
              >
                <Input
                  id="vehicleOwnerMobile"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Vehicle Owner Mobile"
                  {...register('vehicleOwnerMobile')}
                />
              </Field>
              <Field
                label="Vehicle Owner PAN No."
                htmlFor="vehicleOwnerPan"
                className="sm:col-span-3"
                error={errors.vehicleOwnerPan?.message}
              >
                <Input
                  id="vehicleOwnerPan"
                  maxLength={10}
                  placeholder="PAN No."
                  className="uppercase"
                  {...register('vehicleOwnerPan', { setValueAs: toUpper })}
                />
              </Field>
              <Field
                label="Vehicle Owner Address"
                htmlFor="vehicleOwnerAddress"
                className="sm:col-span-6"
                error={errors.vehicleOwnerAddress?.message}
                hint={SPECIAL_CHAR_HINT}
              >
                <Textarea
                  id="vehicleOwnerAddress"
                  rows={2}
                  placeholder="Vehicle Owner Address"
                  {...register('vehicleOwnerAddress')}
                />
              </Field>
            </Section>

            <Section title="Material Details">
              <Field label="From" htmlFor="fromLocation" className="sm:col-span-6" error={errors.fromLocation?.message}>
                <Input id="fromLocation" placeholder="From" {...register('fromLocation')} />
              </Field>
              <Field label="To" htmlFor="toLocation" className="sm:col-span-6" error={errors.toLocation?.message}>
                <Input id="toLocation" placeholder="To" {...register('toLocation')} />
              </Field>
              <Field
                label="Load/Material Details"
                htmlFor="materialDetails"
                className="sm:col-span-6 lg:col-span-12"
                error={errors.materialDetails?.message}
                hint={SPECIAL_CHAR_HINT}
              >
                <Textarea
                  id="materialDetails"
                  rows={2}
                  placeholder="Load/Material Details"
                  {...register('materialDetails')}
                />
              </Field>
            </Section>

            <Section title="Freight Details">
              <Field
                label="Actual Weight"
                htmlFor="actualWeight"
                className="sm:col-span-2"
                error={errors.actualWeight?.message}
              >
                <Input id="actualWeight" type="number" min={0} step="0.01" {...register('actualWeight')} />
              </Field>
              <Field
                label="Guarantee Weight"
                htmlFor="guaranteeWeight"
                className="sm:col-span-2"
                error={errors.guaranteeWeight?.message}
              >
                <Input id="guaranteeWeight" type="number" min={0} step="0.01" {...register('guaranteeWeight')} />
              </Field>
              <Field label="Unit" htmlFor="unit" className="sm:col-span-2" error={errors.unit?.message}>
                <Select id="unit" options={WEIGHT_UNITS} {...register('unit')} />
              </Field>
              <Field label="Rate" htmlFor="rate" className="sm:col-span-2" error={errors.rate?.message}>
                <Input id="rate" type="number" min={0} step="0.01" {...register('rate')} />
              </Field>
              <div className="flex items-end pb-2.5 sm:col-span-2">
                <CheckboxField id="isRateFixed" label="FIXED" {...register('isRateFixed')} />
              </div>
              <Field label="Freight Amount" htmlFor="freightAmount" className="sm:col-span-2">
                <ReadOnlyAmount id="freightAmount" value={totals.freightAmount} />
              </Field>

              <Field
                label="Halting Charge"
                htmlFor="haltingCharge"
                className="sm:col-span-2"
                error={errors.haltingCharge?.message}
              >
                <Input id="haltingCharge" type="number" min={0} step="0.01" {...register('haltingCharge')} />
              </Field>
              <Field
                label="Other Charges"
                htmlFor="otherCharges"
                className="sm:col-span-2"
                error={errors.otherCharges?.message}
              >
                <Input id="otherCharges" type="number" min={0} step="0.01" {...register('otherCharges')} />
              </Field>
              <Field label="Total Amount" htmlFor="totalAmount" className="sm:col-span-2 lg:col-span-3">
                <ReadOnlyAmount id="totalAmount" value={totals.totalAmount} />
              </Field>
              <Field
                label="Advance (Rs)"
                htmlFor="advanceAmount"
                className="sm:col-span-3 lg:col-span-2"
                error={errors.advanceAmount?.message}
              >
                <Input
                  id="advanceAmount"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="Advance Amount"
                  {...register('advanceAmount')}
                />
              </Field>
              <Field label="Balance (Rs)" htmlFor="balanceAmount" className="sm:col-span-3">
                <ReadOnlyAmount id="balanceAmount" value={totals.balanceAmount} />
              </Field>
            </Section>

            <Section title="Truck Hiring Details">
              <Field
                label="Truck Hire Rate"
                htmlFor="truckHireRate"
                className="sm:col-span-3"
                error={errors.truckHireRate?.message}
              >
                <Input id="truckHireRate" type="number" min={0} step="0.01" {...register('truckHireRate')} />
              </Field>
              <div className="flex items-end pb-2.5 sm:col-span-3">
                <CheckboxField
                  id="isTruckHireRateFixed"
                  label="Truck Hire Rate FIXED"
                  {...register('isTruckHireRateFixed')}
                />
              </div>
              <Field label="Truck Hire Cost" htmlFor="truckHireCost" className="sm:col-span-3">
                <ReadOnlyAmount id="truckHireCost" value={totals.truckHireCost} />
              </Field>
              <Field
                label="Commission Amount"
                htmlFor="commissionAmount"
                className="sm:col-span-3"
                error={errors.commissionAmount?.message}
              >
                <Input id="commissionAmount" type="number" min={0} step="0.01" {...register('commissionAmount')} />
              </Field>
            </Section>

            <Section title="Other Remarks">
              <Field
                label="Remarks"
                htmlFor="remarks"
                className="sm:col-span-6 lg:col-span-12"
                error={errors.remarks?.message}
                hint={SPECIAL_CHAR_HINT}
              >
                <Textarea id="remarks" rows={2} placeholder="Remarks" {...register('remarks')} />
              </Field>
              <div className="flex flex-col gap-3 sm:col-span-6 sm:flex-row sm:gap-12 lg:col-span-12">
                <CheckboxField
                  id="hideSupplierDetailsFromPdf"
                  label="Hide Supplier/Owner Details from PDF"
                  {...register('hideSupplierDetailsFromPdf')}
                />
                <CheckboxField
                  id="hideGeneratedDatetimeFromPdf"
                  label="Hide Generated Datetime from PDF"
                  {...register('hideGeneratedDatetimeFromPdf')}
                />
              </div>
            </Section>

            <div className="flex justify-center gap-3 border-t border-[var(--color-border)] pt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/loading-slip')}>
                Cancel
              </Button>
              <Button type="submit" className="min-w-48" loading={isSaving}>
                {isEdit ? 'Update Loading Slip' : 'Save Loading Slip'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
