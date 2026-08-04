import * as React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { queryClient } from './query-client'
import { ThemeProvider } from './theme-provider'
import { ToastProvider } from '@/components/ui/toaster'
import { AuthProvider } from '@/features/auth/api/auth-context'
import { ErrorBoundary } from '@/components/common/error-boundary'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <BrowserRouter>{children}</BrowserRouter>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
