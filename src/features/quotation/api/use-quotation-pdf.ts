import * as React from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/toaster'
import { fetchTransporterProfile } from '@/features/profile/api/profile-service'
import { profileKeys } from '@/features/profile/api/use-profile'
import type { Quotation } from '@/types/quotation'
import { fetchQuotationById } from './quotation-service'
import { quotationKeys } from './use-quotation'

/**
 * Downloads a quotation as a PDF receipt. Resolves the full quotation (the
 * list rows may only carry a summary) and the transporter profile through the
 * query cache, then loads the PDF generator on demand.
 */
export function useDownloadQuotationPdf() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [downloadingId, setDownloadingId] = React.useState<string | number | null>(null)

  const download = React.useCallback(
    async (id: string | number, summary?: Quotation) => {
      setDownloadingId(id)
      try {
        const [quotation, profile, pdf] = await Promise.all([
          queryClient
            .fetchQuery({ queryKey: quotationKeys.detail(id), queryFn: () => fetchQuotationById(id) })
            .then((full) => full ?? summary),
          queryClient.fetchQuery({ queryKey: profileKeys.all, queryFn: fetchTransporterProfile }),
          import('../utils/quotation-pdf'),
        ])

        if (!quotation) throw new Error('Quotation not found')
        pdf.saveBlob(await pdf.createQuotationPdf(quotation, profile))
      } catch {
        toast({
          title: 'Download failed',
          description: 'The quotation PDF could not be generated. Please try again.',
          variant: 'error',
        })
      } finally {
        setDownloadingId(null)
      }
    },
    [queryClient, toast],
  )

  return { download, downloadingId }
}
