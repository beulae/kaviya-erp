import { apiClient } from '@/api/axios-instance'
import type {
  TransporterProfile,
  RiskType,
  SignatureMethod,
  TransporterDocument,
  TransporterDocumentType,
  TransporterUploadType,
} from '@/types/profile'

export interface DailyService {
  dailyServiceId: number | string
  serviceName: string
}

interface ApiTransporterProfile {
  id: number | string
  transporterName: string
  aboutTransport?: string | null
  riskType: string
  userType?: string | null
  registrationNumber?: string | null
  gstNumber?: string | null
  dailyServiceId?: string | null
  city?: string | null
  state?: string | null
  address?: string | null
  contactNumber1?: string | null
  contactNumber2?: string | null
  contactNumber3?: string | null
  email?: string | null
  officeBranch?: string | null
  website?: string | null
  bankName?: string | null
  accountNumber?: string | null
  ifscCode?: string | null
  panNumber?: string | null
  panCardName?: string | null
  accountHolderName?: string | null
  updatedAt?: string | null
  documents?: unknown
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('The server returned an invalid transporter profile.')
  }
  return value as Record<string, unknown>
}

function normalizeDocument(value: unknown): TransporterDocument | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined
  const record = value as Record<string, unknown>
  if (typeof record.filePath !== 'string' || typeof record.documentType !== 'string') return undefined
  if (!['LOGO', 'SIGNATURE', 'PAN', 'GST', 'OTHER'].includes(record.documentType)) return undefined
  const uploadType =
    record.uploadType === 'PAD' || record.uploadType === 'UPLOAD' ? record.uploadType : undefined
  return {
    ...(record.id !== undefined ? { id: String(record.id) } : {}),
    documentType: record.documentType as TransporterDocumentType,
    ...(uploadType ? { uploadType } : {}),
    ...(typeof record.fileName === 'string' ? { fileName: record.fileName } : {}),
    filePath: record.filePath,
    ...(typeof record.mimeType === 'string' ? { mimeType: record.mimeType } : {}),
  }
}

export function normalizeTransporterProfile(value: unknown): TransporterProfile {
  const envelope = asRecord(value)
  const record = asRecord(envelope.data ?? value) as unknown as ApiTransporterProfile
  if (record.id === undefined || typeof record.transporterName !== 'string') {
    throw new Error('The server returned an incomplete transporter profile.')
  }

  if (typeof record.riskType !== 'string') {
    throw new Error('The server returned an invalid transporter risk type.')
  }
  const normalizedRiskType = record.riskType.toUpperCase()
  if (normalizedRiskType !== 'CARRIER' && normalizedRiskType !== 'OWNER') {
    throw new Error(`Unsupported transporter risk type: ${record.riskType}`)
  }
  const riskType: RiskType = normalizedRiskType === 'CARRIER' ? 'carrier' : 'owner'

  const documents = Array.isArray(record.documents)
    ? record.documents.map(normalizeDocument).filter((doc): doc is TransporterDocument => Boolean(doc))
    : []
  const logo = documents.find((document) => document.documentType === 'LOGO')
  const signature = documents.find((document) => document.documentType === 'SIGNATURE')
  const serviceIds =
    typeof record.dailyServiceId === 'string'
      ? record.dailyServiceId
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      : []

  const profile: TransporterProfile & { documents: TransporterDocument[] } = {
    id: String(record.id),
    transporterName: record.transporterName,
    aboutTransport: record.aboutTransport ?? undefined,
    riskType,
    userType: record.userType?.toLowerCase().includes('broker') ? 'broker' : 'fleetOwner',
    registrationNumber: record.registrationNumber ?? undefined,
    gstNumber: record.gstNumber ?? undefined,
    dailyService: serviceIds,
    city: record.city ?? '',
    state: record.state ?? '',
    address: record.address ?? '',
    contactNo1: record.contactNumber1 ?? '',
    contactNo2: record.contactNumber2 ?? undefined,
    contactNo3: record.contactNumber3 ?? undefined,
    email: record.email ?? '',
    officeBranch: record.officeBranch ?? undefined,
    website: record.website ?? undefined,
    bankAccountNumber: record.accountNumber ?? undefined,
    bankName: record.bankName ?? undefined,
    ifscCode: record.ifscCode ?? undefined,
    panNumber: record.panNumber ?? undefined,
    panCardName: record.panCardName ?? undefined,
    accountHolderName: record.accountHolderName ?? undefined,
    logoUrl: logo?.filePath,
    signatureMethod: signature?.uploadType === 'UPLOAD' ? 'upload' : 'pad',
    signatureUrl: signature?.filePath,
    updatedAt: record.updatedAt ?? '',
    documents,
  }

  return profile
}

export async function fetchTransporterProfiles(): Promise<TransporterProfile[]> {
  const { data } = await apiClient.get('/transporter-profile', { params: { page: 1, pageSize: 100 } })
  const envelope = asRecord(data)
  if (!Array.isArray(envelope.data)) throw new Error('The server returned an invalid transporter profile list.')
  return envelope.data.map((profile) => normalizeTransporterProfile(profile))
}

export async function fetchTransporterProfile(): Promise<TransporterProfile | null> {
  const profiles = await fetchTransporterProfiles()
  return profiles[0] ?? null
}

