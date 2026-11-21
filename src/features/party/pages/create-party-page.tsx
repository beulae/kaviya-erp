import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { List } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { getApiErrorMessage } from '@/api/axios-instance'

import { partySchema, type PartyFormValues } from '../schemas/party-schema'
import { useCreateParty, useParty, useUpdateParty } from '../api/use-party'

const toUpper = (v: unknown) => (typeof v === 'string' ? v.toUpperCase() : v)

const DEFAULT_VALUES: PartyFormValues = {
  partyName: '',
  contactNumber: '',
  gstin: '',
  email: '',
  address: '',
}

export default function CreatePartyPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { toast } = useToast()
  const createParty = useCreateParty()
  const updateParty = useUpdateParty()
  const { data: existingParty } = useParty(id ?? '')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema),
    defaultValues: DEFAULT_VALUES,
  })

  React.useEffect(() => {
    if (isEdit && existingParty) {
      reset({
        partyName: existingParty.partyName ?? '',
        contactNumber: existingParty.contactNumber ?? '',
        gstin: existingParty.gstin ?? '',
        email: existingParty.email ?? '',
        address: existingParty.address ?? '',
      })
    } else if (!isEdit) {
      reset(DEFAULT_VALUES)
    }
  }, [isEdit, existingParty, reset])

  const isSaving = createParty.isPending || updateParty.isPending

  const onSubmit = async (values: PartyFormValues) => {
    try {
      if (isEdit) {
        await updateParty.mutateAsync({ id, payload: values })
        toast({ title: 'Party updated', variant: 'success' })
      } else {
        await createParty.mutateAsync(values)
        toast({ title: 'Party added', description: 'The party has been saved.', variant: 'success' })
      }
      navigate('/masters/party')
    } catch (error) {
      toast({ title: 'Save failed', description: getApiErrorMessage(error), variant: 'error' })
    }
  }

  return (
    <div>
      <PageHeader
        title="Party Form"
        actions={
          <Button type="button" size="sm" onClick={() => navigate('/masters/party')}>
            <List className="h-4 w-4" /> Party List
          </Button>
        }
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <Field
                label="Party Name"
                htmlFor="partyName"
                className="md:col-span-6"
                error={errors.partyName?.message}
                required
              >
                <Input id="partyName" placeholder="Company Name" {...register('partyName')} />
              </Field>
              <Field
                label="Contact Number"
                htmlFor="contactNumber"
                className="md:col-span-3"
                error={errors.contactNumber?.message}
              >
                <Input
                  id="contactNumber"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Contact Number"
                  {...register('contactNumber')}
                />
              </Field>
              <Field label="GSTIN Number" htmlFor="gstin" className="md:col-span-3" error={errors.gstin?.message}>
                <Input
                  id="gstin"
                  maxLength={15}
                  placeholder="GSTIN"
                  className="uppercase"
                  {...register('gstin', { setValueAs: toUpper })}
                />
              </Field>
            </div>

            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input id="email" type="email" placeholder="Email" {...register('email')} />
            </Field>

            <Field label="Address" htmlFor="address" error={errors.address?.message} required>
              <Textarea id="address" rows={3} placeholder="Address" {...register('address')} />
            </Field>

            <div className="flex justify-center pt-2">
              <Button type="submit" disabled={isSaving} className="w-full max-w-md">
                {isSaving ? 'Saving…' : isEdit ? 'Update Party Details' : 'Add Party Details'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
