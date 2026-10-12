import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, FileX2, Pencil, Printer, RotateCw } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '@/features/profile/api/use-profile'
import { useQuotation } from '../api/use-quotation'
import { useDownloadQuotationPdf } from '../api/use-quotation-pdf'
import { formatQuotationNo } from '../utils/quotation-receipt-data'

/**
 * Shows the quotation exactly as the downloadable receipt PDF — the same
 * generator feeds both this preview and the Download action, so what you view
 * is what you get.
 */
export default function ViewQuotationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: quotation, isLoading: quotationLoading } = useQuotation(id ?? '')
  const { data: profile } = useProfile()
  const { download, downloadingId } = useDownloadQuotationPdf()

  const [pdfUrl, setPdfUrl] = React.useState<string>()
  const [failed, setFailed] = React.useState(false)
  const [attempt, setAttempt] = React.useState(0)
  const frameRef = React.useRef<HTMLIFrameElement>(null)

  React.useEffect(() => {
    if (!quotation || !profile) return

    let cancelled = false
    let url: string | undefined

    import('../utils/quotation-pdf')
      .then((module) => module.createQuotationPdf(quotation, profile))
      .then(({ blob }) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setPdfUrl(url)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [quotation, profile, attempt])

  const retry = () => {
    setFailed(false)
    setAttempt((current) => current + 1)
  }

  const printPdf = () => {
    const frame = frameRef.current?.contentWindow
    if (frame) {
      try {
        frame.focus()
        frame.print()
        return
      } catch {
        // Some browsers block printing an embedded PDF viewer; fall back to a tab.
      }
    }
    if (pdfUrl) window.open(pdfUrl, '_blank')
  }

  const notFound = !quotationLoading && !quotation
  const title = quotation ? `Quotation ${formatQuotationNo(quotation)}` : 'Quotation'

  return (
    <div>
      <PageHeader
        title={title}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/quotation')}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button variant="outline" size="sm" onClick={printPdf} disabled={!pdfUrl}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/quotation/${id}/edit`)} disabled={!quotation}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button
              size="sm"
              onClick={() => id && download(id, quotation)}
              loading={downloadingId === id}
              disabled={!quotation}
            >
              <Download className="h-4 w-4" /> Download
            </Button>
          </>
        }
      />

      {notFound ? (
        <Card>
          <EmptyState
            icon={FileX2}
            title="Quotation not found"
            description="It may have been deleted."
            actionLabel="Back to quotations"
            onAction={() => navigate('/quotation')}
          />
        </Card>
      ) : failed ? (
        <Card>
          <EmptyState
            icon={RotateCw}
            title="Couldn't prepare the quotation PDF"
            description="Something went wrong while generating the receipt."
            actionLabel="Try again"
            onAction={retry}
          />
        </Card>
      ) : pdfUrl ? (
        <iframe
          ref={frameRef}
          src={`${pdfUrl}#view=FitH`}
          title={title}
          className="h-[calc(100vh-13rem)] min-h-[640px] w-full rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white"
        />
      ) : (
        <Skeleton className="h-[70vh] w-full" />
      )}
    </div>
  )
}
