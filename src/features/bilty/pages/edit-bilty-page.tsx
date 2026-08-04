import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useBilty } from '../api/use-bilty'
import { useToast } from '@/components/ui/toaster'
import type { Bilty } from '@/types/bilty'

export default function EditBiltyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: bilty, isLoading } = useBilty(id!)

  const { register, handleSubmit, formState } = useForm<Partial<Bilty>>({ values: bilty })

  if (isLoading || !bilty) {
    return (
      <div>
        <PageHeader title="Edit Bilty" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 400))
    toast({ title: 'Bilty updated', variant: 'success' })
    navigate(`/bilty/${id}`)
  }

  return (
    <div>
      <PageHeader
        title={`Edit Bilty ${bilty.biltyNumber}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Consignor Name">
              <Input {...register('consignorName')} />
            </Field>
            <Field label="Consignee Name">
              <Input {...register('consigneeName')} />
            </Field>
            <Field label="From City">
              <Input {...register('fromCity')} />
            </Field>
            <Field label="To City">
              <Input {...register('toCity')} />
            </Field>
            <Field label="Vehicle Number">
              <Input {...register('vehicleNumber')} />
            </Field>
            <Field label="Driver Name">
              <Input {...register('driverName')} />
            </Field>
            <Field label="Weight (Kg)">
              <Input type="number" {...register('weightKg')} />
            </Field>
            <Field label="Freight Amount (₹)">
              <Input type="number" {...register('freightAmount')} />
            </Field>
            <Field label="Goods Description" className="sm:col-span-2">
              <Textarea rows={3} {...register('goodsDescription')} />
            </Field>
            <div className="flex justify-end gap-2 border-t border-[var(--color-border)] pt-4 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" loading={formState.isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
