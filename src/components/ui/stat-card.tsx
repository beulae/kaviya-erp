import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card } from './card'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  trend?: { value: string; direction: 'up' | 'down' }
  accent?: 'blue' | 'green' | 'amber' | 'red' | 'navy'
}

const ACCENT_CLASSES: Record<NonNullable<StatCardProps['accent']>, string> = {
  blue: 'bg-[color-mix(in_srgb,var(--color-secondary)_14%,transparent)] text-[var(--color-secondary)]',
  green: 'bg-[color-mix(in_srgb,var(--color-success)_14%,transparent)] text-[var(--color-success)]',
  amber: 'bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-[var(--color-accent)]',
  red: 'bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] text-[var(--color-danger)]',
  navy: 'bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]',
}

export function StatCard({ label, value, icon: Icon, trend, accent = 'blue' }: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[var(--color-muted-foreground)]">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">{value}</p>
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]', ACCENT_CLASSES[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div
          className={cn(
            'mt-3 inline-flex items-center gap-1 text-xs font-medium',
            trend.direction === 'up' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
          )}
        >
          {trend.direction === 'up' ? (
            <ArrowUpRight className="h-3.5 w-3.5" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5" />
          )}
          {trend.value}
          <span className="font-normal text-[var(--color-muted-foreground)]">vs last month</span>
        </div>
      )}
    </Card>
  )
}
