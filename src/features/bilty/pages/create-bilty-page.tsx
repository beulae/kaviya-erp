import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { createBiltySchema, type CreateBiltyFormValues } from '../schemas/bilty-schema'
import { useCreateBilty } from '../api/use-bilty'
import { useToast } from '@/components/ui/toaster'

const BRANCHES = ['Chennai', 'Bengaluru', 'Coimbatore', 'Hyderabad', 'Madurai'].map((c) => ({ label: c, value: c }))
const TRANSPORT_TYPES = ['Full Load', 'Part Load', 'Express'].map((v) => ({ label: v, value: v }))
const PAYMENT_TYPES = ['To Pay', 'Paid', 'To Be Billed'].map((v) => ({ label: v, value: v }))

const STEPS = [
  {
    key: 'basic',
    label: 'Basic Details',
    fields: ['biltyDate', 'bookingBranch', 'deliveryBranch', 'transportType', 'paymentType'],
  },
  {
    key: 'parties',
    label: 'Consignor & Consignee',
    fields: ['consignorName', 'consignorAddress', 'consigneeName', 'consigneeAddress', 'fromCity', 'toCity'],
  },
  {
    key: 'goods',
    label: 'Goods & Charges',
    fields: ['vehicleNumber', 'driverName', 'driverMobile', 'goodsDescription', 'weightKg', 'freightAmount'],
  },
  { key: 'additional', label: 'Additional Info', fields: ['remarks'] },
] as const

