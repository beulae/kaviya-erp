import * as React from 'react'
import { Pencil, Plus, Printer, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface TermsConditionRecord {
  tncId: number | string
  description?: string | null
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

export default function TermsConditionListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const [terms, setTerms] = React.useState<TermsConditionRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const loadTerms = React.useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await apiClient.get('/terms-conditions', { params: { page: 1, pageSize: 100 } })
      if (!Array.isArray(data?.data)) {
        throw new Error('The server returned an invalid terms and conditions list.')
      }
      setTerms(
        [...data.data].sort((left: TermsConditionRecord, right: TermsConditionRecord) =>
          String(left.tncId).localeCompare(String(right.tncId), undefined, { numeric: true }),
        ),
      )
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadTerms()
  }, [loadTerms])

  const filteredTerms = React.useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return terms
    return terms.filter((term) => term.description?.toLowerCase().includes(keyword))
  }, [search, terms])

  return (
    <div>
      <PageHeader
        title={`Terms & Condition List (For Bilty PDF)${terms.length ? ` (${terms.length})` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadTerms()}
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button type="button" size="sm" onClick={() => navigate('/masters/add-new-terms-condition')}>
              <Plus className="h-4 w-4" /> Add New Terms & Condition
            </Button>
          </div>
        }
      />

      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <Input
            aria-label="Search terms and conditions"
            placeholder="Search terms and conditions…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            Loading terms and conditions…
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadTerms()}>
              Try again
            </Button>
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            No terms and conditions records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                <tr>
                  {['S.No.', 'description', 'is_active', 'created_at', 'updated_at', 'actions'].map((label) => (
                    <th key={label} className="px-4 py-3 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTerms.map((term, index) => (
                  <tr key={term.tncId} className="border-t border-[var(--color-border)] align-top">
                    <td className="whitespace-nowrap px-4 py-3">{index + 1}.</td>
                    <td className="min-w-[600px] whitespace-pre-wrap px-4 py-3">{term.description || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          term.isActive === false
                            ? 'rounded-full bg-[var(--color-danger)]/10 px-2 py-1 text-xs font-medium text-[var(--color-danger)]'
                            : 'rounded-full bg-[var(--color-success)]/10 px-2 py-1 text-xs font-medium text-[var(--color-success)]'
                        }
                      >
                        {term.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(term.createdAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3">{formatDate(term.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit terms and conditions ${index + 1}`}
                        title="Edit terms and conditions"
                        onClick={() => navigate(`/masters/terms-condition/${term.tncId}/edit`)}
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
