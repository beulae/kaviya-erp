import * as React from 'react'
import type { User, LoginPayload, RegisterPayload } from '@/types/auth'

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

const MOCK_USER: User = {
  id: 'user-1',
  name: 'Karthik Raja',
  email: 'karthik@kaviyaroadways.in',
  role: 'admin',
  companyName: 'Kaviya Roadways and Logistics Services',
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [isInitializing, setIsInitializing] = React.useState(true)

  React.useEffect(() => {
    const token = localStorage.getItem('kaviya-access-token')
    if (token) setUser(MOCK_USER)
    setIsInitializing(false)
  }, [])

  const login = React.useCallback(async (payload: LoginPayload) => {
    await delay(600)
    if (!payload.identifier || payload.password.length < 6) {
      throw new Error('Invalid credentials')
    }
    localStorage.setItem('kaviya-access-token', 'mock-access-token')
    localStorage.setItem('kaviya-refresh-token', 'mock-refresh-token')
    setUser(MOCK_USER)
  }, [])

  const register = React.useCallback(async (payload: RegisterPayload) => {
    await delay(700)
    localStorage.setItem('kaviya-access-token', 'mock-access-token')
    localStorage.setItem('kaviya-refresh-token', 'mock-refresh-token')
    setUser({ ...MOCK_USER, name: payload.ownerName, email: payload.email, companyName: payload.companyName })
  }, [])

  const logout = React.useCallback(() => {
    localStorage.removeItem('kaviya-access-token')
    localStorage.removeItem('kaviya-refresh-token')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isInitializing, login, register, logout }}>
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
