import * as React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiClient, getApiErrorMessage } from '@/api/axios-instance'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toaster'

const INITIAL_FORM = {
  employeeName: '',
  mobileNumber: '',
  designation: '',
  monthlySalary: '',
  aadhaarNumber: '',
  dlNumber: '',
  bankName: '',
  accountHolderName: '',
  accountNumber: '',
  ifscCode: '',
  isDriver: false,
  isActive: true,
}

type EmployeeTextField = Exclude<keyof typeof INITIAL_FORM, 'isDriver' | 'isActive'>

function optionalValue(value: string) {
  return value.trim() || null
}

export default function AddNewEmployeePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { toast } = useToast()
  const [form, setForm] = React.useState(INITIAL_FORM)
  const [isLoading, setIsLoading] = React.useState(Boolean(id))
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [loadError, setLoadError] = React.useState('')

  React.useEffect(() => {
    if (!id) {
      setForm(INITIAL_FORM)
      setIsLoading(false)
      setLoadError('')
      return
    }

    let active = true
    setIsLoading(true)
    setLoadError('')

    apiClient
      .get(`/employees/${id}`)
      .then(({ data }) => {
        const employee = data?.data
        if (!employee || typeof employee !== 'object') {
          throw new Error('The server returned an invalid employee record.')
        }
        if (!active) return

        setForm({
          employeeName: employee.employeeName ?? '',
          mobileNumber: employee.mobileNumber ?? '',
          designation: employee.designation ?? '',
          monthlySalary: employee.monthlySalary == null ? '' : String(employee.monthlySalary),
          aadhaarNumber: employee.aadhaarNumber ?? '',
          dlNumber: employee.dlNumber ?? '',
          bankName: employee.bankName ?? '',
          accountHolderName: employee.accountHolderName ?? '',
          accountNumber: employee.accountNumber ?? '',
          ifscCode: employee.ifscCode ?? '',
          isDriver: employee.isDriver ?? false,
          isActive: employee.isActive ?? true,
        })
      })
      .catch((error: unknown) => {
        if (active) setLoadError(getApiErrorMessage(error))
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  const handleTextChange = (field: EmployeeTextField, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: field === 'ifscCode' ? value.toUpperCase() : value,
    }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const salary = Number(form.monthlySalary)
    const payload = {
      employeeName: form.employeeName.trim(),
      mobileNumber: form.mobileNumber.trim(),
      designation: form.designation.trim(),
      monthlySalary: salary,
      aadhaarNumber: optionalValue(form.aadhaarNumber),
      dlNumber: optionalValue(form.dlNumber),
      bankName: optionalValue(form.bankName),
      accountHolderName: optionalValue(form.accountHolderName),
      accountNumber: optionalValue(form.accountNumber),
      ifscCode: optionalValue(form.ifscCode)?.toUpperCase() ?? null,
      isDriver: form.isDriver,
      isActive: form.isActive,
    }

    if (!payload.employeeName || !payload.mobileNumber || !payload.designation || !form.monthlySalary.trim()) {
      toast({
        title: 'Required fields missing',
        description: 'Enter the employee name, mobile number, designation, and monthly salary.',
        variant: 'error',
      })
      return
    }

    if (!Number.isFinite(salary) || salary < 0) {
      toast({
        title: 'Invalid monthly salary',
        description: 'Enter a valid salary of zero or more.',
        variant: 'error',
      })
      return
    }

    if (!/^\+?[0-9]{10,13}$/.test(payload.mobileNumber)) {
      toast({
        title: 'Invalid mobile number',
        description: 'Use 10 to 13 digits with an optional leading +.',
        variant: 'error',
      })
      return
    }

    if (payload.aadhaarNumber && !/^[2-9][0-9]{11}$/.test(payload.aadhaarNumber)) {
      toast({
        title: 'Invalid Aadhaar number',
        description: 'Enter a valid 12-digit Aadhaar number beginning with 2 to 9.',
        variant: 'error',
      })
      return
    }

    if (payload.accountNumber && !/^[0-9]{9,18}$/.test(payload.accountNumber)) {
      toast({
        title: 'Invalid account number',
        description: 'Enter an account number containing 9 to 18 digits.',
        variant: 'error',
      })
      return
    }

    if (payload.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(payload.ifscCode)) {
      toast({
        title: 'Invalid IFSC code',
        description: 'Enter an 11-character IFSC code.',
        variant: 'error',
      })
      return
    }

    if (payload.isDriver && !payload.dlNumber) {
      toast({
        title: 'Driving licence required',
        description: 'Enter a driving licence number for an employee marked as a driver.',
        variant: 'error',
      })
      return
    }

    try {
      setIsSubmitting(true)
      if (id) {
        await apiClient.put(`/employees/${id}`, payload)
      } else {
        await apiClient.post('/employees', payload)
      }
      toast({
        title: id ? 'Employee updated' : 'Employee created',
        description: id ? 'Employee details have been saved.' : 'The employee has been added successfully.',
        variant: 'success',
      })
      navigate('/masters/employee-list')
    } catch (submitError) {
      toast({
        title: id ? 'Update failed' : 'Create failed',
        description: getApiErrorMessage(submitError),
        variant: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader title={id ? 'Edit Employee' : 'Add New Employee'} />
      <Card className="overflow-hidden border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {id ? 'Edit Employee Details' : 'Employee Form'}
          </h2>
          <Button type="button" variant="primary" size="sm" onClick={() => navigate('/masters/employee-list')}>
            Employee List
          </Button>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-[var(--color-muted-foreground)]">Loading employee details…</div>
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3 p-6">
            <p role="alert" className="text-sm text-[var(--color-danger)]">
              {loadError}
            </p>
            <Button type="button" variant="outline" onClick={() => navigate('/masters/employee-list')}>
              Back to Employee List
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-2 text-sm text-[var(--color-foreground)] md:col-span-2">
                <span className="flex items-center gap-1 font-medium">
                  Employee Name <span className="text-[var(--color-danger)]">*</span>
                </span>
                <Input
                  required
                  maxLength={255}
                  value={form.employeeName}
                  onChange={(event) => handleTextChange('employeeName', event.target.value)}
                  placeholder="Employee Name"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="flex items-center gap-1 font-medium">
                  Mobile Number <span className="text-[var(--color-danger)]">*</span>
                </span>
                <Input
                  required
                  maxLength={15}
                  inputMode="tel"
                  value={form.mobileNumber}
                  onChange={(event) => handleTextChange('mobileNumber', event.target.value)}
                  placeholder="Mobile Number"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="flex items-center gap-1 font-medium">
                  Designation <span className="text-[var(--color-danger)]">*</span>
                </span>
                <Input
                  required
                  maxLength={100}
                  value={form.designation}
                  onChange={(event) => handleTextChange('designation', event.target.value)}
                  placeholder="Designation"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="flex items-center gap-1 font-medium">
                  Monthly Salary <span className="text-[var(--color-danger)]">*</span>
                </span>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monthlySalary}
                  onChange={(event) => handleTextChange('monthlySalary', event.target.value)}
                  placeholder="Monthly Salary"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="font-medium">Aadhaar No.</span>
                <Input
                  maxLength={12}
                  inputMode="numeric"
                  value={form.aadhaarNumber}
                  onChange={(event) => handleTextChange('aadhaarNumber', event.target.value)}
                  placeholder="Enter Aadhaar No."
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)] md:col-span-2">
                <span className="font-medium">Driving Licence (DL) No.</span>
                <Input
                  maxLength={20}
                  value={form.dlNumber}
                  onChange={(event) => handleTextChange('dlNumber', event.target.value)}
                  placeholder="Enter DL No."
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="font-medium">Bank Name</span>
                <Input
                  maxLength={150}
                  value={form.bankName}
                  onChange={(event) => handleTextChange('bankName', event.target.value)}
                  placeholder="Enter Bank Name"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="font-medium">Account Holder Name</span>
                <Input
                  maxLength={255}
                  value={form.accountHolderName}
                  onChange={(event) => handleTextChange('accountHolderName', event.target.value)}
                  placeholder="Enter Account Holder Name"
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="font-medium">Account No.</span>
                <Input
                  maxLength={18}
                  inputMode="numeric"
                  value={form.accountNumber}
                  onChange={(event) => handleTextChange('accountNumber', event.target.value)}
                  placeholder="Enter Account No."
                />
              </label>

              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="font-medium">IFSC</span>
                <Input
                  maxLength={11}
                  value={form.ifscCode}
                  onChange={(event) => handleTextChange('ifscCode', event.target.value)}
                  placeholder="Enter IFSC"
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-2 text-sm text-[var(--color-foreground)]">
                <span className="font-medium">Status</span>
                <select
                  value={form.isActive ? 'active' : 'inactive'}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, isActive: event.target.value === 'active' }))
                  }
                  className="flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-foreground)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none"
                >
                  <option value="active">Enable</option>
                  <option value="inactive">Disable</option>
                </select>
              </label>

              <label className="flex items-center gap-3 self-end pb-2 text-sm font-medium text-[var(--color-foreground)]">
                <input
                  type="checkbox"
                  checked={form.isDriver}
                  onChange={(event) => setForm((current) => ({ ...current, isDriver: event.target.checked }))}
                  className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-primary)]"
                />
                Is Driver
              </label>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              loading={isSubmitting}
              className="mx-auto w-full max-w-[480px] rounded-md bg-[#1fbf5a] text-white hover:opacity-90"
            >
              {id ? 'Save Changes' : 'Add Employee Details'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
