import { useParams, useNavigate } from 'react-router-dom'
import { Pencil, Printer, ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { BiltyStatusBadge } from '../components/bilty-status-badge'
import { useBilty } from '../api/use-bilty'
import { formatCurrency, formatDate } from '@/utils/format'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-[var(--color-border)] py-2.5 last:border-0">
      <span className="text-sm text-[var(--color-muted-foreground)]">{label}</span>
      <span className="text-sm font-medium text-[var(--color-foreground)]">{value}</span>
    </div>
  )
}

export default function ViewBiltyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: bilty, isLoading } = useBilty(id!)

  return (
    <div>
      <PageHeader
        title={bilty ? `Bilty ${bilty.biltyNumber}` : 'Bilty details'}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/bilty')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4" /> Print
            </Button>
            {bilty && (
              <Button size="sm" onClick={() => navigate(`/bilty/${bilty.id}/edit`)}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
            )}
          </>
        }
      />

      {isLoading || !bilty ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Consignment details</CardTitle>
              <BiltyStatusBadge status={bilty.status} />
            </CardHeader>
            <CardContent>
              <DetailRow label="Bilty date" value={formatDate(bilty.date)} />
              <DetailRow label="Consignor" value={bilty.consignorName} />
              <DetailRow label="Consignee" value={bilty.consigneeName} />
              <DetailRow label="Route" value={`${bilty.fromCity} → ${bilty.toCity}`} />
              <DetailRow label="Goods description" value={bilty.goodsDescription} />
              <DetailRow label="Weight" value={`${bilty.weightKg.toLocaleString('en-IN')} kg`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle & charges</CardTitle>
            </CardHeader>
            <CardContent>
              <DetailRow label="Vehicle no." value={bilty.vehicleNumber} />
              <DetailRow label="Driver" value={bilty.driverName} />
              <DetailRow label="Freight amount" value={formatCurrency(bilty.freightAmount)} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
