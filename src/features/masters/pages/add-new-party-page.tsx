import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useToast } from '@/components/ui/toaster'

const INITIAL_FORM = {
  partyName: '',
  contactNumber: '',
  gstin: '',
  email: '',
  address: '',
  isActive: true,
}

export default function AddNewPartyPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [form, setForm] = React.useState(INITIAL_FORM)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(Boolean(id))
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
      .get(`/parties/${id}`)
      .then(({ data }) => {
        const party = data?.data
        if (!party || typeof party !== 'object') {
          throw new Error('The server returned an invalid party record.')
        }

        if (!active) return
        setForm({
          partyName: party.partyName ?? '',
          contactNumber: party.contactNumber ?? '',
          gstin: party.gstin ?? '',
          email: party.email ?? '',
          address: party.address ?? '',
          isActive: party.isActive ?? true,
        })
      })
      .catch((error: unknown) => {
        if (!active) return
        setLoadError(getApiErrorMessage(error))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  const handleChange = (field: 'partyName' | 'contactNumber' | 'gstin' | 'email' | 'address', value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const payload = {
      partyName: form.partyName.trim(),
      contactNumber: form.contactNumber.trim() || null,
      gstin: form.gstin.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim(),
      isActive: form.isActive,
    }

    if (!payload.partyName || !payload.address) {
      toast({
        title: 'Missing required fields',
        description: 'Party name and address are required.',
        variant: 'error',
      })
      return
    }

    try {
      setIsSubmitting(true)
      if (id) {
        await apiClient.put(`/parties/${id}`, payload)
      } else {
        await apiClient.post('/parties', payload)
      }
      toast({
        title: id ? 'Party updated' : 'Party created',
        description: id ? 'The party details have been saved.' : 'The party has been added successfully.',
        variant: 'success',
      })
      navigate('/masters/party-list')
    } catch (submitError) {
      toast({
        title: 'Create failed',
        description: getApiErrorMessage(submitError),
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title={id ? 'Edit Party' : 'Add New Party'} />

      <Card className="overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
          <h2 className="text-[2rem] font-semibold tracking-tight text-[var(--color-foreground)]">
            {id ? 'Edit Party Details' : 'Party Form'}
          </h2>
          <Button type="button" variant="primary" size="sm" onClick={() => navigate('/masters/party-list')}>
            Party List
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-[var(--color-muted-foreground)]">Loading party details…</div>
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3 p-6">
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {loadError}
            </p>
            <Button type="button" variant="outline" onClick={() => navigate('/masters/party-list')}>
              Back to Party List
            </Button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-[var(--color-foreground)]">
              <span className="flex items-center gap-1 font-medium">
                Party Name <span className="text-[var(--color-danger)]">*</span>
              </span>
              <Input
                value={form.partyName}
                onChange={(event) => handleChange('partyName', event.target.value)}
                placeholder="Party Name"
              />
            </label>

            <label className="space-y-2 text-sm text-[var(--color-foreground)]">
              <span className="font-medium">Contact Number</span>
              <Input
                value={form.contactNumber}
                onChange={(event) => handleChange('contactNumber', event.target.value)}
                placeholder="Contact Number"
              />
            </label>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="space-y-2 text-sm text-[var(--color-foreground)]">
              <span className="font-medium">GSTIN Number</span>
              <Input
                value={form.gstin}
                onChange={(event) => handleChange('gstin', event.target.value)}
                placeholder="GSTIN"
              />
            </label>

            <label className="space-y-2 text-sm text-[var(--color-foreground)]">
              <span className="font-medium">Email</span>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => handleChange('email', event.target.value)}
                placeholder="Email"
              />
            </label>
          </div>

          <label className="block space-y-2 text-sm text-[var(--color-foreground)]">
            <span className="flex items-center gap-1 font-medium">
              Address <span className="text-[var(--color-danger)]">*</span>
            </span>
            <Input
              value={form.address}
              onChange={(event) => handleChange('address', event.target.value)}
              placeholder="Address"
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

          <div className="pt-2">
            <Button
              type="submit"
              variant="accent"
              size="lg"
              loading={isSubmitting}
              className="mx-auto w-full max-w-[480px] rounded-md bg-[#1fbf5a] text-white hover:opacity-90"
            >
              {id ? 'Save Changes' : 'Add Party Details'}
            </Button>
          </div>
        </form>
        )}
      </Card>
    </div>
  )
}
