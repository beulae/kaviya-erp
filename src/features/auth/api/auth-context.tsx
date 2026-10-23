import * as React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { User, LoginPayload, RegisterPayload } from '@/types/auth'
import type { TransporterProfile } from '@/types/profile'
import { fetchTransporterProfile } from '@/features/profile/api/profile-service'
import { profileKeys } from '@/features/profile/api/use-profile'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function userFromProfile(profile: TransporterProfile): User {
  return {
    id: profile.id,
    name: profile.transporterName,
    email: profile.email,
    role: 'admin',
    companyName: profile.transporterName,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [hasSession, setHasSession] = React.useState(false)
  const [registrationUser, setRegistrationUser] = React.useState<User | null>(null)
  const [isInitializing, setIsInitializing] = React.useState(true)
  const profileQuery = useQuery({
    queryKey: profileKeys.all,
    queryFn: fetchTransporterProfile,
    enabled: hasSession,
  })
  const user = profileQuery.data ? userFromProfile(profileQuery.data) : registrationUser

  React.useEffect(() => {
    const token = localStorage.getItem('kaviya-access-token')
    if (token) setHasSession(true)
    setIsInitializing(false)
  }, [])

  const login = React.useCallback(async (payload: LoginPayload) => {
    await delay(600)
    if (!payload.identifier || payload.password.length < 6) {
      throw new Error('Invalid credentials')
    }
    localStorage.setItem('kaviya-access-token', 'mock-access-token')
    localStorage.setItem('kaviya-refresh-token', 'mock-refresh-token')
    setRegistrationUser(null)
    setHasSession(true)
    try {
      const profile = await queryClient.fetchQuery({
        queryKey: profileKeys.all,
        queryFn: fetchTransporterProfile,
        staleTime: 0,
      })
      if (!profile) throw new Error('No transporter profile is available for this account.')
    } catch (error) {
      localStorage.removeItem('kaviya-access-token')
      localStorage.removeItem('kaviya-refresh-token')
      queryClient.removeQueries({ queryKey: profileKeys.all })
      setHasSession(false)
      throw error
    }
  }, [queryClient])

  const register = React.useCallback(async (payload: RegisterPayload) => {
    await delay(700)
    queryClient.removeQueries({ queryKey: profileKeys.all })
    localStorage.setItem('kaviya-access-token', 'mock-access-token')
    localStorage.setItem('kaviya-refresh-token', 'mock-refresh-token')
    setRegistrationUser({
      id: payload.email,
      name: payload.ownerName,
      email: payload.email,
      role: 'admin',
      companyName: payload.companyName,
    })
    setHasSession(true)
  }, [queryClient])

  const logout = React.useCallback(() => {
    localStorage.removeItem('kaviya-access-token')
    localStorage.removeItem('kaviya-refresh-token')
    queryClient.removeQueries({ queryKey: profileKeys.all })
    setRegistrationUser(null)
    setHasSession(false)
  }, [queryClient])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: hasSession && !!user,
        isInitializing: isInitializing || (hasSession && profileQuery.isPending),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
