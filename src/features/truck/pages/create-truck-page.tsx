import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { List } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { getApiErrorMessage } from '@/api/axios-instance'

import { truckSchema, type TruckFormValues } from '../schemas/truck-schema'
import { useCreateTruck, useTruck, useUpdateTruck } from '../api/use-truck'
import { joinVehicleNumber, splitVehicleNumber } from '@/features/loading-slip/api/loading-slip-mapper'

const toUpper = (v: unknown) => (typeof v === 'string' ? v.toUpperCase() : v)

const DEFAULT_VALUES: TruckFormValues = {
  vehicleType: 'own',
  vehicleState: '',
  vehicleDistrict: '',
  vehicleSeries: '',
  vehicleDigits: '',
  driverName: '',
  driverMobile: '',
  driverDlNumber: '',
}

export default function CreateTruckPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const { toast } = useToast()
  const createTruck = useCreateTruck()
  const updateTruck = useUpdateTruck()
  const { data: existingTruck } = useTruck(id ?? '')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TruckFormValues>({
    resolver: zodResolver(truckSchema),
    defaultValues: DEFAULT_VALUES,
  })

  React.useEffect(() => {
    if (isEdit && existingTruck) {
      reset({
        vehicleType: existingTruck.vehicleType ?? 'own',
        ...splitVehicleNumber(existingTruck.vehicleNumber),
        driverName: existingTruck.driverName ?? '',
        driverMobile: existingTruck.driverMobile ?? '',
        driverDlNumber: existingTruck.driverDlNumber ?? '',
      })
    } else if (!isEdit) {
      reset(DEFAULT_VALUES)
    }
  }, [isEdit, existingTruck, reset])

  const isSaving = createTruck.isPending || updateTruck.isPending
  const vehicleNumberError =
    errors.vehicleState?.message ||
    errors.vehicleDistrict?.message ||
    errors.vehicleSeries?.message ||
    errors.vehicleDigits?.message

  const onSubmit = async ({ vehicleState, vehicleDistrict, vehicleSeries, vehicleDigits, ...rest }: TruckFormValues) => {
    const payload = {
      ...rest,
      vehicleNumber: joinVehicleNumber({ vehicleState, vehicleDistrict, vehicleSeries, vehicleDigits }),
    }
    try {
      if (isEdit) {
        await updateTruck.mutateAsync({ id, payload })
        toast({ title: 'Truck updated', variant: 'success' })
      } else {
        await createTruck.mutateAsync(payload)
        toast({ title: 'Truck added', description: 'The truck has been saved.', variant: 'success' })
      }
      navigate('/masters/truck')
    } catch (error) {
      toast({ title: 'Save failed', description: getApiErrorMessage(error), variant: 'error' })
    }
  }

  return (
    <div>
      <PageHeader
        title="Truck Form"
        actions={
          <Button type="button" size="sm" onClick={() => navigate('/masters/truck')}>
            <List className="h-4 w-4" /> Truck List
          </Button>
        }
      />

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 md:col-span-6">
                <span className="text-sm font-medium text-[var(--color-foreground)]">Vehicle Type :</span>
                {(
                  [
                    ['own', 'Own Truck'],
                    ['market', 'Market Truck'],
                  ] as const
                ).map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                    <input
                      type="radio"
                      value={value}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                      {...register('vehicleType')}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <Field
                label="Vehicle Number"
                htmlFor="vehicleState"
                className="md:col-span-6"
                error={vehicleNumberError}
                required
              >
                <div className="grid grid-cols-4 gap-2 sm:gap-4">
                  <Input
                    id="vehicleState"
                    aria-label="State code"
                    placeholder="XX"
                    maxLength={2}
                    className="uppercase"
                    error={!!errors.vehicleState}
                    {...register('vehicleState', { setValueAs: toUpper })}
                  />
                  <Input
                    aria-label="District code"
                    placeholder="XX"
                    inputMode="numeric"
                    maxLength={2}
                    error={!!errors.vehicleDistrict}
                    {...register('vehicleDistrict')}
                  />
                  <Input
                    aria-label="Series"
                    placeholder="XX"
                    maxLength={3}
                    className="uppercase"
                    error={!!errors.vehicleSeries}
                    {...register('vehicleSeries', { setValueAs: toUpper })}
                  />
                  <Input
                    aria-label="Number"
                    placeholder="XXXX"
                    inputMode="numeric"
                    maxLength={4}
                    error={!!errors.vehicleDigits}
                    {...register('vehicleDigits')}
                  />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <Field label="Driver Name" htmlFor="driverName" className="md:col-span-6" error={errors.driverName?.message}>
                <Input id="driverName" placeholder="Driver Name" {...register('driverName')} />
              </Field>
              <Field
                label="Driver Mobile Number"
                htmlFor="driverMobile"
                className="md:col-span-3"
                error={errors.driverMobile?.message}
              >
                <Input
                  id="driverMobile"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Driver Mobile Number"
                  {...register('driverMobile')}
                />
              </Field>
              <Field
                label="Driver DL Number"
                htmlFor="driverDlNumber"
                className="md:col-span-3"
                error={errors.driverDlNumber?.message}
              >
                <Input
                  id="driverDlNumber"
                  placeholder="Driver DL Number"
                  className="uppercase"
                  {...register('driverDlNumber', { setValueAs: toUpper })}
                />
              </Field>
            </div>

            <div className="flex justify-center pt-2">
              <Button type="submit" disabled={isSaving} className="w-full max-w-md">
                {isSaving ? 'Saving…' : isEdit ? 'Update Vehicle Details' : 'Add Vehicle Details'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
