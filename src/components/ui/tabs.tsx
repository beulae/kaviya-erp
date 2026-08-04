import * as React from 'react'
import { cn } from '@/utils/cn'

interface TabsProps {
  tabs: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div role="tablist" className={cn('flex gap-1 border-b border-[var(--color-border)]', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
            value === tab.value
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
