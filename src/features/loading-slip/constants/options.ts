import type { SelectOption } from '@/components/ui/select'

const opts = (values: string[]): SelectOption[] => values.map((v) => ({ label: v, value: v }))

export const VEHICLE_TYPES: SelectOption[] = opts(['Market Vehicle', 'Own Vehicle', 'Attached Vehicle'])

export const WEIGHT_UNITS: SelectOption[] = [
  { label: 'Metric Ton (MT)', value: 'MT' },
  { label: 'Quintal (QT)', value: 'QT' },
  { label: 'Kilogram (KG)', value: 'KG' },
]

/** Indian financial years (Apr–Mar): the current one plus two either side, e.g. "2026-27". */
export function getFinancialYearOptions(today = new Date()): SelectOption[] {
  const startYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1
  return [-2, -1, 0, 1].map((offset) => {
    const year = startYear + offset
    const label = `${year}-${String((year + 1) % 100).padStart(2, '0')}`
    return { label, value: label }
  })
}

export function getCurrentFinancialYear(today = new Date()): string {
  const startYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`
}
