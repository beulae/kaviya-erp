import * as React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/tables/data-table'

interface Vehicle {
  id: string
  number: string
  type: string
  capacityTon: number
  driver: string
  status: 'running' | 'idle' | 'maintenance'
}

const VEHICLES: Vehicle[] = Array.from({ length: 16 }).map((_, i) => ({
  id: `vehicle-${i + 1}`,
  number: `TN ${10 + (i % 9)} AB ${1000 + i}`,
  type: ['Open Body 14ft', 'Container 20ft', 'Container 32ft', 'Mini Truck', 'Trailer 40ft'][i % 5],
  capacityTon: [7, 10, 16, 3, 25][i % 5],
  driver: ['Murugan S', 'Raja P', 'Suresh K', 'Vignesh R', 'Anbu M'][i % 5],
  status: (['running', 'idle', 'maintenance'] as const)[i % 3],
}))

const STATUS_LABEL = { running: 'Running', idle: 'Idle', maintenance: 'Maintenance' } as const
const STATUS_VARIANT = { running: 'info', idle: 'success', maintenance: 'warning' } as const

const columnHelper = createColumnHelper<Vehicle>()
const columns = [
  columnHelper.accessor('number', {
    header: 'Vehicle No.',
    cell: (i) => <span className="font-medium">{i.getValue()}</span>,
  }),
  columnHelper.accessor('type', { header: 'Type' }),
  columnHelper.accessor('capacityTon', { header: 'Capacity', cell: (i) => `${i.getValue()} T` }),
  columnHelper.accessor('driver', { header: 'Driver' }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (i) => <Badge variant={STATUS_VARIANT[i.getValue()]}>{STATUS_LABEL[i.getValue()]}</Badge>,
  }),
]

export default function VehiclesPage() {
  const [search, setSearch] = React.useState('')
  const filtered = VEHICLES.filter((v) => v.number.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader
        title="Vehicles"
        description="Fleet master — vehicle type, capacity and live status."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add Vehicle
          </Button>
        }
      />
      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search vehicles…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyLabel="No vehicles found" />
      </Card>
    </div>
  )
}
