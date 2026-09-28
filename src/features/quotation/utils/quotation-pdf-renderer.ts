import { jsPDF } from 'jspdf'
import type { QuotationReceiptData } from './quotation-receipt-data'

/** A raster image already decoded to a data URL (PNG/JPEG) with its natural size. */
export interface PdfImage {
  dataUrl: string
  width: number
  height: number
}

export interface QuotationPdfAssets {
  logo?: PdfImage
  signature?: PdfImage
}

// --- Palette (sampled from the legacy TCPDF quotation) -------------------------------
const PINK = '#f25767'
const LAVENDER = '#dedff8'
const BLUE = '#121abd'
const BLACK = '#000000'

// --- Page geometry (pt, A4) -----------------------------------------------------------
const PAGE_W = 595.28
const PAGE_H = 841.89
const BAND_L = 14.4
const BAND_R = 581.6
const TEXT_L = 18.3
const TEXT_R = 573
const BOX_L = 23.6
const BOX_R = 572
const BOX_W = BOX_R - BOX_L

/** jsPDF's built-in fonts are WinAnsi only — swap anything else for a safe glyph. */
const safe = (value: string) =>
  value
    .replace(/\u20B9/g, 'Rs.')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '?')

/** See Pen.width — viewers render standard Helvetica slightly wider than jsPDF measures it. */
const TEXT_METRIC_SLACK = 1.025

type Align = 'left' | 'center' | 'right'

class Pen {
  private readonly doc: jsPDF

  constructor(doc: jsPDF) {
    this.doc = doc
  }

  font(size: number, bold = false, color: string = BLACK) {
    this.doc.setFont('helvetica', bold ? 'bold' : 'normal')
    this.doc.setFontSize(size)
    this.doc.setTextColor(color)
  }

  /**
   * Width in pt. jsPDF's built-in Helvetica table measures ~2-3% narrower than
   * the metrics PDF viewers use to draw the same text, so anything positioned
   * *after* a measured string (label -> value) is padded by TEXT_METRIC_SLACK.
   */
  width(text: string) {
    return this.doc.getTextWidth(safe(text)) * TEXT_METRIC_SLACK
  }

  /** Draws a single line of text vertically centred on `y`. */
  text(text: string, x: number, y: number, align: Align = 'left') {
    if (!text) return
    this.doc.text(safe(text), x, y, { align, baseline: 'middle' })
  }

  wrap(text: string, maxWidth: number): string[] {
    return this.doc.splitTextToSize(safe(text), maxWidth) as string[]
  }

