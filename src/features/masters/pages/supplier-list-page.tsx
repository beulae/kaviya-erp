import * as React from 'react'
import { Pencil, Plus, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface SupplierRecord {
  supplierId: number | string
  supplierName?: string | null
  contactNumber?: string | null
  panNumber?: string | null
  address?: string | null
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

export default function SupplierListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const [suppliers, setSuppliers] = React.useState<SupplierRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const loadSuppliers = React.useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await apiClient.get('/suppliers', { params: { page: 1, pageSize: 100 } })
      if (!Array.isArray(data?.data)) {
        throw new Error('The server returned an invalid supplier list.')
      }
      setSuppliers(data.data)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadSuppliers()
  }, [loadSuppliers])

  const filteredSuppliers = React.useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return suppliers

    return suppliers.filter((supplier) =>
      Object.values(supplier)
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    )
  }, [search, suppliers])

  return (
    <div>
      <PageHeader
        title={`Supplier List${suppliers.length ? ` (${suppliers.length})` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadSuppliers()}
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button type="button" size="sm" onClick={() => navigate('/masters/add-new-supplier')}>
              <Plus className="h-4 w-4" /> Add Supplier
            </Button>
          </div>
        }
      />

      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <Input
            aria-label="Search suppliers"
            placeholder="Search suppliers…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            Loading suppliers…
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadSuppliers()}>
              Try again
            </Button>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            No supplier records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                <tr>
                  {[
                    'supplier_id',
                    'supplier_name',
                    'contact_number',
                    'pan_number',
                    'address',
                    'is_active',
                    'created_at',
                    'updated_at',
                    'actions',
                  ].map((label) => (
                    <th key={label} className="px-4 py-3 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.supplierId} className="border-t border-[var(--color-border)] align-top">
                    <td className="px-4 py-3 font-medium">{supplier.supplierId}</td>
                    <td className="px-4 py-3">{supplier.supplierName || '-'}</td>
                    <td className="px-4 py-3">{supplier.contactNumber || '-'}</td>
                    <td className="px-4 py-3">{supplier.panNumber || '-'}</td>
                    <td className="max-w-[280px] break-words px-4 py-3">{supplier.address || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          supplier.isActive === false
                            ? 'rounded-full bg-[var(--color-danger)]/10 px-2 py-1 text-xs font-medium text-[var(--color-danger)]'
                            : 'rounded-full bg-[var(--color-success)]/10 px-2 py-1 text-xs font-medium text-[var(--color-success)]'
                        }
                      >
                        {supplier.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatDate(supplier.createdAt)}</td>
                    <td className="px-4 py-3">{formatDate(supplier.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${supplier.supplierName || 'supplier'}`}
                        title="Edit supplier"
                        onClick={() => navigate(`/masters/supplier/${supplier.supplierId}/edit`)}
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
