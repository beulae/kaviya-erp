import type { TransporterProfile } from '@/types/profile'

// NOTE: This service currently simulates network latency against an
// in-memory mock record so the UI is fully functional standalone. Swap the
// body of each function for an `apiClient` call (see src/api/axios-instance.ts)
// once the REST backend is available — the function signatures (and the
// multipart payload shape from `buildProfileFormData`) are designed to match.

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let MOCK_PROFILE: TransporterProfile = {
  id: 'transporter-1',
  transporterName: 'Kaviya Roadways and Logistics Services',
  aboutTransport: 'Transport Contractor / Commission Agent / Broker',
  riskType: 'owner',
  userType: 'fleetOwner',
  registrationNumber: 'REG-TN-88231',
  gstNumber: '33AAAAA0000A1Z5',
  dailyService: ['All Over India', 'Tamil Nadu', 'Karnataka'],
  city: 'Chennai',
  state: 'Tamil Nadu',
  address: 'No. 123, GST Road, Guindy, Chennai, Tamil Nadu - 600032',
  contactNo1: '9876543210',
  contactNo2: '9876500000',
  contactNo3: '',
  email: 'info@kaviyaroadways.com',
  officeBranch: 'Chennai',
  website: 'https://www.kaviyaroadways.com',
  bankAccountNumber: '00123456789012',
  bankName: 'State Bank of India',
  ifscCode: 'SBIN0001234',
  accountHolderName: 'Kaviya Roadways and Logistics Services',
  panNumber: 'AAAAA0000A',
  panCardName: 'Kaviya Roadways and Logistics Services',
  logoUrl: undefined,
  signatureMethod: 'pad',
  signatureUrl: undefined,
  updatedAt: new Date().toISOString(),
}

export async function fetchTransporterProfile(): Promise<TransporterProfile> {
  await delay(400)
  return { ...MOCK_PROFILE }
}

export async function updateTransporterProfile(payload: FormData): Promise<TransporterProfile> {
  await delay(600)

  const str = (key: string) => {
    const v = payload.get(key)
    return typeof v === 'string' && v.length > 0 ? v : undefined
  }

  const next: TransporterProfile = {
    ...MOCK_PROFILE,
    transporterName: str('transporterName') ?? MOCK_PROFILE.transporterName,
    aboutTransport: str('aboutTransport'),
    riskType: (str('riskType') as TransporterProfile['riskType']) ?? MOCK_PROFILE.riskType,
    userType: (str('userType') as TransporterProfile['userType']) ?? MOCK_PROFILE.userType,
    registrationNumber: str('registrationNumber'),
    gstNumber: str('gstNumber'),
    dailyService: payload.getAll('dailyService').map(String),
    city: str('city') ?? MOCK_PROFILE.city,
    state: str('state') ?? MOCK_PROFILE.state,
    address: str('address') ?? MOCK_PROFILE.address,
    contactNo1: str('contactNo1') ?? MOCK_PROFILE.contactNo1,
    contactNo2: str('contactNo2'),
    contactNo3: str('contactNo3'),
    email: str('email') ?? MOCK_PROFILE.email,
    officeBranch: str('officeBranch'),
    website: str('website'),
    bankAccountNumber: str('bankAccountNumber'),
    bankName: str('bankName'),
    ifscCode: str('ifscCode'),
    accountHolderName: str('accountHolderName'),
    panNumber: str('panNumber'),
    panCardName: str('panCardName'),
    signatureMethod: (str('signatureMethod') as TransporterProfile['signatureMethod']) ?? MOCK_PROFILE.signatureMethod,
  }

  const logoFile = payload.get('logoFile')
  if (logoFile instanceof File) {
    next.logoUrl = URL.createObjectURL(logoFile)
  } else if (str('removeLogo') === 'true') {
    next.logoUrl = undefined
  }

  const signatureFile = payload.get('signatureFile')
  if (signatureFile instanceof File) {
    next.signatureUrl = URL.createObjectURL(signatureFile)
  } else if (str('signaturePad')) {
    next.signatureUrl = str('signaturePad')
  }

  next.updatedAt = new Date().toISOString()
  MOCK_PROFILE = next
  return { ...MOCK_PROFILE }
}

export async function deleteTransporterLogo(): Promise<TransporterProfile> {
  await delay(350)
  MOCK_PROFILE = { ...MOCK_PROFILE, logoUrl: undefined, updatedAt: new Date().toISOString() }
  return { ...MOCK_PROFILE }
}
