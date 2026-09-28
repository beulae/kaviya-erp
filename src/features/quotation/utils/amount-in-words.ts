const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
]
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function belowThousand(n: number): string {
  const parts: string[] = []
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`)
    n %= 100
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : ''))
  } else if (n > 0) {
    parts.push(ONES[n])
  }
  return parts.join(' ')
}

function integerToWords(n: number): string {
  if (n === 0) return 'Zero'
  const units: [number, string][] = [
    [10_000_000, 'Crore'],
    [100_000, 'Lakh'],
    [1_000, 'Thousand'],
  ]
  const parts: string[] = []
  for (const [size, label] of units) {
    if (n >= size) {
      parts.push(`${integerToWords(Math.floor(n / size))} ${label}`)
      n %= size
    }
  }
  if (n > 0) parts.push(belowThousand(n))
  return parts.join(' ')
}

/**
 * Converts an amount to words using the Indian numbering system
 * (thousand / lakh / crore), e.g. 125050.5 →
 * "Rupees One Lakh Twenty Five Thousand Fifty And Fifty Paise Only".
 * Returns an empty string for zero / invalid amounts so callers can leave the
 * "Amount in words" line blank, matching the legacy PDF.
 */
export function amountInWords(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return ''
  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)
  const rupeeText = rupees > 0 ? `Rupees ${integerToWords(rupees)}` : ''
  const paiseText = paise > 0 ? `${integerToWords(paise)} Paise` : ''
  const joined = [rupeeText, paiseText].filter(Boolean).join(' And ')
  return `${joined} Only`
}
