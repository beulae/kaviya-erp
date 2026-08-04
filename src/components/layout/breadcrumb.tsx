import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

function titleCase(segment: string) {
  return segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function Breadcrumb() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)]">
      <Link to="/dashboard" className="flex items-center hover:text-[var(--color-foreground)]">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/')
        const isLast = i === segments.length - 1
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="font-medium text-[var(--color-foreground)]">{titleCase(seg)}</span>
            ) : (
              <Link to={path} className="hover:text-[var(--color-foreground)]">
                {titleCase(seg)}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
