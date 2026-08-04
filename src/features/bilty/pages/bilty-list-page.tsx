import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { createColumnHelper } from '@tanstack/react-table'
import { Plus, Search, Download, Printer, Eye, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/tables/data-table'
import { BiltyStatusBadge } from '../components/bilty-status-badge'
import { useBilties } from '../api/use-bilty'
import { formatCurrency, formatDate } from '@/utils/format'
import type { Bilty } from '@/types/bilty'

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Transit', value: 'in_transit' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

const columnHelper = createColumnHelper<Bilty>()

export default function BiltyListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState('')
  const [selected, setSelected] = React.useState<Bilty[]>([])

  const { data, isLoading } = useBilties({ search, status })

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('biltyNumber', {
        header: 'Bilty No.',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('date', { header: 'Date', cell: (info) => formatDate(info.getValue()) }),
      columnHelper.accessor('consignorName', { header: 'Consignor' }),
      columnHelper.accessor('consigneeName', { header: 'Consignee' }),
      columnHelper.display({
        id: 'route',
        header: 'Route',
        cell: ({ row }) => `${row.original.fromCity} → ${row.original.toCity}`,
      }),
      columnHelper.accessor('vehicleNumber', { header: 'Vehicle' }),
      columnHelper.accessor('freightAmount', { header: 'Freight', cell: (info) => formatCurrency(info.getValue()) }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <BiltyStatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              className="rounded-[var(--radius-sm)] p-1.5 hover:bg-[var(--color-surface-muted)]"
              onClick={() => navigate(`/bilty/${row.original.id}`)}
              aria-label="View bilty"
            >
              <Eye className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            </button>
            <button
              className="rounded-[var(--radius-sm)] p-1.5 hover:bg-[var(--color-surface-muted)]"
              onClick={() => navigate(`/bilty/${row.original.id}/edit`)}
              aria-label="Edit bilty"
            >
              <Pencil className="h-4 w-4 text-[var(--color-muted-foreground)]" />
            </button>
          </div>
        ),
      }),
    ],
    [navigate],
  )

  return (
    <div>
      <PageHeader
        title="Bilty"
        description="Manage all consignment bilties across branches."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button size="sm" onClick={() => navigate('/bilty/create')}>
              <Plus className="h-4 w-4" /> Create Bilty
            </Button>
          </>
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-[var(--color-border)] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search by bilty no., consignor, consignee…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <Select
              placeholder="All statuses"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>
          <Input type="date" className="sm:w-44" aria-label="Filter by date" />
          {selected.length > 0 && (
            <Button variant="outline" size="sm">
              Bulk actions ({selected.length})
            </Button>
          )}
        </div>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          enableRowSelection
          onRowSelectionChange={setSelected}
          emptyLabel="No bilties found"
        />
      </Card>
    </div>
  )
}
