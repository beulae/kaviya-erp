import * as React from 'react'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/utils/cn'

export interface AutocompleteInputProps extends Omit<InputProps, 'onChange' | 'value'> {
  value: string
  onValueChange: (value: string) => void
  /** Candidate suggestions. Swap for an API-backed source hook when one exists. */
  suggestions: string[]
  maxSuggestions?: number
}

/**
 * Lightweight, reusable autocomplete abstraction for text fields (company
 * name, pickup/delivery address, etc). Suggestions are supplied by the
 * caller so this component stays decoupled from any specific data source —
 * swap `suggestions` for the output of a real lookup hook once one exists,
 * without touching the UI/keyboard-nav logic below.
 */
export const AutocompleteInput = React.forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ value, onValueChange, suggestions, maxSuggestions = 6, className, id, ...props }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [activeIndex, setActiveIndex] = React.useState(-1)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const filtered = React.useMemo(() => {
      const q = value.trim().toLowerCase()
      if (!q) return []
      return suggestions.filter((s) => s.toLowerCase().includes(q)).slice(0, maxSuggestions)
    }, [value, suggestions, maxSuggestions])

    React.useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const commit = (suggestion: string) => {
      onValueChange(suggestion)
      setOpen(false)
      setActiveIndex(-1)
    }

    return (
      <div ref={containerRef} className="relative">
        <Input
          id={id}
          ref={ref}
          role="combobox"
          aria-expanded={open && filtered.length > 0}
          aria-autocomplete="list"
          aria-controls={id ? `${id}-listbox` : undefined}
          autoComplete="off"
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (!open || filtered.length === 0) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActiveIndex((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter' && activeIndex >= 0) {
              e.preventDefault()
              commit(filtered[activeIndex])
            } else if (e.key === 'Escape') {
              setOpen(false)
            }
          }}
          className={cn(className)}
          {...props}
        />
        {open && filtered.length > 0 && (
          <ul
            id={id ? `${id}-listbox` : undefined}
            role="listbox"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
          >
            {filtered.map((s, i) => (
              <li key={s} role="option" aria-selected={i === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => commit(s)}
                  className={cn(
                    'block w-full px-3 py-2 text-left text-sm text-[var(--color-foreground)]',
                    i === activeIndex ? 'bg-[var(--color-surface-muted)]' : 'hover:bg-[var(--color-surface-muted)]',
                  )}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  },
)
AutocompleteInput.displayName = 'AutocompleteInput'
