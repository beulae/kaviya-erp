import * as React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/tables/data-table'

interface Driver {
  id: string
  name: string
  licenseNumber: string
  mobile: string
  assignedVehicle: string
  status: 'on_trip' | 'available' | 'off_duty'
}

const DRIVERS: Driver[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `driver-${i + 1}`,
  name: ['Murugan S', 'Raja P', 'Suresh K', 'Vignesh R', 'Anbu M', 'Manikandan T'][i % 6],
  licenseNumber: `TN${10 + (i % 9)}${20200000 + i}`,
  mobile: `9${876543000 + i}`,
  assignedVehicle: `TN ${10 + (i % 9)} AB ${1000 + i}`,
  status: (['on_trip', 'available', 'off_duty'] as const)[i % 3],
}))

const STATUS_LABEL = { on_trip: 'On Trip', available: 'Available', off_duty: 'Off Duty' } as const
const STATUS_VARIANT = { on_trip: 'info', available: 'success', off_duty: 'neutral' } as const

const columnHelper = createColumnHelper<Driver>()
const columns = [
  columnHelper.accessor('name', {
    header: 'Driver Name',
    cell: (i) => <span className="font-medium">{i.getValue()}</span>,
  }),
  columnHelper.accessor('licenseNumber', { header: 'License No.' }),
  columnHelper.accessor('mobile', { header: 'Mobile' }),
  columnHelper.accessor('assignedVehicle', { header: 'Assigned Vehicle' }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (i) => <Badge variant={STATUS_VARIANT[i.getValue()]}>{STATUS_LABEL[i.getValue()]}</Badge>,
  }),
]

export default function DriversPage() {
  const [search, setSearch] = React.useState('')
  const filtered = DRIVERS.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader
        title="Drivers"
        description="Track driver assignments, licenses and availability."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add Driver
          </Button>
        }
      />
      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search drivers…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyLabel="No drivers found" />
      </Card>
    </div>
  )
}
