import * as React from 'react'
import { createColumnHelper } from '@tanstack/react-table'
import { Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/tables/data-table'

interface Customer {
  id: string
  name: string
  gstNumber: string
  city: string
  mobile: string
  outstanding: number
  status: 'active' | 'inactive'
}

const CUSTOMERS: Customer[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `cust-${i + 1}`,
  name: ['Sri Vinayaga Traders', 'AVM Textiles', 'Sun Agro Foods', 'Coastal Steels', 'Metro Distributors'][i % 5],
  gstNumber: `33ABCDE${1000 + i}F1Z${i % 10}`,
  city: ['Chennai', 'Bengaluru', 'Coimbatore', 'Hyderabad'][i % 4],
  mobile: `9${800000000 + i * 137}`,
  outstanding: (i % 6) * 12500,
  status: i % 7 === 0 ? 'inactive' : 'active',
}))

const columnHelper = createColumnHelper<Customer>()
const columns = [
  columnHelper.accessor('name', {
    header: 'Customer Name',
    cell: (i) => <span className="font-medium">{i.getValue()}</span>,
  }),
  columnHelper.accessor('gstNumber', { header: 'GST Number' }),
  columnHelper.accessor('city', { header: 'City' }),
  columnHelper.accessor('mobile', { header: 'Mobile' }),
  columnHelper.accessor('outstanding', {
    header: 'Outstanding',
    cell: (i) => `₹${i.getValue().toLocaleString('en-IN')}`,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (i) => (
      <Badge variant={i.getValue() === 'active' ? 'success' : 'neutral'}>
        {i.getValue() === 'active' ? 'Active' : 'Inactive'}
      </Badge>
    ),
  }),
]

export default function CustomersPage() {
  const [search, setSearch] = React.useState('')
  const filtered = CUSTOMERS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage consignor and consignee master records."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add Customer
          </Button>
        }
      />
      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search customers…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyLabel="No customers found" />
      </Card>
    </div>
  )
}
