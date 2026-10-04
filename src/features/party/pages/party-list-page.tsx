import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { createColumnHelper } from '@tanstack/react-table'
import { Plus, Search, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/tables/data-table'
import { useParties } from '../api/use-party'
import type { Party } from '@/types/party'

const columnHelper = createColumnHelper<Party>()

export default function PartyListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  const { data, isLoading } = useParties({ search: debouncedSearch })

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('partyName', {
        header: 'Party Name',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('contactNumber', { header: 'Contact Number', cell: (info) => info.getValue() || '—' }),
      columnHelper.accessor('gstin', { header: 'GSTIN', cell: (info) => info.getValue() || '—' }),
      columnHelper.accessor('email', { header: 'Email', cell: (info) => info.getValue() || '—' }),
      columnHelper.accessor('address', {
        header: 'Address',
        cell: (info) => <span className="line-clamp-2 max-w-xs">{info.getValue() || '—'}</span>,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            className="rounded-[var(--radius-sm)] p-1.5 hover:bg-[var(--color-surface-muted)]"
            onClick={() => navigate(`/masters/party/${row.original.id}/edit`)}
            aria-label="Edit party"
          >
            <Pencil className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          </button>
        ),
      }),
    ],
    [navigate],
  )

  return (
    <div>
      <PageHeader
        title="Party List"
        actions={
          <Button size="sm" onClick={() => navigate('/masters/party/create')}>
            <Plus className="h-4 w-4" /> Add New Party
          </Button>
        }
      />

      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search by name, contact, GSTIN…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyLabel="No parties found" />
      </Card>
    </div>
  )
}
