import * as React from 'react'
import { Pencil, Plus, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface ChargeRecord {
  chargeId: number | string
  chargeName?: string | null
  isActive?: boolean | null
  createdAt?: string | null
  updatedAt?: string | null
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function ChargeListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const [charges, setCharges] = React.useState<ChargeRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const loadCharges = React.useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await apiClient.get('/charges', { params: { page: 1, pageSize: 100 } })
      if (!Array.isArray(data?.data)) {
        throw new Error('The server returned an invalid charge list.')
      }
      setCharges(data.data)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadCharges()
  }, [loadCharges])

  const filteredCharges = React.useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return charges

    return charges.filter((charge) =>
      Object.values(charge)
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    )
  }, [charges, search])

  return (
    <div>
      <PageHeader
        title={`Charge List${charges.length ? ` (${charges.length})` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadCharges()}
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button type="button" size="sm" onClick={() => navigate('/masters/add-new-charge')}>
              <Plus className="h-4 w-4" /> Add Charge
            </Button>
          </div>
        }
      />

      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <Input
            aria-label="Search charges"
            placeholder="Search charges…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            Loading charges…
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadCharges()}>
              Try again
            </Button>
          </div>
        ) : filteredCharges.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            No charge records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                <tr>
                  {['charge_id', 'charge_name', 'is_active', 'created_at', 'updated_at', 'actions'].map((label) => (
                    <th key={label} className="px-4 py-3 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCharges.map((charge) => (
                  <tr key={charge.chargeId} className="border-t border-[var(--color-border)] align-top">
                    <td className="px-4 py-3 font-medium">{charge.chargeId}</td>
                    <td className="px-4 py-3">{charge.chargeName || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          charge.isActive === false
                            ? 'rounded-full bg-[var(--color-danger)]/10 px-2 py-1 text-xs font-medium text-[var(--color-danger)]'
                            : 'rounded-full bg-[var(--color-success)]/10 px-2 py-1 text-xs font-medium text-[var(--color-success)]'
                        }
                      >
                        {charge.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(charge.createdAt)}</td>
                    <td className="px-4 py-3">{formatDate(charge.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${charge.chargeName || 'charge'}`}
                        title="Edit charge"
                        onClick={() => navigate(`/masters/charge/${charge.chargeId}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
