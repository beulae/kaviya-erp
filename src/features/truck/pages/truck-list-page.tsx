import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { createColumnHelper } from '@tanstack/react-table'
import { Plus, Search, Pencil } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/tables/data-table'
import { useTrucks } from '../api/use-truck'
import type { Truck } from '@/types/truck'

const columnHelper = createColumnHelper<Truck>()

export default function TruckListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  const { data, isLoading } = useTrucks({ search: debouncedSearch })

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('vehicleNumber', {
        header: 'Vehicle Number',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('vehicleType', {
        header: 'Vehicle Type',
        cell: (info) => (
          <Badge variant={info.getValue() === 'own' ? 'success' : 'neutral'}>
            {info.getValue() === 'own' ? 'Own Truck' : 'Market Truck'}
          </Badge>
        ),
      }),
      columnHelper.accessor('driverName', { header: 'Driver Name', cell: (info) => info.getValue() || '—' }),
      columnHelper.accessor('driverMobile', { header: 'Driver Mobile', cell: (info) => info.getValue() || '—' }),
      columnHelper.accessor('driverDlNumber', { header: 'Driver DL Number', cell: (info) => info.getValue() || '—' }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            className="rounded-[var(--radius-sm)] p-1.5 hover:bg-[var(--color-surface-muted)]"
            onClick={() => navigate(`/masters/truck/${row.original.id}/edit`)}
            aria-label="Edit truck"
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
        title="Truck List"
        actions={
          <Button size="sm" onClick={() => navigate('/masters/truck/create')}>
            <Plus className="h-4 w-4" /> Add New Truck
          </Button>
        }
      />

      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search by vehicle no., driver…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyLabel="No trucks found" />
      </Card>
    </div>
  )
}