export default function CreateBiltyPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createBilty = useCreateBilty()
  const [step, setStep] = React.useState(0)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<CreateBiltyFormValues>({
    // `any` cast: zod's `coerce.number()` input/output types intentionally
    // diverge, which trips the strict Resolver generic — safe in practice.
    resolver: zodResolver(createBiltySchema) as any,
    defaultValues: {
      biltyDate: new Date().toISOString().slice(0, 10),
      transportType: 'Full Load',
      paymentType: 'To Pay',
    },
  })

  const goNext = async () => {
    const valid = await trigger(STEPS[step].fields as unknown as (keyof CreateBiltyFormValues)[])
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const onSubmit = async (values: CreateBiltyFormValues) => {
    await createBilty.mutateAsync({
      consignorName: values.consignorName,
      consigneeName: values.consigneeName,
      fromCity: values.fromCity,
      toCity: values.toCity,
      vehicleNumber: values.vehicleNumber,
      driverName: values.driverName,
      goodsDescription: values.goodsDescription,
      weightKg: values.weightKg,
      freightAmount: values.freightAmount,
    })
    toast({ title: 'Bilty created', description: 'The new bilty has been saved.', variant: 'success' })
    navigate('/bilty')
  }

  return (
    <div>
      <PageHeader title="Create Bilty" description="Fill in the details below to generate a new bilty." />

      <Card>
        <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)] p-2 sm:p-3">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                'flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors',
                i === step
                  ? 'bg-[var(--color-primary)] text-white'
                  : i < step
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-muted-foreground)]',
              )}
            >
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-xs',
                  i === step
                    ? 'bg-white/20'
                    : i < step
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-[var(--color-surface-muted)]',
                )}
              >
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {step === 0 && (
              <div>
                <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Basic Information</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Bilty Date" htmlFor="biltyDate" error={errors.biltyDate?.message} required>
                    <Input id="biltyDate" type="date" {...register('biltyDate')} />
                  </Field>
                  <Field label="Booking Branch" htmlFor="bookingBranch" error={errors.bookingBranch?.message} required>
                    <Select
                      id="bookingBranch"
                      placeholder="Select branch"
                      options={BRANCHES}
                      {...register('bookingBranch')}
                    />
                  </Field>
                  <Field
                    label="Delivery Branch"
                    htmlFor="deliveryBranch"
                    error={errors.deliveryBranch?.message}
                    required
                  >
                    <Select
                      id="deliveryBranch"
                      placeholder="Select branch"
                      options={BRANCHES}
                      {...register('deliveryBranch')}
                    />
                  </Field>
                  <Field label="Transport Type" htmlFor="transportType" error={errors.transportType?.message} required>
                    <Select id="transportType" options={TRANSPORT_TYPES} {...register('transportType')} />
                  </Field>
                  <Field label="Payment Type" htmlFor="paymentType" error={errors.paymentType?.message} required>
                    <Select id="paymentType" options={PAYMENT_TYPES} {...register('paymentType')} />
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Consignor</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Consignor Name"
                      htmlFor="consignorName"
                      error={errors.consignorName?.message}
                      required
                    >
                      <Input id="consignorName" {...register('consignorName')} />
                    </Field>
                    <Field label="Origin City" htmlFor="fromCity" error={errors.fromCity?.message} required>
                      <Select id="fromCity" placeholder="Select city" options={BRANCHES} {...register('fromCity')} />
                    </Field>
                    <Field
                      label="Consignor Address"
                      htmlFor="consignorAddress"
                      error={errors.consignorAddress?.message}
                      required
                      className="sm:col-span-2"
                    >
                      <Textarea id="consignorAddress" rows={2} {...register('consignorAddress')} />
                    </Field>
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Consignee</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field
                      label="Consignee Name"
                      htmlFor="consigneeName"
                      error={errors.consigneeName?.message}
                      required
                    >
                      <Input id="consigneeName" {...register('consigneeName')} />
                    </Field>
                    <Field label="Destination City" htmlFor="toCity" error={errors.toCity?.message} required>
                      <Select id="toCity" placeholder="Select city" options={BRANCHES} {...register('toCity')} />
                    </Field>
                    <Field
                      label="Consignee Address"
                      htmlFor="consigneeAddress"
                      error={errors.consigneeAddress?.message}
                      required
                      className="sm:col-span-2"
                    >
                      <Textarea id="consigneeAddress" rows={2} {...register('consigneeAddress')} />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Vehicle & Driver</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Vehicle No." htmlFor="vehicleNumber" error={errors.vehicleNumber?.message} required>
                      <Input id="vehicleNumber" placeholder="TN 01 AB 1234" {...register('vehicleNumber')} />
                    </Field>
                    <Field label="Driver Name" htmlFor="driverName" error={errors.driverName?.message} required>
                      <Input id="driverName" {...register('driverName')} />
                    </Field>
                    <Field label="Driver Mobile" htmlFor="driverMobile" error={errors.driverMobile?.message} required>
                      <Input id="driverMobile" placeholder="98765 43210" {...register('driverMobile')} />
                    </Field>
                  </div>
                </div>
                <div>
                  <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Goods & Charges</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field
                      label="Goods Description"
                      htmlFor="goodsDescription"
                      error={errors.goodsDescription?.message}
                      required
                      className="sm:col-span-3"
                    >
                      <Input id="goodsDescription" {...register('goodsDescription')} />
                    </Field>
                    <Field label="Weight (Kg)" htmlFor="weightKg" error={errors.weightKg?.message} required>
                      <Input id="weightKg" type="number" step="0.01" {...register('weightKg')} />
                    </Field>
                    <Field
                      label="Freight Amount (₹)"
                      htmlFor="freightAmount"
                      error={errors.freightAmount?.message}
                      required
                    >
                      <Input id="freightAmount" type="number" step="0.01" {...register('freightAmount')} />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h3 className="mb-4 text-sm font-semibold text-[var(--color-foreground)]">Remarks & Attachments</h3>
                <Field
                  label="Special Instructions"
                  htmlFor="remarks"
                  hint="Optional — pickup/delivery notes, handling instructions, etc."
                >
                  <Textarea
                    id="remarks"
                    rows={4}
                    placeholder="Enter special instructions (optional)"
                    {...register('remarks')}
                  />
                </Field>
              </div>
            )}

            <div className="mt-6 flex justify-between border-t border-[var(--color-border)] pt-4">
              <Button type="button" variant="outline" onClick={() => (step === 0 ? navigate('/bilty') : goBack())}>
                {step === 0 ? 'Cancel' : 'Back'}
              </Button>
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={goNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" loading={createBilty.isPending}>
                  Save Bilty
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
