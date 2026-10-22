import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toaster'

const INITIAL_FORM = {
  supplierName: '',
  contactNumber: '',
  panNumber: '',
  address: '',
  isActive: true,
}

export default function AddNewSupplierPage() {
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
      .get(`/suppliers/${id}`)
      .then(({ data }) => {
        const supplier = data?.data
        if (!supplier || typeof supplier !== 'object') {
          throw new Error('The server returned an invalid supplier record.')
        }
        if (!active) return

        setForm({
          supplierName: supplier.supplierName ?? '',
          contactNumber: supplier.contactNumber ?? '',
          panNumber: supplier.panNumber ?? '',
          address: supplier.address ?? '',
          isActive: supplier.isActive ?? true,
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      supplierName: form.supplierName.trim(),
      contactNumber: form.contactNumber.trim() || null,
      panNumber: form.panNumber.trim().toUpperCase() || null,
      address: form.address.trim() || null,
      isActive: form.isActive,
    }

    if (!payload.supplierName) {
      toast({
        title: 'Supplier name required',
        description: 'Enter a supplier name to continue.',
        variant: 'error',
      })
      return
    }

    if (payload.contactNumber && !/^\+?[0-9]{10,13}$/.test(payload.contactNumber)) {
      toast({
        title: 'Invalid contact number',
        description: 'Use 10 to 13 digits with an optional leading +.',
        variant: 'error',
      })
      return
    }

    if (payload.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(payload.panNumber)) {
      toast({
        title: 'Invalid PAN number',
        description: 'Enter a PAN in the format ABCDE1234F.',
        variant: 'error',
      })
      return
    }

    try {
      setIsSubmitting(true)
      if (id) {
        await apiClient.put(`/suppliers/${id}`, payload)
      } else {
        await apiClient.post('/suppliers', payload)
      }
      toast({
        title: id ? 'Supplier updated' : 'Supplier created',
        description: id ? 'Supplier details have been saved.' : 'The supplier has been added successfully.',
        variant: 'success',
      })
      navigate('/masters/supplier-list')
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
      <PageHeader title={id ? 'Edit Supplier' : 'Add New Supplier'} />
      <Card className="overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {id ? 'Edit Supplier Details' : 'Supplier Form'}
          </h2>
          <Button type="button" variant="primary" size="sm" onClick={() => navigate('/masters/supplier-list')}>
            Supplier List
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-[var(--color-muted-foreground)]">Loading supplier details…</div>
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3 p-6">
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {loadError}
            </p>
            <Button type="button" variant="outline" onClick={() => navigate('/masters/supplier-list')}>
              Back to Supplier List
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-2 text-sm text-[var(--color-foreground)] md:col-span-2">
                <span className="flex items-center gap-1 font-medium">
                  Supplier Name <span className="text-[var(--color-danger)]">*</span>
                </span>
                <Input
                  maxLength={255}
                  required
                  value={form.supplierName}
                  onChange={(event) => setForm((current) => ({ ...current, supplierName: event.target.value }))}
                  placeholder="Supplier Name"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="font-medium">Contact Number</span>
                <Input
                  maxLength={15}
                  inputMode="tel"
                  value={form.contactNumber}
                  onChange={(event) => setForm((current) => ({ ...current, contactNumber: event.target.value }))}
                  placeholder="Contact Number"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="font-medium">Supplier PAN Number</span>
                <Input
                  maxLength={10}
                  value={form.panNumber}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, panNumber: event.target.value.toUpperCase() }))
                  }
                  placeholder="Supplier PAN Number"
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm text-[var(--color-foreground)]">
              <span className="font-medium">Supplier Address</span>
              <textarea
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                placeholder="Address"
                rows={3}
                className="flex w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none"
              />
            </label>

            <label className="flex w-fit items-center gap-2 text-sm font-medium text-[var(--color-foreground)]">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
              />
              Is Active
            </label>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              loading={isSubmitting}
              className="mx-auto w-full max-w-[480px] rounded-md bg-[#1fbf5a] text-white hover:opacity-90"
            >
              {id ? 'Save Changes' : 'Add Supplier Details'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
