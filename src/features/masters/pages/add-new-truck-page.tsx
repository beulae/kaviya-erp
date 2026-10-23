import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toaster'

const INITIAL_FORM = {
  vehicleType: 'OWN',
  vehicleStateCode: '',
  vehicleRtoCode: '',
  vehicleSeries: '',
  vehicleUniqueNo: '',
  engineNumber: '',
  chassisNumber: '',
  supplierName: '',
  supplierMobileNumber: '',
  supplierPanNumber: '',
  supplierAddress: '',
  driverName: '',
  driverMobileNumber: '',
  driverDlNumber: '',
  isActive: true,
}

type TruckTextField = Exclude<keyof typeof INITIAL_FORM, 'vehicleType' | 'isActive'>

function optionalValue(value: string) {
  return value.trim() || null
}

export default function AddNewTruckPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [form, setForm] = React.useState(INITIAL_FORM)
  const [isLoading, setIsLoading] = React.useState(Boolean(id))
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [loadError, setLoadError] = React.useState('')

  React.useEffect(() => {
    if (!id) {
      setForm(INITIAL_FORM)
      setIsLoading(false)
      setLoadError('')
      return
    }

    let active = true
    setIsLoading(true)
    setLoadError('')

    apiClient
      .get(`/trucks/${id}`)
      .then(({ data }) => {
        const truck = data?.data
        if (!truck || typeof truck !== 'object') {
          throw new Error('The server returned an invalid truck record.')
        }
        if (!active) return

        setForm({
          vehicleType: truck.vehicleType ?? 'OWN',
          vehicleStateCode: truck.vehicleStateCode ?? '',
          vehicleRtoCode: truck.vehicleRtoCode ?? '',
          vehicleSeries: truck.vehicleSeries ?? '',
          vehicleUniqueNo: truck.vehicleUniqueNo ?? '',
          engineNumber: truck.engineNumber ?? '',
          chassisNumber: truck.chassisNumber ?? '',
          supplierName: truck.supplierName ?? '',
          supplierMobileNumber: truck.supplierMobileNumber ?? '',
          supplierPanNumber: truck.supplierPanNumber ?? '',
          supplierAddress: truck.supplierAddress ?? '',
          driverName: truck.driverName ?? '',
          driverMobileNumber: truck.driverMobileNumber ?? '',
          driverDlNumber: truck.driverDlNumber ?? '',
          isActive: truck.isActive ?? true,
        })
      })
      .catch((error: unknown) => {
        if (active) setLoadError(getApiErrorMessage(error))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  const handleTextChange = (field: TruckTextField, value: string) => {
    const normalized = ['vehicleStateCode', 'vehicleSeries', 'supplierPanNumber'].includes(field)
      ? value.toUpperCase()
      : value
    setForm((current) => ({ ...current, [field]: normalized }))
  }

  const handleVehicleTypeChange = (vehicleType: string) => {
    setForm((current) => ({
      ...current,
      vehicleType,
      ...(vehicleType === 'OWN'
        ? {
            engineNumber: '',
            chassisNumber: '',
            supplierName: '',
            supplierMobileNumber: '',
            supplierPanNumber: '',
            supplierAddress: '',
          }
        : {}),
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isMarket = form.vehicleType === 'MARKET'
    const payload = {
      vehicleType: form.vehicleType,
      vehicleStateCode: form.vehicleStateCode.trim().toUpperCase(),
      vehicleRtoCode: form.vehicleRtoCode.trim(),
      vehicleSeries: form.vehicleSeries.trim().toUpperCase(),
      vehicleUniqueNo: form.vehicleUniqueNo.trim(),
      engineNumber: optionalValue(form.engineNumber),
      chassisNumber: optionalValue(form.chassisNumber),
      supplierName: isMarket ? optionalValue(form.supplierName) : null,
      supplierMobileNumber: isMarket ? optionalValue(form.supplierMobileNumber) : null,
      supplierPanNumber: isMarket ? (optionalValue(form.supplierPanNumber)?.toUpperCase() ?? null) : null,
      supplierAddress: isMarket ? optionalValue(form.supplierAddress) : null,
      driverName: optionalValue(form.driverName),
      driverMobileNumber: optionalValue(form.driverMobileNumber),
      driverDlNumber: optionalValue(form.driverDlNumber),
      isActive: form.isActive,
    }

    if (
      !payload.vehicleStateCode ||
      !payload.vehicleRtoCode ||
      !payload.vehicleSeries ||
      !payload.vehicleUniqueNo
    ) {
      toast({
        title: 'Missing registration details',
        description: 'State code, RTO code, series, and vehicle number are required.',
        variant: 'error',
      })
      return
    }

    if (isMarket && !payload.supplierName) {
      toast({
        title: 'Supplier name required',
        description: 'Enter the supplier name for a market vehicle.',
        variant: 'error',
      })
      return
    }

    const phonePattern = /^\+?[0-9]{10,13}$/
    if (payload.supplierMobileNumber && !phonePattern.test(payload.supplierMobileNumber)) {
      toast({
        title: 'Invalid supplier mobile number',
        description: 'Use 10 to 13 digits with an optional leading +.',
        variant: 'error',
      })
      return
    }
    if (payload.driverMobileNumber && !phonePattern.test(payload.driverMobileNumber)) {
      toast({
        title: 'Invalid driver mobile number',
        description: 'Use 10 to 13 digits with an optional leading +.',
        variant: 'error',
      })
      return
    }
    if (payload.supplierPanNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(payload.supplierPanNumber)) {
      toast({
        title: 'Invalid supplier PAN',
        description: 'Enter a PAN in the format ABCDE1234F.',
        variant: 'error',
      })
      return
    }

    try {
      setIsSubmitting(true)
      if (id) {
        await apiClient.put(`/trucks/${id}`, payload)
      } else {
        await apiClient.post('/trucks', payload)
      }
      toast({
        title: id ? 'Truck updated' : 'Truck created',
        description: id ? 'Truck details have been saved.' : 'The truck has been added successfully.',
        variant: 'success',
      })
      navigate('/masters/truck-list')
    } catch (submitError) {
      toast({
        title: id ? 'Update failed' : 'Create failed',
        description: getApiErrorMessage(submitError),
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title={id ? 'Edit Truck' : 'Add New Truck'} />
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {id ? 'Edit Truck Details' : 'Truck Form'}
          </h2>
          <Button type="button" variant="primary" size="sm" onClick={() => navigate('/masters/truck-list')}>
            Truck List
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-[var(--color-muted-foreground)]">Loading truck details…</div>
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3 p-6">
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {loadError}
            </p>
            <Button type="button" variant="outline" onClick={() => navigate('/masters/truck-list')}>
              Back to Truck List
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
            <section className="space-y-4">
              <h3 className="font-semibold text-[var(--color-foreground)]">Vehicle Details</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  Vehicle Type
                  <select
                    value={form.vehicleType}
                    onChange={(event) => handleVehicleTypeChange(event.target.value)}
                    className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                  >
                    <option value="OWN">Own</option>
                    <option value="MARKET">Market</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  State Code *
                  <Input maxLength={2} required value={form.vehicleStateCode} onChange={(e) => handleTextChange('vehicleStateCode', e.target.value)} placeholder="TN" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  RTO Code *
                  <Input maxLength={2} required value={form.vehicleRtoCode} onChange={(e) => handleTextChange('vehicleRtoCode', e.target.value)} placeholder="01" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  Series *
                  <Input maxLength={3} required value={form.vehicleSeries} onChange={(e) => handleTextChange('vehicleSeries', e.target.value)} placeholder="AB" />
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  Vehicle Number *
                  <Input maxLength={4} required inputMode="numeric" value={form.vehicleUniqueNo} onChange={(e) => handleTextChange('vehicleUniqueNo', e.target.value)} placeholder="1234" />
                </label>
              </div>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Full vehicle number is generated by the backend from the registration fields.
              </p>
            </section>

            {form.vehicleType === 'MARKET' && (
              <section className="space-y-4">
                <h3 className="font-semibold text-[var(--color-foreground)]">Market Truck Details</h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                    Engine Number
                    <Input maxLength={25} value={form.engineNumber} onChange={(e) => handleTextChange('engineNumber', e.target.value)} />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                    Chassis Number
                    <Input maxLength={25} value={form.chassisNumber} onChange={(e) => handleTextChange('chassisNumber', e.target.value)} />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                    Supplier Name *
                    <Input maxLength={255} required value={form.supplierName} onChange={(e) => handleTextChange('supplierName', e.target.value)} />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                    Supplier Mobile Number
                    <Input maxLength={15} inputMode="tel" value={form.supplierMobileNumber} onChange={(e) => handleTextChange('supplierMobileNumber', e.target.value)} />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                    Supplier PAN Number
                    <Input maxLength={10} value={form.supplierPanNumber} onChange={(e) => handleTextChange('supplierPanNumber', e.target.value)} />
                  </label>
                  <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)] sm:col-span-2 lg:col-span-3">
                    Supplier Address
                    <Input value={form.supplierAddress} onChange={(e) => handleTextChange('supplierAddress', e.target.value)} />
                  </label>
                </div>
              </section>
            )}

            <section className="space-y-4">
              <h3 className="font-semibold text-[var(--color-foreground)]">Driver Details</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  Driver Name
                  <Input maxLength={255} value={form.driverName} onChange={(e) => handleTextChange('driverName', e.target.value)} />
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  Driver Mobile Number
                  <Input maxLength={15} inputMode="tel" value={form.driverMobileNumber} onChange={(e) => handleTextChange('driverMobileNumber', e.target.value)} />
                </label>
                <label className="space-y-2 text-sm font-medium text-[var(--color-foreground)]">
                  Driver DL Number
                  <Input maxLength={20} value={form.driverDlNumber} onChange={(e) => handleTextChange('driverDlNumber', e.target.value)} />
                </label>
              </div>
            </section>

            <label className="flex w-fit items-center gap-2 text-sm font-medium text-[var(--color-foreground)]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
              />
              Is Active
            </label>

            <Button type="submit" variant="accent" size="lg" loading={isSubmitting} className="w-full sm:max-w-md">
              {id ? 'Save Changes' : 'Add Truck Details'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
