import type { MultiSelectOption } from '@/components/ui/multi-select'
import type { SelectOption } from '@/components/ui/select'

const opts = (values: string[]): SelectOption[] => values.map((v) => ({ label: v, value: v }))

export const RISK_TYPE_OPTIONS: SelectOption[] = [
  { label: "At Owner's Risk", value: 'owner' },
  { label: "At Carrier's Risk", value: 'carrier' },
]

export const USER_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Fleet Owner / Transport Contractor / Commission Agent', value: 'fleetOwner' },
  { label: 'Transport Contractor / Commission Agent / Broker', value: 'broker' },
]

export const SIGNATURE_METHOD_OPTIONS: SelectOption[] = [
  { label: 'Signature Pad', value: 'pad' },
  { label: 'File Upload', value: 'upload' },
]

// No location/branch master-data API exists in the project yet, so these are
// static fallbacks — swap for a master-data hook once one is available.
export const STATE_OPTIONS: SelectOption[] = opts([
  'Tamil Nadu',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Kerala',
  'Maharashtra',
  'Gujarat',
  'Delhi',
  'West Bengal',
  'Punjab',
  'Rajasthan',
  'Uttar Pradesh',
  'Madhya Pradesh',
  'Bihar',
  'Odisha',
])

export const OFFICE_BRANCH_OPTIONS: SelectOption[] = opts([
  'Chennai',
  'Bengaluru',
  'Coimbatore',
  'Hyderabad',
  'Madurai',
])

export const DAILY_SERVICE_OPTIONS: MultiSelectOption[] = opts([
  'All Over India',
  'Tamil Nadu',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Kerala',
  'Maharashtra',
  'Gujarat',
  'Delhi NCR',
  'West Bengal',
])

export const LOGO_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
export const SIGNATURE_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']
export const MAX_UPLOAD_SIZE_BYTES = 2 * 1024 * 1024 // 2 MB
