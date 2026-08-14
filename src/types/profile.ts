export type RiskType = 'owner' | 'carrier'
export type UserType = 'fleetOwner' | 'broker'
export type SignatureMethod = 'pad' | 'upload'

export interface TransporterProfile {
  id: string
  transporterName: string
  aboutTransport?: string
  riskType: RiskType
  userType: UserType

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

  logoUrl?: string

  signatureMethod: SignatureMethod
  signatureUrl?: string

  updatedAt: string
}
