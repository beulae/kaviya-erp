import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { createColumnHelper } from '@tanstack/react-table'
import { Plus, Search, ArrowRightLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/tables/data-table'
import { QuotationStatusBadge } from '../components/quotation-status-badge'
import { useQuotations } from '../api/use-quotation'
import { formatCurrency, formatDate } from '@/utils/format'
import { useToast } from '@/components/ui/toaster'
import type { Quotation } from '@/types/quotation'

const columnHelper = createColumnHelper<Quotation>()

export default function QuotationListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [search, setSearch] = React.useState('')
  const { data, isLoading } = useQuotations({ search })

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('quotationNumber', {
        header: 'Quotation No.',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('date', { header: 'Date', cell: (info) => formatDate(info.getValue()) }),
      columnHelper.accessor('customerName', { header: 'Customer' }),
      columnHelper.display({
        id: 'route',
        header: 'Route',
        cell: ({ row }) => `${row.original.pickup} → ${row.original.destination}`,
      }),
      columnHelper.accessor('total', { header: 'Total', cell: (info) => formatCurrency(info.getValue()) }),
      columnHelper.accessor('validity', { header: 'Valid till', cell: (info) => formatDate(info.getValue()) }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <QuotationStatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
            onClick={() =>
              toast({
                title: 'Converted to Bilty',
                description: `${row.original.quotationNumber} moved to Bilty.`,
                variant: 'success',
              })
            }
            disabled={row.original.status === 'converted'}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" /> Convert
          </button>
        ),
      }),
    ],
    [toast],
  )

  return (
    <div>
      <PageHeader
        title="Quotation"
        description="Create and track customer quotations before converting them to bilties."
        actions={
          <Button size="sm" onClick={() => navigate('/quotation/create')}>
            <Plus className="h-4 w-4" /> Create Quotation
          </Button>
        }
      />
      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search quotation no. or customer…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyLabel="No quotations found" />
      </Card>
    </div>
  )
}
