import type { SelectOption } from '@/components/ui/select'

const opts = (values: string[]): SelectOption[] => values.map((v) => ({ label: v, value: v }))

export const WEIGHT_UNITS: SelectOption[] = opts(['MT', 'QT', 'KG', 'Fixed'])
export const GUARANTEE_WEIGHT_UNITS: SelectOption[] = opts(['MT', 'QT', 'KG'])

export const LOAD_TYPES: SelectOption[] = opts(['Full Load', 'Part Load'])
export const TRIP_TYPES: SelectOption[] = [
  { label: 'Oneway Trip', value: 'Oneway' },
  { label: 'Round Trip', value: 'Round' },
]

// No vehicle master API/hook exists in the project yet — mirrors the static
// list already used by the legacy CreateQuotationPage and the Vehicles page.
export const VEHICLE_TYPES: SelectOption[] = opts([
  'Open Body 14ft',
  'Container 20ft',
  'Container 32ft',
  'Mini Truck',
  'Trailer 40ft',
])

export const RATE_TYPES: SelectOption[] = opts(['Per MT', 'Per QT', 'Per KG', 'Fixed'])

export const OVERSIZE_OPTIONS: SelectOption[] = [
  { label: 'No', value: '0' },
  { label: 'Yes', value: '1' },
]

export const OVERSIZE_SIDE_OPTIONS: SelectOption[] = [
  { label: 'Driver Side', value: 'driver' },
  { label: 'Driver Opposite Side', value: 'driver opposite' },
  { label: 'Conductor Side', value: 'conductor' },
  { label: 'Height Side', value: 'height' },
  { label: 'All Side', value: 'all' },
]

export const GST_PERCENT_OPTIONS: SelectOption[] = [
  { label: '5%', value: '5' },
  { label: '12%', value: '12' },
  { label: '18%', value: '18' },
  { label: '28%', value: '28' },
]

export const PAID_BY_OPTIONS: SelectOption[] = opts(['Consignor', 'Consignee'])

export const ADVANCE_TYPE_OPTIONS: SelectOption[] = opts(['10%', '20%', '30%', '40%', '50%', 'Fixed'])

export const PAYMENT_CYCLE_OPTIONS: SelectOption[] = [
  { label: '1 Day', value: '1' },
  { label: '2 Days', value: '2' },
  { label: '3 Days', value: '3' },
  { label: '7 Days', value: '7' },
  { label: '15 Days', value: '15' },
  { label: '30 Days', value: '30' },
  { label: '45 Days', value: '45' },
  { label: '60 Days', value: '60' },
  { label: '75 Days', value: '75' },
  { label: '90 Days', value: '90' },
  { label: '180 Days', value: '180' },
]

export const DEMURRAGE_CHARGE_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Per Hour', value: '1' },
  { label: 'Per Day', value: '2' },
]

export const DEMURRAGE_APPLICABLE_AFTER_OPTIONS: SelectOption[] = opts([
  '1 Hour',
  '2 Hours',
  '4 Hours',
  '8 Hours',
  '12 Hours',
  '1 Day',
  '2 Days',
  '3 Days',
  '4 Days',
  'More than 5 Days',
])

// Local city/state suggestion data used for the From/To/Company autocomplete
// fields. The legacy system sourced these from a location master API; no such
// hook exists yet in this project, so we fall back to a static in-memory list
// via the reusable `AutocompleteInput` abstraction rather than embedding a
// hard-coded external URL in a component.
export const CITY_STATE_SUGGESTIONS: string[] = [
  'Chennai, Tamil Nadu',
  'Coimbatore, Tamil Nadu',
  'Madurai, Tamil Nadu',
  'Trichy, Tamil Nadu',
  'Salem, Tamil Nadu',
  'Bengaluru, Karnataka',
  'Mysuru, Karnataka',
  'Hyderabad, Telangana',
  'Vijayawada, Andhra Pradesh',
  'Mumbai, Maharashtra',
  'Pune, Maharashtra',
  'Delhi, Delhi',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat',
  'Kochi, Kerala',
]

export const COMPANY_NAME_SUGGESTIONS: string[] = [
  'Sri Vinayaga Traders',
  'AVM Textiles',
  'Sun Agro Foods',
  'Coastal Steels',
  'Metro Distributors',
  'Green Valley Mart',
  'Prime Retail Co',
]

export const MAX_ARTICLES = 5
export const MAX_FROM_ADDRESSES = 5
export const MAX_TO_ADDRESSES = 5
