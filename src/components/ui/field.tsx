import * as React from 'react'
import { Label } from './label'
import { cn } from '@/utils/cn'

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

/** Wraps a form control with label + error message, wired for React Hook Form. */
export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-[var(--color-danger)]"> *</span>}
      </Label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{hint}</p>
      ) : null}
    </div>
  )
}
