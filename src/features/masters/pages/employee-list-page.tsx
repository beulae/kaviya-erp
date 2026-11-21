import * as React from 'react'
import { Pencil, Plus, RefreshCcw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface EmployeeRecord {
  employeeId: number | string
  employeeName?: string | null
  mobileNumber?: string | null
  designation?: string | null
  monthlySalary?: number | string | null
  aadhaarNumber?: string | null
  dlNumber?: string | null
  bankName?: string | null
  accountHolderName?: string | null
  accountNumber?: string | null
  ifscCode?: string | null
  isDriver?: boolean | null
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

export default function EmployeeListPage() {
  const navigate = useNavigate()
  const [search, setSearch] = React.useState('')
  const [employees, setEmployees] = React.useState<EmployeeRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const loadEmployees = React.useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const { data } = await apiClient.get('/employees', { params: { page: 1, pageSize: 100 } })
      if (!Array.isArray(data?.data)) {
        throw new Error('The server returned an invalid employee list.')
      }
      setEmployees(data.data)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    void loadEmployees()
  }, [loadEmployees])

  const filteredEmployees = React.useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return employees

    return employees.filter((employee) =>
      Object.values(employee)
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    )
  }, [employees, search])

  return (
    <div>
      <PageHeader
        title={`Employee List${employees.length ? ` (${employees.length})` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadEmployees()}
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button type="button" size="sm" onClick={() => navigate('/masters/add-new-employee')}>
              <Plus className="h-4 w-4" /> Add Employee
            </Button>
          </div>
        }
      />

      <Card>
        <div className="border-b border-[var(--color-border)] p-4">
          <Input
            aria-label="Search employees"
            placeholder="Search employees…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            Loading employees…
          </div>
        ) : error ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 p-8 text-center">
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadEmployees()}>
              Try again
            </Button>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center p-8 text-sm text-[var(--color-muted-foreground)]">
            No employee records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1900px] text-left text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                <tr>
                  {[
                    'employee_id',
                    'employee_name',
                    'mobile_number',
                    'designation',
                    'monthly_salary',
                    'aadhaar_number',
                    'dl_number',
                    'bank_name',
                    'account_holder_name',
                    'account_number',
                    'ifsc_code',
                    'is_driver',
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
                {filteredEmployees.map((employee) => (
                  <tr key={employee.employeeId} className="border-t border-[var(--color-border)] align-top">
                    <td className="px-4 py-3 font-medium">{employee.employeeId}</td>
                    <td className="px-4 py-3">{employee.employeeName || '-'}</td>
                    <td className="px-4 py-3">{employee.mobileNumber || '-'}</td>
                    <td className="px-4 py-3">{employee.designation || '-'}</td>
                    <td className="px-4 py-3">{employee.monthlySalary ?? '-'}</td>
                    <td className="px-4 py-3">{employee.aadhaarNumber || '-'}</td>
                    <td className="px-4 py-3">{employee.dlNumber || '-'}</td>
                    <td className="px-4 py-3">{employee.bankName || '-'}</td>
                    <td className="px-4 py-3">{employee.accountHolderName || '-'}</td>
                    <td className="px-4 py-3">{employee.accountNumber || '-'}</td>
                    <td className="px-4 py-3">{employee.ifscCode || '-'}</td>
                    <td className="px-4 py-3">{employee.isDriver ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3">{formatDate(employee.createdAt)}</td>
                    <td className="px-4 py-3">{formatDate(employee.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          employee.isActive === false
                            ? 'rounded-full bg-[var(--color-danger)]/10 px-2 py-1 text-xs font-medium text-[var(--color-danger)]'
                            : 'rounded-full bg-[var(--color-success)]/10 px-2 py-1 text-xs font-medium text-[var(--color-success)]'
                        }
                      >
                        {employee.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${employee.employeeName || 'employee'}`}
                        title="Edit employee"
                        onClick={() => navigate(`/masters/employee/${employee.employeeId}/edit`)}
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
