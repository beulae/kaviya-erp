import * as React from 'react'
import { ArrowRight, Database } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MASTER_LIST_ITEMS } from '@/constants/master-list-items'

export default function CreateMastersPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-start justify-center pt-8">
      <div className="w-full max-w-[680px] overflow-hidden rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--color-primary)] text-white shadow-sm">
            <Database className="h-6 w-6" />
          </div>
          <h1 className="text-[clamp(1.5rem,2vw,2.25rem)] font-semibold tracking-tight text-[var(--color-foreground)]">
            Create Masters
          </h1>
        </div>

        <div className="space-y-2 p-5">
          {MASTER_LIST_ITEMS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.to)}
              className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-lg text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              <ArrowRight className="h-4 w-4 text-[var(--color-foreground)]" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
