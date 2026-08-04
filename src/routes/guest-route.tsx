import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/api/auth-context'

export function GuestRoute() {
  const { isAuthenticated, isInitializing } = useAuth()
  if (isInitializing) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