export async function fetchDailyServices(): Promise<DailyService[]> {
  const { data } = await apiClient.get('/daily-services', { params: { page: 1, pageSize: 100 } })
  const envelope = asRecord(data)
  if (!Array.isArray(envelope.data)) throw new Error('The server returned an invalid daily services list.')
  return envelope.data.map((value) => {
    const record = asRecord(value)
    if (
      (typeof record.dailyServiceId !== 'string' && typeof record.dailyServiceId !== 'number') ||
      typeof record.serviceName !== 'string'
    ) {
      throw new Error('The server returned an incomplete daily service.')
    }
    return { dailyServiceId: record.dailyServiceId, serviceName: record.serviceName }
  })
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error(`Could not read ${file.name}.`))
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error(`Could not read ${file.name} as an image.`))
        return
      }
      resolve(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

function imageDocument(
  documentType: TransporterDocumentType,
  uploadType: TransporterUploadType,
  fileName: string,
  filePath: string,
  mimeType: string,
): TransporterDocument {
  return { documentType, uploadType, fileName, filePath, mimeType }
}

export interface ProfilePayloadValues {
  transporterName: string
  aboutTransport?: string
  riskType: RiskType
  userType: string
  registrationNumber?: string
  gstNumber?: string
  dailyService: string[]
  city: string
  state: string
  address: string
  contactNo1: string
  contactNo2?: string
  contactNo3?: string
  email: string
  officeBranch?: string
  website?: string
  bankAccountNumber?: string
  bankName?: string
  ifscCode?: string
  accountHolderName?: string
  panNumber?: string
  panCardName?: string
  existingLogoUrl?: string
  logoFile?: File
  signatureMethod: SignatureMethod
  existingSignatureUrl?: string
  signaturePad?: string
  signatureFile?: File
}

export async function buildTransporterProfilePayload(
  values: ProfilePayloadValues,
  existingProfile?: TransporterProfile | null,
): Promise<Record<string, unknown>> {
  const existingDocuments = existingProfile?.documents ?? []
  const documents = existingDocuments.filter(
    (document) => document.documentType !== 'LOGO' && document.documentType !== 'SIGNATURE',
  )

  // The backend accepts document filePath values but currently exposes no binary upload endpoint.
  if (values.logoFile) {
    documents.push(
      imageDocument('LOGO', 'UPLOAD', values.logoFile.name, await readFileAsDataUrl(values.logoFile), values.logoFile.type),
    )
  } else if (values.existingLogoUrl) {
    documents.push(...existingDocuments.filter((document) => document.documentType === 'LOGO'))
  }

  if (values.signatureMethod === 'pad' && values.signaturePad) {
    documents.push(imageDocument('SIGNATURE', 'PAD', 'signature.png', values.signaturePad, 'image/png'))
  } else if (values.signatureMethod === 'upload' && values.signatureFile) {
    documents.push(
      imageDocument(
        'SIGNATURE',
        'UPLOAD',
        values.signatureFile.name,
        await readFileAsDataUrl(values.signatureFile),
        values.signatureFile.type,
      ),
    )
  } else if (values.existingSignatureUrl) {
    const existingSignature = existingDocuments.find((document) => document.documentType === 'SIGNATURE')
    documents.push(
      existingSignature
        ? { ...existingSignature, uploadType: values.signatureMethod === 'upload' ? 'UPLOAD' : 'PAD' }
        : imageDocument(
            'SIGNATURE',
            values.signatureMethod === 'upload' ? 'UPLOAD' : 'PAD',
            values.signatureMethod === 'upload' ? 'signature-upload' : 'signature.png',
            values.existingSignatureUrl,
            'image/png',
          ),
    )
  }

  return {
    transporterName: values.transporterName,
    aboutTransport: values.aboutTransport || null,
    riskType: values.riskType === 'carrier' ? 'CARRIER' : 'OWNER',
    userType: values.userType,
    registrationNumber: values.registrationNumber || null,
    gstNumber: values.gstNumber || null,
    dailyServiceId: values.dailyService.join(','),
    city: values.city,
    state: values.state,
    address: values.address,
    contactNumber1: values.contactNo1,
    contactNumber2: values.contactNo2 || null,
    contactNumber3: values.contactNo3 || null,
    email: values.email,
    officeBranch: values.officeBranch || null,
    website: values.website || null,
    bankName: values.bankName || null,
    accountNumber: values.bankAccountNumber || null,
    ifscCode: values.ifscCode || null,
    panNumber: values.panNumber || null,
    panCardName: values.panCardName || null,
    accountHolderName: values.accountHolderName || null,
    documents: documents.map(({ documentType, uploadType, fileName, filePath, mimeType }) => ({
      documentType,
      uploadType,
      fileName,
      filePath,
      mimeType,
    })),
  }
}

function unwrapProfile(data: unknown): TransporterProfile {
  return normalizeTransporterProfile(data)
}

export async function createTransporterProfile(payload: Record<string, unknown>): Promise<TransporterProfile> {
  const { data } = await apiClient.post('/transporter-profile', payload)
  return unwrapProfile(data)
}

export async function updateTransporterProfile(
  id: string,
  payload: Record<string, unknown>,
): Promise<TransporterProfile> {
  const { data } = await apiClient.put(`/transporter-profile/${id}`, payload)
  return unwrapProfile(data)
}

export async function deleteTransporterLogo(
  id: string,
  documents: TransporterDocument[],
): Promise<TransporterProfile> {
  const { data } = await apiClient.put(`/transporter-profile/${id}`, {
    documents: documents
      .filter((document) => document.documentType !== 'LOGO')
      .map(({ documentType, uploadType, fileName, filePath, mimeType }) => ({
        documentType,
        uploadType,
        fileName,
        filePath,
        mimeType,
      })),
  })
  return unwrapProfile(data)
}
