import * as React from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 text-sm text-[var(--color-foreground)] transition-colors placeholder:text-[var(--color-muted-foreground)]',
      'border-[var(--color-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none',
      error && 'border-[var(--color-danger)] focus-visible:ring-[var(--color-danger)]',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
))
Input.displayName = 'Input'
