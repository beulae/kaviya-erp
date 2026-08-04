import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

/** Minimal accessible modal dialog (no external primitives). */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-xl',
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 id="dialog-title" className="text-base font-semibold text-[var(--color-foreground)]">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-[var(--radius-sm)] p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
