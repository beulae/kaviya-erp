import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Truck,
  Send,
  Users,
  UserRound,
  Warehouse,
  Route,
  Building2,
  Receipt,
  Wallet,
  BookOpen,
  BarChart3,
  Settings,
} from 'lucide-react'

export interface NavChild {
  label: string
  to: string
}

export interface NavItem {
  label: string
  to?: string
  icon: LucideIcon
  children?: NavChild[]
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Operations',
    icon: Truck,
    children: [
      { label: 'Bilty', to: '/bilty' },
      { label: 'Quotation', to: '/quotation' },
      { label: 'Loading Advice', to: '/operations/loading-advice' },
      { label: 'Dispatch', to: '/operations/dispatch' },
    ],
  },
  {
    label: 'Masters',
    icon: Warehouse,
    children: [
      { label: 'Customers', to: '/customers' },
      { label: 'Drivers', to: '/drivers' },
      { label: 'Vehicles', to: '/vehicles' },
      { label: 'Branches', to: '/masters/branches' },
      { label: 'Routes', to: '/masters/routes' },
    ],
  },
  {
    label: 'Accounts',
    icon: Wallet,
    children: [
      { label: 'Invoice', to: '/accounts/invoice' },
      { label: 'Payments', to: '/accounts/payments' },
      { label: 'Ledger', to: '/accounts/ledger' },
    ],
  },
  { label: 'Reports', to: '/reports', icon: BarChart3 },
  { label: 'Settings', to: '/settings', icon: Settings },
  { label: 'Profile', to: '/profile', icon: UserRound },
]

export { FileText, ClipboardList, Send, Users, Route, Building2, Receipt, BookOpen }
