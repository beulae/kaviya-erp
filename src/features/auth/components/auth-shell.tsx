import * as React from 'react'
import { Link } from 'react-router-dom'
import logo from '@/assets/images/logo.png'

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}

/** Shared two-column shell for all auth pages: brand panel + form panel. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-[var(--color-chrome)] p-10 text-white lg:flex">
        <Link to="/login" className="flex items-center gap-2">
          <img
            src={logo}
            alt="Kaviya Roadways and Logistics Services"
            className="h-12 w-auto rounded bg-white/95 p-1"
          />
        </Link>
        <div>
          <h2 className="max-w-md text-3xl leading-tight font-semibold">
            Run your fleet, bilties and billing from one dashboard.
          </h2>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Kaviya Roadways ERP keeps dispatch, accounts and reporting in sync — across every branch.
          </p>
        </div>
        <p className="text-xs text-white/50">© {new Date().getFullYear()} Kaviya Roadways and Logistics Services</p>
      </div>

      <div className="flex items-center justify-center bg-[var(--color-background)] p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <img src={logo} alt="Kaviya Roadways" className="mb-6 h-12 w-auto lg:hidden" />
          <h1 className="text-xl font-semibold text-[var(--color-foreground)]">{title}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{subtitle}</p>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">{footer}</div>}
        </div>
      </div>
    </div>
  )
}
