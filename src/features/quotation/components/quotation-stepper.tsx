import { Check } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface QuotationStep {
  key: string
  label: string
}

interface QuotationStepperProps {
  steps: readonly QuotationStep[]
  activeStep: number
  onStepClick: (index: number) => void
}

export function QuotationStepper({ steps, activeStep, onStepClick }: QuotationStepperProps) {
  return (
    <div className="flex flex-wrap gap-1 border-b border-[var(--color-border)] p-2 sm:p-3">
      {steps.map((s, i) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onStepClick(i)}
          className={cn(
            'flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors',
            i === activeStep
              ? 'bg-[var(--color-primary)] text-white'
              : i < activeStep
                ? 'text-[var(--color-primary)]'
                : 'text-[var(--color-muted-foreground)]',
          )}
        >
          <span
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full text-xs',
              i === activeStep
                ? 'bg-white/20'
                : i < activeStep
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-muted)]',
            )}
          >
            {i < activeStep ? <Check className="h-3 w-3" /> : i + 1}
          </span>
          {s.label}
        </button>
      ))}
    </div>
  )
}