  /** Truncates to `maxLines`, ending the last kept line with an ellipsis. */
  wrapClamped(text: string, maxWidth: number, maxLines: number): string[] {
    const lines = this.wrap(text, maxWidth)
    if (lines.length <= maxLines) return lines
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, '')}...`
    return kept
  }

  rect(x: number, y: number, w: number, h: number, opts: { fill?: string; stroke?: boolean; lineWidth?: number } = {}) {
    const { fill, stroke = true, lineWidth = 0.7 } = opts
    this.doc.setLineWidth(lineWidth)
    this.doc.setDrawColor(BLACK)
    if (fill) this.doc.setFillColor(fill)
    this.doc.rect(x, y, w, h, fill && stroke ? 'FD' : fill ? 'F' : 'S')
  }

  line(x1: number, y1: number, x2: number, y2: number, lineWidth = 0.7) {
    this.doc.setLineWidth(lineWidth)
    this.doc.setDrawColor(BLACK)
    this.doc.line(x1, y1, x2, y2)
  }

  image(image: PdfImage, x: number, y: number, boxW: number, boxH: number, align: 'left' | 'center' = 'left') {
    const scale = Math.min(boxW / image.width, boxH / image.height)
    const w = image.width * scale
    const h = image.height * scale
    const dx = align === 'center' ? (boxW - w) / 2 : 0
    this.doc.addImage(image.dataUrl, 'PNG', x + dx, y + (boxH - h) / 2, w, h, undefined, 'FAST')
  }
}

/** Company name: as large as fits in at most two lines, centred. */
function drawTransporterName(pen: Pen, name: string, centerX: number, top: number) {
  const maxWidth = 300
  let size = 26
  pen.font(size, true, PINK)
  let lines = pen.wrap(name, maxWidth)
  while ((lines.length > 2 || lines.some((l) => pen.width(l) > maxWidth)) && size > 12) {
    size -= 1
    pen.font(size, true, PINK)
    lines = pen.wrap(name, maxWidth)
  }
  lines = lines.slice(0, 2)
  const pitch = size * 0.77
  // Anchor the block so one- and two-line names both sit in the header band.
  const blockCenter = top + 18
  const startY = blockCenter - ((lines.length - 1) * pitch) / 2
  lines.forEach((line, i) => pen.text(line, centerX, startY + i * pitch, 'center'))
}

/** Gap between a label and its value. */
const LABEL_GAP = 3.2

/** A row of `[text, colour]` segments centred as one line, separated by LABEL_GAP. */
function drawColouredLine(pen: Pen, segments: [string, string][], centerX: number, y: number, size: number) {
  if (segments.length === 0) return
  pen.font(size, false)
  const widths = segments.map(([text]) => pen.width(text))
  const total = widths.reduce((a, b) => a + b, 0) + LABEL_GAP * (segments.length - 1)
  let x = centerX - total / 2
  segments.forEach(([text, color], i) => {
    pen.font(size, false, color)
    pen.text(text, x, y)
    x += widths[i] + LABEL_GAP
  })
}

/** Blue label + black value pairs; empty values are dropped and commas only separate the ones that remain. */
function headerSegments(items: [label: string, value: string][]): [string, string][] {
  const present = items.filter(([, value]) => value)
  return present.flatMap(([label, value], i): [string, string][] => [
    [label, BLUE],
    [i < present.length - 1 ? `${value},` : value, BLACK],
  ])
}

function drawHeader(pen: Pen, data: QuotationReceiptData, assets: QuotationPdfAssets) {
  const t = data.transporter
  pen.font(9, true)
  pen.text('QUOTATION', PAGE_W / 2, 13, 'center')

  if (assets.logo) pen.image(assets.logo, BAND_L, 24.5, 86, 70)

  drawTransporterName(pen, t.name, PAGE_W / 2, 30)

  pen.font(8, false)
  pen.text(t.address, PAGE_W / 2, 80, 'center')

  drawColouredLine(
    pen,
    headerSegments([
      ['Transport Reg. No. :', t.transportRegNo],
      ['Email id :', t.email],
    ]),
    PAGE_W / 2,
    89.5,
    10.4,
  )
  drawColouredLine(
    pen,
    headerSegments([
      ['GSTIN No. :', t.gstin],
      ['Mobile No :', t.mobile],
    ]),
    PAGE_W / 2,
    99.5,
    10.4,
  )

  // Quotation number / date band
  pen.rect(BAND_L, 112.6, BAND_R - BAND_L, 16.4, { fill: LAVENDER, stroke: false })
  pen.font(10.4, true)
  pen.text(`QUOTATION NO.: ${data.quotationNo}`, TEXT_L, 120.8)
  pen.text(`DATE : ${data.date}`, TEXT_R, 120.8, 'right')
}

/** Returns the y just below the customer + salutation block. */
function drawCustomerBlock(pen: Pen, data: QuotationReceiptData): number {
  const c = data.customer
  const valueX = 108.7
  const rows: [string, string][] = [
    ['COMPANY NAME :', c.name],
    ['GSTIN :', c.gstin],
    ['CONTACT NO. :', c.contactNo],
  ]
  rows.forEach(([label, value], i) => {
    const y = 136.2 + i * 14.4
    pen.font(8.9, false)
    pen.text(label, TEXT_L, y)
    pen.font(8.9, true)
    pen.text(value, valueX, y)
  })

  const addressY = 136.2 + 3 * 14.4
  pen.font(8.9, false)
  pen.text('ADDRESS :', TEXT_L, addressY)
  pen.font(8.9, true)
  pen.wrapClamped(c.address, TEXT_R - valueX, 2).forEach((line, i) => pen.text(line, valueX, addressY + i * 10))

  pen.font(8.8, true, PINK)
  pen.text('DEAR SIR / MADAM,', TEXT_L, 209)
  const lines = pen.wrapClamped(data.enquiryLine, TEXT_R - TEXT_L, 3)
  lines.forEach((line, i) => pen.text(line, TEXT_L, 223.4 + i * 14.3))

  const ruleY = 223.4 + (lines.length - 1) * 14.3 + 7.5
  pen.line(TEXT_L, ruleY, TEXT_R, ruleY, 0.6)
  return ruleY
}

/** Draws a table header cell (lavender, black border, bold centred lines). */
function headerCell(pen: Pen, x: number, y: number, w: number, h: number, lines: string[], size = 9) {
  pen.rect(x, y, w, h, { fill: LAVENDER })
  pen.font(size, true)
  const pitch = size + 1.5
  const startY = y + h / 2 - ((lines.length - 1) * pitch) / 2
  lines.forEach((line, i) => pen.text(line, x + w / 2, startY + i * pitch, 'center'))
}

function drawMaterialTable(pen: Pen, data: QuotationReceiptData, top: number): number {
  const colW = BOX_W / 4
  const headerH = 22.4
  const bodyH = 80
  const m = data.material
  const titles = [['MATERIAL NAME'], ['PACKAGING TYPE', '(DIMENSION)'], ['ACTUAL WEIGHT'], ['NO. OF ARTICLES']]
  titles.forEach((lines, i) => headerCell(pen, BOX_L + i * colW, top, colW, headerH, lines))

  const bodyTop = top + headerH
  for (let i = 0; i < 4; i++) pen.rect(BOX_L + i * colW, bodyTop, colW, bodyH)

  pen.font(8, false)
  const cells: string[][] = [[m.name], m.packagingLines, [m.weight], m.articleLines]
  cells.forEach((lines, i) => {
    lines.slice(0, 7).forEach((line, row) => {
      const clipped = pen.wrapClamped(line, colW - 10, 1)[0] ?? ''
      pen.text(clipped, BOX_L + i * colW + colW / 2, bodyTop + 9 + row * 10, 'center')
    })
  })
  return bodyTop + bodyH
}

function drawTripTable(pen: Pen, data: QuotationReceiptData, top: number): number {
  const colW = BOX_W / 5
  const headerH = 13.8
  const t = data.trip
  const titles = ['LOAD TYPE', 'FROM - TO', 'REQUIRED TRUCKS', 'GUARANTEE WEIGHT', 'FREIGHT RATE']
  titles.forEach((title, i) => headerCell(pen, BOX_L + i * colW, top, colW, headerH, [title]))

  // FROM - TO grows with the number of addresses; everything below shifts down.
  const routeLines = [
    ...(t.fromLines.length ? t.fromLines : ['']),
    'to',
    ...(t.toLines.length ? t.toLines : ['']),
    t.tripLabel,
  ]
  const pitch = routeLines.length > 8 ? 9 : 9.6
  const bodyH = Math.max(60.4, routeLines.length * pitch + 12)
  const bodyTop = top + headerH
  for (let i = 0; i < 5; i++) pen.rect(BOX_L + i * colW, bodyTop, colW, bodyH)

  const centre = (i: number) => BOX_L + i * colW + colW / 2
  pen.font(8, false)
  pen.text(pen.wrapClamped(t.loadType, colW - 10, 1)[0] ?? '', centre(0), bodyTop + 15, 'center')
  routeLines.forEach((line, i) => {
    pen.font(8, false)
    pen.text(pen.wrapClamped(line, colW - 8, 1)[0] ?? '', centre(1), bodyTop + 15 + i * pitch, 'center')
  })
  pen.font(8, true)
  pen.text(pen.wrapClamped(t.trucks, colW - 10, 1)[0] ?? '', centre(2), bodyTop + 15, 'center')
  pen.text(t.guaranteeWeight, centre(3), bodyTop + 15, 'center')
  pen.text(pen.wrapClamped(t.freightRate, colW - 10, 1)[0] ?? '', centre(4), bodyTop + 15, 'center')
  return bodyTop + bodyH
}

function drawTermsBox(pen: Pen, data: QuotationReceiptData, top: number) {
  const x = BOX_L
  const w = 247.5
  const h = 216
  const t = data.terms
  const pitch = 16.05
  const textX = x + 4.5
  const maxW = w - 9

  pen.rect(x, top, w, h, { lineWidth: 1.3 })

  let y = top + 7.2
  const row = (label: string, value: string, bold: boolean) => {
    pen.font(8, false)
    const labelW = pen.width(label) + LABEL_GAP
    pen.text(label, textX, y)
    if (value) {
      pen.font(8, bold)
      pen.text(pen.wrapClamped(value, maxW - labelW, 1)[0] ?? '', textX + labelW, y)
    }
    y += pitch
  }

  row('VALIDITY OF THIS QUOTATION IS UPTO :', t.validUpto, false)
  row('LOADING DATE :', t.loadingDate, false)
  row('FREIGHT PAYABLE BY :', t.freightPayableBy, false)
  row('PAYMENT TERMS AS FOLLOWS :', '', false)
  row('ADVANCE :', t.advance, true)
  row('REQUIRED DRIVER CASH :', t.requiredDriverCash, true)
  row('PAYMENT CYCLE :', t.paymentCycle, true)

  // Remark may wrap onto extra lines (up to 3).
  pen.font(8, false)
  const remarkLabelW = pen.width('REMARK :') + LABEL_GAP
  pen.text('REMARK :', textX, y)
  const remarkLines = t.remark ? pen.wrapClamped(t.remark, maxW - remarkLabelW, 3) : []
  pen.font(8, false)
  remarkLines.forEach((line, i) => pen.text(line, textX + remarkLabelW, y + i * 10))
  y += pitch + Math.max(0, remarkLines.length - 1) * 10

  y += pitch // blank spacer line, as in the legacy layout
  row('SCHEDULE OF DEMURRAGE CHARGES APPLICABLE FROM', '', false)
  row('REPORTING TIME AFTER :', t.demurrageAfter, false)
  row('APPLICABLE CHARGES :', t.demurrageCharges, true)
}

/** Returns the bottom y of the particulars table. */
function drawParticulars(pen: Pen, data: QuotationReceiptData, top: number): number {
  const x = 283.5
  const w = BOX_R - x
  const amountX = 499.7
  const rowH = 16
  const headerH = 22.4

  headerCell(pen, x, top, amountX - x, headerH, ['PARTICULARS'], 11.5)
  headerCell(pen, amountX, top, BOX_R - amountX, headerH, ['AMOUNT'], 11.5)

  let y = top + headerH
  const amountCentre = amountX + (BOX_R - amountX) / 2

  const plainRow = (label: string, amount: string) => {
    pen.rect(x, y, amountX - x, rowH)
    pen.rect(amountX, y, BOX_R - amountX, rowH)
    pen.font(8, false)
    pen.text(label, x + 4, y + rowH / 2)
    pen.font(8, true)
    pen.text(amount, amountCentre, y + rowH / 2, 'center')
    y += rowH
  }
  const totalRow = (label: string, amount: string, bold: boolean) => {
    pen.rect(x, y, amountX - x, rowH)
    pen.rect(amountX, y, BOX_R - amountX, rowH)
    pen.font(8, bold)
    pen.text(label, amountX - 8, y + rowH / 2, 'right')
    pen.font(8, true)
    pen.text(amount, amountCentre, y + rowH / 2, 'center')
    y += rowH
  }

  data.charges.forEach((charge) => plainRow(charge.label, charge.amount))
  totalRow('TOTAL FREIGHT AMOUNT', data.totals.totalFreight, true)
  totalRow(data.totals.gstLabel, data.totals.gstAmount, false)
  totalRow('TOTAL FREIGHT AMOUNT WITH GST', data.totals.totalWithGst, true)

  // Amount in words spans the full width and wraps if needed.
  pen.font(8, false)
  const prefixW = pen.width('AMOUNT IN WORDS :') + LABEL_GAP
  const wordLines = data.totals.inWords ? pen.wrapClamped(data.totals.inWords, w - prefixW - 8, 3) : []
  const wordsH = Math.max(rowH, wordLines.length * 9.5 + 6.5)
  pen.rect(x, y, w, wordsH)
  pen.text('AMOUNT IN WORDS :', x + 4, y + (wordLines.length > 1 ? 8 : wordsH / 2))
  wordLines.forEach((line, i) => pen.text(line, x + 4 + prefixW, y + (wordLines.length > 1 ? 8 : wordsH / 2) + i * 9.5))
  return y + wordsH
}

function drawSignatureBlock(pen: Pen, data: QuotationReceiptData, assets: QuotationPdfAssets, top: number) {
  const h = 73.5
  const leftW = 182.4
  const midW = 183.4
  const rightX = BOX_L + leftW + midW
  const rightW = BOX_R - rightX

  pen.rect(BOX_L, top, leftW, h)
  pen.rect(BOX_L + leftW, top, midW, h, { fill: LAVENDER })
  pen.rect(rightX, top, rightW, h)

  pen.font(8, true, PINK)
  pen.text('CLIENT SATISFACTION IS OUR MOTTO', BOX_L + leftW + midW / 2, top + h / 2 - 2, 'center')

  pen.font(8, false)
  pen.line(BOX_L + 17.5, top + 50.2, BOX_L + leftW - 17.5, top + 50.2, 0.5)
  pen.text('CLIENT SIGNATURE', BOX_L + leftW / 2, top + 59.8, 'center')

  if (assets.signature) pen.image(assets.signature, rightX + 22, top + 3.5, rightW - 44, 38, 'center')
  pen.line(rightX + 17.5, top + 53.2, rightX + rightW - 17.5, top + 53.2, 0.5)
  pen.text('AUTHORIZED SIGNATORY', rightX + rightW / 2, top + 62.6, 'center')

  pen.font(6.8, false)
  const note = data.generatedAt
    ? `This electronic generated pdf does not require any physical signature. Date : ${data.generatedAt}`
    : 'This electronic generated pdf does not require any physical signature.'
  pen.text(note, PAGE_W / 2, top + h + 6, 'center')
}

/**
 * Renders the transport quotation as an A4 receipt that mirrors the legacy
 * TCPDF layout. Pure (no DOM) so it runs in the browser and in Node tests.
 */
export function renderQuotationPdf(data: QuotationReceiptData, assets: QuotationPdfAssets = {}): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  const pen = new Pen(doc)

  doc.setProperties({
    title: `Quotation ${data.quotationNo}`,
    subject: 'Transport Quotation',
    author: data.transporter.name,
    creator: 'Kaviya ERP',
  })

  drawHeader(pen, data, assets)
  const ruleY = drawCustomerBlock(pen, data)

  const materialTop = ruleY + 14.3
  const materialBottom = drawMaterialTable(pen, data, materialTop)
  const tripBottom = drawTripTable(pen, data, materialBottom + 14.8)

  const lowerTop = tripBottom + 14.4
  drawTermsBox(pen, data, lowerTop)
  const particularsBottom = drawParticulars(pen, data, lowerTop)

  const signatureTop = Math.max(lowerTop + 216, particularsBottom) + 13.5
  drawSignatureBlock(pen, data, assets, Math.min(signatureTop, PAGE_H - 90))
  return doc
}

export function quotationPdfFileName(data: QuotationReceiptData): string {
  const owner = data.transporter.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join('_')
    .replace(/[^A-Z0-9_]/gi, '')
  return `QUOTATION_${data.quotationNo.replace(/[^A-Z0-9-]/gi, '')}_${owner || 'TRANSPORT'}.pdf`
}
