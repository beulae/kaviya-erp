import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { createColumnHelper } from '@tanstack/react-table'
import { Plus, Search, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/tables/data-table'
import { formatCurrency, formatDate } from '@/utils/format'
import { useLoadingSlips } from '../api/use-loading-slip'
import type { LoadingSlip } from '@/types/loading-slip'

const columnHelper = createColumnHelper<LoadingSlip>()

export default function LoadingSlipListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  const { data, isLoading } = useLoadingSlips({ search: debouncedSearch })

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('loadingSlipNo', {
        header: 'Slip No.',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('billGenerateDate', {
        header: 'Date',
        cell: (info) => (info.getValue() ? formatDate(info.getValue()) : '—'),
      }),
      columnHelper.accessor('partyName', { header: 'Party', cell: (info) => info.getValue() || '—' }),
      columnHelper.display({
        id: 'route',
        header: 'Route',
        cell: ({ row }) =>
          row.original.fromLocation || row.original.toLocation
            ? `${row.original.fromLocation ?? '—'} → ${row.original.toLocation ?? '—'}`
            : '—',
      }),
      columnHelper.accessor('vehicleNumber', { header: 'Vehicle' }),
      columnHelper.accessor('totalAmount', {
        header: 'Total',
        cell: (info) => formatCurrency(Number(info.getValue() ?? 0)),
      }),
      columnHelper.accessor('balanceAmount', {
        header: 'Balance',
        cell: (info) => formatCurrency(Number(info.getValue() ?? 0)),
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            className="rounded-[var(--radius-sm)] p-1.5 hover:bg-[var(--color-surface-muted)]"
            onClick={() => navigate(`/loading-slip/${row.original.loadingSlipId}/edit`)}
            aria-label="Edit loading slip"
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
        title="Loading Slip List"
        actions={
          <Button size="sm" onClick={() => navigate('/loading-slip/create')}>
            <Plus className="h-4 w-4" /> Create Loading Slip
          </Button>
        }
      />

      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search by slip no., party, vehicle…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          emptyLabel="No loading slips found"
        />
      </Card>
    </div>
  )
}
