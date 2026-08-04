import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-[var(--color-background)]',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:opacity-90 focus-visible:ring-[var(--color-secondary)]',
        navy:
          'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90 focus-visible:ring-[var(--color-primary)]',
        secondary:
          'bg-[var(--color-surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-border)] focus-visible:ring-[var(--color-secondary)]',
        accent:
          'bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:opacity-90 focus-visible:ring-[var(--color-accent)]',
        outline:
          'border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]',
        ghost: 'text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]',
        danger: 'bg-[var(--color-danger)] text-white hover:opacity-90',
        link: 'text-[var(--color-primary)] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'
