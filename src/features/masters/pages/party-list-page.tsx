import * as React from 'react'
import { Pencil, Plus, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PartyRecord {
  id: number | string
  partyName?: string | null
  contactNumber?: string | null
  gstin?: string | null
  email?: string | null
  address?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  isActive?: boolean | null
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

export default function PartyListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const [parties, setParties] = React.useState<PartyRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const loadParties = React.useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await apiClient.get('/parties')
      const rows = Array.isArray(data?.data) ? data.data : []
      setParties(rows)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadParties()
  }, [loadParties])

  const filteredParties = React.useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return parties

    return parties.filter((party) => {
      const values = [
        party.id,
        party.partyName,
        party.contactNumber,
        party.gstin,
        party.email,
        party.address,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase())

      return values.some((value) => value.includes(keyword))
    })
  }, [parties, search])

  return (
    <div>
      <PageHeader
        title={`Party List${parties.length ? ` (${parties.length})` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void loadParties()} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button type="button" size="sm" onClick={() => navigate('/masters/add-new-party')}>
              <Plus className="h-4 w-4" /> Add Party
            </Button>
          </div>
        }
      />

      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <div className="relative max-w-sm">
            <Input
              placeholder="Search parties…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-3"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            Loading parties…
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadParties()}>
              Try again
            </Button>
          </div>
        ) : filteredParties.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            No party records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-medium">party_id</th>
                  <th className="px-4 py-3 font-medium">party_name</th>
                  <th className="px-4 py-3 font-medium">contact_number</th>
                  <th className="px-4 py-3 font-medium">gstin</th>
                  <th className="px-4 py-3 font-medium">email</th>
                  <th className="px-4 py-3 font-medium">address</th>
                  <th className="px-4 py-3 font-medium">created_at</th>
                  <th className="px-4 py-3 font-medium">updated_at</th>
                  <th className="px-4 py-3 font-medium">is_active</th>
                  <th className="px-4 py-3 font-medium">actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParties.map((party) => (
                  <tr key={party.id} className="border-t border-[var(--color-border)] align-top">
                    <td className="px-4 py-3 font-medium text-[var(--color-foreground)]">{party.id}</td>
                    <td className="px-4 py-3 text-[var(--color-foreground)]">{party.partyName || '-'}</td>
                    <td className="px-4 py-3 text-[var(--color-foreground)]">{party.contactNumber || '-'}</td>
                    <td className="px-4 py-3 text-[var(--color-foreground)]">{party.gstin || '-'}</td>
                    <td className="px-4 py-3 text-[var(--color-foreground)]">{party.email || '-'}</td>
                    <td className="px-4 py-3 text-[var(--color-foreground)] max-w-[260px] break-words">
                      {party.address || '-'}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-foreground)]">{formatDate(party.createdAt)}</td>
                    <td className="px-4 py-3 text-[var(--color-foreground)]">{formatDate(party.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          party.isActive === false
                            ? 'rounded-full bg-[var(--color-danger)]/10 px-2 py-1 text-xs font-medium text-[var(--color-danger)]'
                            : 'rounded-full bg-[var(--color-success)]/10 px-2 py-1 text-xs font-medium text-[var(--color-success)]'
                        }
                      >
                        {party.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${party.partyName || 'party'}`}
                        title="Edit party"
                        onClick={() => navigate(`/masters/party/${party.id}/edit`)}
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
