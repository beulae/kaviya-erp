import * as React from 'react'
import { cn } from '@/utils/cn'

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('mb-1.5 block text-sm font-medium text-[var(--color-foreground)]', className)}
      {...props}
    >
      {children}
    </label>
  ),
)
Label.displayName = 'Label'
