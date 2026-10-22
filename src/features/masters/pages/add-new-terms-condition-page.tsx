import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/toaster'

const INITIAL_FORM = {
  description: '',
  isActive: true,
}

export default function AddNewTermsConditionPage() {
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
      .get(`/terms-conditions/${id}`)
      .then(({ data }) => {
        const term = data?.data
        if (!term || typeof term !== 'object') {
          throw new Error('The server returned an invalid terms and conditions record.')
        }
        if (!active) return

        setForm({
          description: term.description ?? '',
          isActive: term.isActive ?? true,
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
      description: form.description.trim(),
      isActive: form.isActive,
    }

    if (!payload.description) {
      toast({
        title: 'Description required',
        description: 'Enter a terms and conditions description to continue.',
        variant: 'error',
      })
      return
    }

    try {
      setIsSubmitting(true)
      if (id) {
        await apiClient.put(`/terms-conditions/${id}`, payload)
      } else {
        await apiClient.post('/terms-conditions', payload)
      }
      toast({
        title: id ? 'Terms and conditions updated' : 'Terms and conditions created',
        description: id ? 'The changes have been saved.' : 'The terms and conditions have been added.',
        variant: 'success',
      })
      navigate('/masters/terms-condition-list')
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
      <PageHeader title={id ? 'Edit Terms & Condition' : 'Add New Terms & Condition'} />
      <Card className="overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {id ? 'Edit Terms & Condition Details' : 'Terms & Condition Form'}
          </h2>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate('/masters/terms-condition-list')}
          >
            Terms & Condition List
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-[var(--color-muted-foreground)]">
            Loading terms and conditions…
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3 p-6">
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {loadError}
            </p>
            <Button type="button" variant="outline" onClick={() => navigate('/masters/terms-condition-list')}>
              Back to Terms & Condition List
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            <label className="block space-y-2 text-sm text-[var(--color-foreground)]">
              <span className="flex items-center gap-1 font-medium">
                Description <span className="text-[var(--color-danger)]">*</span>
              </span>
              <textarea
                required
                rows={6}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Enter terms and conditions"
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
              className="mx-auto w-full max-w-[492px] rounded-md bg-[#1fbf5a] text-white hover:opacity-90"
            >
              {id ? 'Save Changes' : 'Add Terms & Condition'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
