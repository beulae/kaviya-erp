import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createQuotationSchema, type CreateQuotationFormValues } from '../schemas/quotation-schema'
import { useCreateQuotation } from '../api/use-quotation'
import { useToast } from '@/components/ui/toaster'
import { formatCurrency } from '@/utils/format'

const VEHICLE_TYPES = ['Open Body 14ft', 'Container 20ft', 'Container 32ft', 'Mini Truck', 'Trailer 40ft'].map((v) => ({
  label: v,
  value: v,
}))

export default function CreateQuotationPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createQuotation = useCreateQuotation()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateQuotationFormValues>({
    // `any` cast: zod's `coerce.number()` input/output types intentionally
    // diverge, which trips the strict Resolver generic — safe in practice.
    resolver: zodResolver(createQuotationSchema) as any,
    defaultValues: {
      gstPercent: 5,
      discount: 0,
      validity: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
    },
  })

  const rate = Number(watch('rate')) || 0
  const gstPercent = Number(watch('gstPercent')) || 0
  const discount = Number(watch('discount')) || 0
  const total = Math.max(0, Math.round(rate * (1 + gstPercent / 100) - discount))

  const onSubmit = async (values: CreateQuotationFormValues) => {
    await createQuotation.mutateAsync(values)
    toast({ title: 'Quotation created', variant: 'success' })
    navigate('/quotation')
  }

  return (
    <div>
      <PageHeader
        title="Create Quotation"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/quotation')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Customer" htmlFor="customerName" error={errors.customerName?.message} required>
                <Input id="customerName" {...register('customerName')} />
              </Field>
              <Field label="Vehicle Type" htmlFor="vehicleType" error={errors.vehicleType?.message} required>
                <Select
                  id="vehicleType"
                  placeholder="Select vehicle type"
                  options={VEHICLE_TYPES}
                  {...register('vehicleType')}
                />
              </Field>
              <Field label="Pickup" htmlFor="pickup" error={errors.pickup?.message} required>
                <Input id="pickup" {...register('pickup')} />
              </Field>
              <Field label="Destination" htmlFor="destination" error={errors.destination?.message} required>
                <Input id="destination" {...register('destination')} />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Weight (Kg)" htmlFor="weightKg" error={errors.weightKg?.message} required>
                <Input id="weightKg" type="number" {...register('weightKg')} />
              </Field>
              <Field label="Rate (₹)" htmlFor="rate" error={errors.rate?.message} required>
                <Input id="rate" type="number" {...register('rate')} />
              </Field>
              <Field label="GST %" htmlFor="gstPercent" error={errors.gstPercent?.message} required>
                <Input id="gstPercent" type="number" {...register('gstPercent')} />
              </Field>
              <Field label="Discount (₹)" htmlFor="discount" error={errors.discount?.message}>
                <Input id="discount" type="number" {...register('discount')} />
              </Field>
              <Field label="Validity" htmlFor="validity" error={errors.validity?.message} required>
                <Input id="validity" type="date" {...register('validity')} />
              </Field>
              <div className="flex flex-col justify-end rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] px-3 py-2">
                <span className="text-xs text-[var(--color-muted-foreground)]">Total (incl. GST)</span>
                <span className="text-lg font-semibold text-[var(--color-foreground)]">{formatCurrency(total)}</span>
              </div>
            </div>

            <Field label="Terms" htmlFor="terms" hint="Optional — payment terms, validity conditions, etc.">
              <Textarea id="terms" rows={2} {...register('terms')} />
            </Field>
            <Field label="Remarks" htmlFor="remarks">
              <Textarea id="remarks" rows={2} {...register('remarks')} />
            </Field>

            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4">
              <Button type="button" variant="outline" onClick={() => navigate('/quotation')}>
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Save Quotation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
