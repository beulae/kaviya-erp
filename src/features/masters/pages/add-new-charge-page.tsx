import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toaster'

const INITIAL_FORM = {
  chargeName: '',
  isActive: true,
}

export default function AddNewChargePage() {
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
      .get(`/charges/${id}`)
      .then(({ data }) => {
        const charge = data?.data
        if (!charge || typeof charge !== 'object') {
          throw new Error('The server returned an invalid charge record.')
        }
        if (!active) return

        setForm({
          chargeName: charge.chargeName ?? '',
          isActive: charge.isActive ?? true,
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
      chargeName: form.chargeName.trim(),
      isActive: form.isActive,
    }

    if (!payload.chargeName) {
      toast({
        title: 'Charge name required',
        description: 'Enter a charge name to continue.',
        variant: 'error',
      })
      return
    }

    try {
      setIsSubmitting(true)
      if (id) {
        await apiClient.put(`/charges/${id}`, payload)
      } else {
        await apiClient.post('/charges', payload)
      }
      toast({
        title: id ? 'Charge updated' : 'Charge created',
        description: id ? 'Charge details have been saved.' : 'The charge has been added successfully.',
        variant: 'success',
      })
      navigate('/masters/charge-list')
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
      <PageHeader title={id ? 'Edit Charge' : 'Add New Charge'} />
      <Card className="overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {id ? 'Edit Charge Details' : 'Charge Form'}
          </h2>
          <Button type="button" variant="primary" size="sm" onClick={() => navigate('/masters/charge-list')}>
            Charge List
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-[var(--color-muted-foreground)]">Loading charge details…</div>
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3 p-6">
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {loadError}
            </p>
            <Button type="button" variant="outline" onClick={() => navigate('/masters/charge-list')}>
              Back to Charge List
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-3">
              <label className="space-y-2 text-sm text-[var(--color-foreground)] md:col-span-2">
                <span className="flex items-center gap-1 font-medium">
                  Charge Name <span className="text-[var(--color-danger)]">*</span>
                </span>
                <Input
                  required
                  maxLength={150}
                  value={form.chargeName}
                  onChange={(event) => setForm((current) => ({ ...current, chargeName: event.target.value }))}
                  placeholder="Enter Charge Name"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="font-medium">Status</span>
                <select
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isActive: event.target.value === 'active' }))
                  }
                  className="flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none"
                >
                  <option value="active">Enable</option>
                  <option value="inactive">Disable</option>
                </select>
              </label>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              loading={isSubmitting}
              className="mx-auto w-full max-w-[492px] rounded-md bg-[#1fbf5a] text-white hover:opacity-90"
            >
              {id ? 'Save Changes' : 'Add Charge Details'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
