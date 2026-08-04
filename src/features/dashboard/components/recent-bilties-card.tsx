import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/utils/format'
import { MOCK_BILTIES } from '@/services/mock-data'
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

export function RecentBiltiesCard() {
  const recent = MOCK_BILTIES.slice(0, 5)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent bookings</CardTitle>
        <Link to="/bilty" className="text-xs font-medium text-[var(--color-primary)] hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-[var(--color-muted-foreground)]">
              <th className="px-5 py-2 font-medium">Bilty No.</th>
              <th className="px-5 py-2 font-medium">Route</th>
              <th className="px-5 py-2 font-medium">Date</th>
              <th className="px-5 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((b) => (
              <tr key={b.id} className="border-t border-[var(--color-border)]">
                <td className="px-5 py-2.5 font-medium text-[var(--color-foreground)]">{b.biltyNumber}</td>
                <td className="px-5 py-2.5 text-[var(--color-muted-foreground)]">
                  {b.fromCity} → {b.toCity}
                </td>
                <td className="px-5 py-2.5 text-[var(--color-muted-foreground)]">{formatDate(b.date)}</td>
                <td className="px-5 py-2.5">
                  <Badge variant={STATUS_VARIANT[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
