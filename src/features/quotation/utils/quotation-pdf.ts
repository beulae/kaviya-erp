import type { Quotation } from '@/types/quotation'
import type { TransporterProfile } from '@/types/profile'
import { buildQuotationReceiptData } from './quotation-receipt-data'
import { quotationPdfFileName, renderQuotationPdf, type PdfImage } from './quotation-pdf-renderer'

/**
 * Browser-side glue around the pure PDF renderer: decodes the transporter's
 * logo / signature into PNG data URLs and turns the document into a Blob.
 * Import this module lazily (`await import(...)`) so jsPDF stays out of the
 * main bundle until someone actually views or downloads a quotation.
 */

const DEFAULT_LOGO_URL = `${import.meta.env.BASE_URL}logo.png`

/** Decodes any browser-supported image (png/jpeg/webp, blob:, data:, same-origin) to a PNG. */
async function loadPdfImage(url?: string): Promise<PdfImage | undefined> {
  if (!url) return undefined
  try {
    const response = await fetch(url)
    if (!response.ok) return undefined
    const bitmap = await createImageBitmap(await response.blob())
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const context = canvas.getContext('2d')
    if (!context) return undefined
    context.drawImage(bitmap, 0, 0)
    bitmap.close()
    return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height }
  } catch {
    // A missing/unreadable logo or signature must never block the quotation itself.
    return undefined
  }
}

export interface QuotationPdfFile {
  blob: Blob
  fileName: string
}

export async function createQuotationPdf(quotation: Quotation, profile: TransporterProfile): Promise<QuotationPdfFile> {
  const [logo, signature] = await Promise.all([
    loadPdfImage(profile.logoUrl).then((image) => image ?? loadPdfImage(DEFAULT_LOGO_URL)),
    loadPdfImage(profile.signatureUrl),
  ])

  const data = buildQuotationReceiptData(quotation, profile)
  const doc = renderQuotationPdf(data, { logo, signature })
  return { blob: doc.output('blob'), fileName: quotationPdfFileName(data) }
}

/** Triggers a browser download for the given file. */
export function saveBlob({ blob, fileName }: QuotationPdfFile): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Give the browser a moment to start the download before releasing the blob.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
