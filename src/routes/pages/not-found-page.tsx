import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-background)] p-8 text-center">
      <Compass className="h-10 w-10 text-[var(--color-primary)]" />
      <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">404 — Page not found</h1>
      <p className="max-w-sm text-sm text-[var(--color-muted-foreground)]">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:opacity-90"
      >
        Back to dashboard
      </Link>
    </div>
  )
}
