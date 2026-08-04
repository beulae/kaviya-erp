import { Badge } from '@/components/ui/badge'
import type { BiltyStatus } from '@/types/bilty'

const STATUS_VARIANT: Record<BiltyStatus, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  delivered: 'success',
  in_transit: 'info',
  pending: 'warning',
  cancelled: 'danger',
  draft: 'neutral',
}

const STATUS_LABEL: Record<BiltyStatus, string> = {
  delivered: 'Delivered',
  in_transit: 'In Transit',
  pending: 'Pending',
  cancelled: 'Cancelled',
  draft: 'Draft',
}

export function BiltyStatusBadge({ status }: { status: BiltyStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}
