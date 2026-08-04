export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  companyName: string
  avatarUrl?: string
}

export interface LoginPayload {
  identifier: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  companyName: string
  ownerName: string
  mobile: string
  email: string
  gstNumber: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}
