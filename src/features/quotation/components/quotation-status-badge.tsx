import { Badge } from '@/components/ui/badge'
import type { QuotationStatus } from '@/types/quotation'

const STATUS_VARIANT: Record<QuotationStatus, 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'accent'> = {
  accepted: 'success',
  sent: 'info',
  draft: 'neutral',
  rejected: 'danger',
  expired: 'warning',
  converted: 'accent',
}

const STATUS_LABEL: Record<QuotationStatus, string> = {
  accepted: 'Accepted',
  sent: 'Sent',
  draft: 'Draft',
  rejected: 'Rejected',
  expired: 'Expired',
  converted: 'Converted',
}

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
}
