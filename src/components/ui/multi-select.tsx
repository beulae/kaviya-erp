import * as React from 'react'
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface MultiSelectOption {
  label: string
  value: string
}

export interface MultiSelectProps {
  id?: string
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  error?: boolean
  disabled?: boolean
  className?: string
}

/**
 * Reusable multi-select combobox, styled to match `Select`/`Input`. Supports
 * keyboard navigation, removable chips for selected values, and a search-free
 * dropdown list (options are typically short, curated lists).
 */
export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ id, options, value, onChange, placeholder = 'Select options', error, disabled, className }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(-1)
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleValue = (v: string) => {
      if (value.includes(v)) {
        onChange(value.filter((x) => x !== v))
      } else {
        onChange([...value, v])
      }
    }

    const removeValue = (v: string) => onChange(value.filter((x) => x !== v))

    const selectedLabels = options.filter((o) => value.includes(o.value))

    return (
      <div ref={containerRef} className="relative">
        <button
          id={id}
          ref={ref}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setOpen(true)
              setActiveIndex((i) => Math.min(i + 1, options.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIndex((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter' && open && activeIndex >= 0) {
              e.preventDefault()
              toggleValue(options[activeIndex].value)
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          className={cn(
            'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-[var(--radius-md)] border bg-[var(--color-surface)] px-3 py-1.5 text-left text-sm',
            'border-[var(--color-border)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:outline-none',
            error && 'border-[var(--color-danger)]',
            disabled && 'cursor-not-allowed opacity-50',
            className,
          )}
        >
          {selectedLabels.length === 0 ? (
            <span className="text-[var(--color-muted-foreground)]">{placeholder}</span>
          ) : (
            selectedLabels.map((opt) => (
              <span
                key={opt.value}
                className="flex items-center gap-1 rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--color-foreground)]"
              >
                {opt.label}
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remove ${opt.label}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    removeValue(opt.value)
                  }}
                  className="rounded-full hover:bg-[var(--color-border)]"
                >
                  <X className="h-3 w-3" />
                </span>
              </span>
            ))
          )}
          <ChevronDown className="ml-auto h-4 w-4 shrink-0 text-[var(--color-muted-foreground)]" />
        </button>

        {open && !disabled && (
          <ul
            role="listbox"
            aria-multiselectable="true"
            className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
          >
            {options.map((opt, i) => {
              const selected = value.includes(opt.value)
              return (
                <li key={opt.value} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => toggleValue(opt.value)}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[var(--color-foreground)]',
                      i === activeIndex ? 'bg-[var(--color-surface-muted)]' : 'hover:bg-[var(--color-surface-muted)]',
                    )}
                  >
                    {opt.label}
                    {selected && <span className="text-[var(--color-primary)]">✓</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  },
)
MultiSelect.displayName = 'MultiSelect'
