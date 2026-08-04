import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="rounded-full bg-[var(--color-surface-muted)] p-3">
        <Icon className="h-6 w-6 text-[var(--color-muted-foreground)]" />
      </div>
      <div>
        <p className="text-sm font-semibold text-[var(--color-foreground)]">{title}</p>
        {description && <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
