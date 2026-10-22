import * as React from 'react'
import { Pencil, Plus, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface TruckRecord {
  truckId: number | string
  vehicleType?: string | null
  vehicleNumber?: string | null
  vehicleStateCode?: string | null
  vehicleRtoCode?: string | null
  vehicleSeries?: string | null
  vehicleUniqueNo?: string | null
  engineNumber?: string | null
  chassisNumber?: string | null
  supplierName?: string | null
  supplierMobileNumber?: string | null
  supplierPanNumber?: string | null
  supplierAddress?: string | null
  driverName?: string | null
  driverMobileNumber?: string | null
  driverDlNumber?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  isActive?: boolean | null
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

export default function TruckListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const [trucks, setTrucks] = React.useState<TruckRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const loadTrucks = React.useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await apiClient.get('/trucks', { params: { page: 1, pageSize: 100 } })
      if (!Array.isArray(data?.data)) {
        throw new Error('The server returned an invalid truck list.')
      }
      setTrucks(data.data)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadTrucks()
  }, [loadTrucks])

  const filteredTrucks = React.useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return trucks

    return trucks.filter((truck) =>
      Object.values(truck)
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    )
  }, [search, trucks])

  return (
    <div>
      <PageHeader
        title={`Truck List${trucks.length ? ` (${trucks.length})` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => void loadTrucks()} disabled={loading}>
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button type="button" size="sm" onClick={() => navigate('/masters/add-new-truck')}>
              <Plus className="h-4 w-4" /> Add Truck
            </Button>
          </div>
        }
      />

      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <Input
            aria-label="Search trucks"
            placeholder="Search trucks…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            Loading trucks…
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadTrucks()}>
              Try again
            </Button>
          </div>
        ) : filteredTrucks.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            No truck records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1900px] text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                <tr>
                  {[
                    'truck_id',
                    'vehicle_type',
                    'vehicle_state_code',
                    'vehicle_rto_code',
                    'vehicle_series',
                    'vehicle_unique_no',
                    'vehicle_number',
                    'engine_number',
                    'chassis_number',
                    'supplier_name',
                    'supplier_mobile_number',
                    'supplier_pan_number',
                    'supplier_address',
                    'driver_name',
                    'driver_mobile_number',
                    'driver_dl_number',
                    'created_at',
                    'updated_at',
                    'is_active',
                    'actions',
                  ].map((label) => (
                    <th key={label} className="px-4 py-3 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTrucks.map((truck) => (
                  <tr key={truck.truckId} className="border-t border-[var(--color-border)] align-top">
                    <td className="px-4 py-3">{truck.truckId}</td>
                    <td className="px-4 py-3">{truck.vehicleType || '-'}</td>
                    <td className="px-4 py-3">{truck.vehicleStateCode || '-'}</td>
                    <td className="px-4 py-3">{truck.vehicleRtoCode || '-'}</td>
                    <td className="px-4 py-3">{truck.vehicleSeries || '-'}</td>
                    <td className="px-4 py-3">{truck.vehicleUniqueNo || '-'}</td>
                    <td className="px-4 py-3 font-medium">{truck.vehicleNumber || '-'}</td>
                    <td className="px-4 py-3">{truck.engineNumber || '-'}</td>
                    <td className="px-4 py-3">{truck.chassisNumber || '-'}</td>
                    <td className="px-4 py-3">{truck.supplierName || '-'}</td>
                    <td className="px-4 py-3">{truck.supplierMobileNumber || '-'}</td>
                    <td className="px-4 py-3">{truck.supplierPanNumber || '-'}</td>
                    <td className="max-w-[240px] break-words px-4 py-3">{truck.supplierAddress || '-'}</td>
                    <td className="px-4 py-3">{truck.driverName || '-'}</td>
                    <td className="px-4 py-3">{truck.driverMobileNumber || '-'}</td>
                    <td className="px-4 py-3">{truck.driverDlNumber || '-'}</td>
                    <td className="px-4 py-3">{formatDate(truck.createdAt)}</td>
                    <td className="px-4 py-3">{formatDate(truck.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          truck.isActive === false
                            ? 'rounded-full bg-[var(--color-danger)]/10 px-2 py-1 text-xs font-medium text-[var(--color-danger)]'
                            : 'rounded-full bg-[var(--color-success)]/10 px-2 py-1 text-xs font-medium text-[var(--color-success)]'
                        }
                      >
                        {truck.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit truck ${truck.vehicleNumber || truck.truckId}`}
                        title="Edit truck"
                        onClick={() => navigate(`/masters/truck/${truck.truckId}/edit`)}
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
