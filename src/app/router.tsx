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
import ViewQuotationPage from '@/features/quotation/pages/view-quotation-page'

import CreateMastersPage from '@/features/masters/pages/create-masters-page'
import PartyListPage from '@/features/masters/pages/party-list-page'
import AddNewPartyPage from '@/features/masters/pages/add-new-party-page'
import TruckListPage from '@/features/masters/pages/truck-list-page'
import AddNewTruckPage from '@/features/masters/pages/add-new-truck-page'
import SupplierListPage from '@/features/masters/pages/supplier-list-page'
import AddNewSupplierPage from '@/features/masters/pages/add-new-supplier-page'
import EmployeeListPage from '@/features/masters/pages/employee-list-page'
import AddNewEmployeePage from '@/features/masters/pages/add-new-employee-page'
import ItemListPage from '@/features/masters/pages/item-list-page'
import AddNewItemPage from '@/features/masters/pages/add-new-item-page'
import ChargeListPage from '@/features/masters/pages/charge-list-page'
import AddNewChargePage from '@/features/masters/pages/add-new-charge-page'
import TermsConditionListPage from '@/features/masters/pages/terms-condition-list-page'
import AddNewTermsConditionPage from '@/features/masters/pages/add-new-terms-condition-page'

import EditProfilePage from '@/features/profile/pages/edit-profile-page'
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
          <Route path="/quotation/:id/view" element={<ViewQuotationPage />} />
          <Route path="/quotation/:id/edit" element={<CreateQuotationPage />} />

          <Route path="/operations/loading-advice" element={<ComingSoonPage title="Loading Advice" />} />
          <Route path="/operations/dispatch" element={<ComingSoonPage title="Dispatch" />} />

          <Route path="/masters" element={<CreateMastersPage />} />
          <Route path="/masters/create" element={<CreateMastersPage />} />
          <Route path="/masters/party-list" element={<PartyListPage />} />
          <Route path="/masters/add-new-party" element={<AddNewPartyPage />} />
          <Route path="/masters/party/:id/edit" element={<AddNewPartyPage />} />
          <Route path="/masters/truck-list" element={<TruckListPage />} />
          <Route path="/masters/add-new-truck" element={<AddNewTruckPage />} />
          <Route path="/masters/truck/:id/edit" element={<AddNewTruckPage />} />
          <Route path="/masters/supplier-list" element={<SupplierListPage />} />
          <Route path="/masters/add-new-supplier" element={<AddNewSupplierPage />} />
          <Route path="/masters/supplier/:id/edit" element={<AddNewSupplierPage />} />
          <Route path="/masters/employee-list" element={<EmployeeListPage />} />
          <Route path="/masters/add-new-employee" element={<AddNewEmployeePage />} />
          <Route path="/masters/employee/:id/edit" element={<AddNewEmployeePage />} />
          <Route path="/masters/item-list" element={<ItemListPage />} />
          <Route path="/masters/add-new-item" element={<AddNewItemPage />} />
          <Route path="/masters/item/:id/edit" element={<AddNewItemPage />} />
          <Route path="/masters/charge-list" element={<ChargeListPage />} />
          <Route path="/masters/add-new-charge" element={<AddNewChargePage />} />
          <Route path="/masters/charge/:id/edit" element={<AddNewChargePage />} />
          <Route path="/masters/terms-condition-list" element={<TermsConditionListPage />} />
          <Route path="/masters/add-new-terms-condition" element={<AddNewTermsConditionPage />} />
          <Route path="/masters/terms-condition/:id/edit" element={<AddNewTermsConditionPage />} />
          <Route path="/accounts/invoice" element={<ComingSoonPage title="Invoice" />} />
          <Route path="/accounts/payments" element={<ComingSoonPage title="Payments" />} />
          <Route path="/accounts/ledger" element={<ComingSoonPage title="Ledger" />} />

          <Route
            path="/reports"
            element={<ComingSoonPage title="Reports" description="Operational and financial reports." />}
          />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<EditProfilePage />} />
          <Route path="/profile/transporter" element={<Navigate to="/profile" replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
