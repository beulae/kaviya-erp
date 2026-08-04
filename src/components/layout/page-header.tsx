import * as React from 'react'
import { Breadcrumb } from './breadcrumb'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Breadcrumb />
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-2xl">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
