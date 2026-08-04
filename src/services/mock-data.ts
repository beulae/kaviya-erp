import type { Bilty } from '@/types/bilty'
import type { Quotation } from '@/types/quotation'

const CITIES = ['Chennai', 'Bengaluru', 'Coimbatore', 'Hyderabad', 'Mumbai', 'Madurai', 'Salem', 'Trichy']
const STATUSES_BILTY: Bilty['status'][] = ['draft', 'pending', 'in_transit', 'delivered', 'cancelled']
const STATUSES_QUOTE: Quotation['status'][] = ['draft', 'sent', 'accepted', 'rejected', 'expired', 'converted']

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

export const MOCK_BILTIES: Bilty[] = Array.from({ length: 42 }).map((_, i) => ({
  id: `bilty-${i + 1}`,
  biltyNumber: `KRW-B${(1000 + i).toString()}`,
  date: new Date(Date.now() - i * 36e5 * 7).toISOString(),
  consignorName: `${pick(['Sri Vinayaga Traders', 'AVM Textiles', 'Sun Agro Foods', 'Coastal Steels'], i)}`,
  consigneeName: `${pick(['Kavin Enterprises', 'Metro Distributors', 'Green Valley Mart', 'Prime Retail Co'], i + 1)}`,
  fromCity: pick(CITIES, i),
  toCity: pick(CITIES, i + 3),
  vehicleNumber: `TN ${10 + (i % 9)} AB ${1000 + i}`,
  driverName: pick(['Murugan S', 'Raja P', 'Suresh K', 'Vignesh R', 'Anbu M'], i),
  goodsDescription: pick(['Textiles', 'Steel rods', 'Rice bags', 'Electronics', 'FMCG cartons'], i + 2),
  weightKg: 500 + (i % 12) * 350,
  freightAmount: 4500 + (i % 15) * 1250,
  status: pick(STATUSES_BILTY, i),
}))

export const MOCK_QUOTATIONS: Quotation[] = Array.from({ length: 24 }).map((_, i) => {
  const rate = 8000 + (i % 10) * 950
  const discount = i % 5 === 0 ? 500 : 0
  const gstPercent = 5
  const total = Math.round(rate * (1 + gstPercent / 100) - discount)
  return {
    id: `quote-${i + 1}`,
    quotationNumber: `KRW-Q${(2000 + i).toString()}`,
    date: new Date(Date.now() - i * 36e5 * 11).toISOString(),
    customerName: pick(
      ['Sri Vinayaga Traders', 'AVM Textiles', 'Sun Agro Foods', 'Coastal Steels', 'Metro Distributors'],
      i,
    ),
    vehicleType: pick(['Open Body 14ft', 'Container 20ft', 'Container 32ft', 'Mini Truck', 'Trailer 40ft'], i),
    pickup: pick(CITIES, i),
    destination: pick(CITIES, i + 2),
    weightKg: 800 + (i % 10) * 400,
    rate,
    gstPercent,
    discount,
    total,
    validity: new Date(Date.now() + (7 - (i % 7)) * 864e5).toISOString(),
    status: pick(STATUSES_QUOTE, i),
  }
})
