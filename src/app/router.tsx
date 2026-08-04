import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/app-layout'
import AuthLayout from '@/layouts/auth-layout'
import { ProtectedRoute } from '@/routes/protected-route'
import { GuestRoute } from '@/routes/guest-route'

import LoginPage from '@/features/auth/pages/login-page'
import RegisterPage from '@/features/auth/pages/register-page'
import ForgotPasswordPage from '@/features/auth/pages/forgot-password-page'
import ResetPasswordPage from '@/features/auth/pages/reset-password-page'

import DashboardPage from '@/features/dashboard/pages/dashboard-page'

import BiltyListPage from '@/features/bilty/pages/bilty-list-page'
import CreateBiltyPage from '@/features/bilty/pages/create-bilty-page'
import ViewBiltyPage from '@/features/bilty/pages/view-bilty-page'
import EditBiltyPage from '@/features/bilty/pages/edit-bilty-page'

import QuotationListPage from '@/features/quotation/pages/quotation-list-page'
import CreateQuotationPage from '@/features/quotation/pages/create-quotation-page'

import CustomersPage from '@/features/customers/pages/customers-page'
import DriversPage from '@/features/drivers/pages/drivers-page'
import VehiclesPage from '@/features/vehicles/pages/vehicles-page'

import ProfilePage from '@/features/profile/pages/profile-page'
import SettingsPage from '@/features/settings/pages/settings-page'

import { ComingSoonPage } from '@/components/common/coming-soon'
import NotFoundPage from '@/routes/pages/not-found-page'
import UnauthorizedPage from '@/routes/pages/unauthorized-page'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Guest-only routes */}
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/bilty" element={<BiltyListPage />} />
          <Route path="/bilty/create" element={<CreateBiltyPage />} />
          <Route path="/bilty/:id" element={<ViewBiltyPage />} />
          <Route path="/bilty/:id/edit" element={<EditBiltyPage />} />

          <Route path="/quotation" element={<QuotationListPage />} />
          <Route path="/quotation/create" element={<CreateQuotationPage />} />

          <Route path="/operations/loading-advice" element={<ComingSoonPage title="Loading Advice" />} />
          <Route path="/operations/dispatch" element={<ComingSoonPage title="Dispatch" />} />

          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/drivers" element={<DriversPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/masters/branches" element={<ComingSoonPage title="Branches" />} />
          <Route path="/masters/routes" element={<ComingSoonPage title="Routes" />} />

          <Route path="/accounts/invoice" element={<ComingSoonPage title="Invoice" />} />
          <Route path="/accounts/payments" element={<ComingSoonPage title="Payments" />} />
          <Route path="/accounts/ledger" element={<ComingSoonPage title="Ledger" />} />

          <Route
            path="/reports"
            element={<ComingSoonPage title="Reports" description="Operational and financial reports." />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
