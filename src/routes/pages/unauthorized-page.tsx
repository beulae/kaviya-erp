import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-background)] p-8 text-center">
      <ShieldAlert className="h-10 w-10 text-[var(--color-danger)]" />
      <h1 className="text-3xl font-semibold text-[var(--color-foreground)]">403 — Access denied</h1>
      <p className="max-w-sm text-sm text-[var(--color-muted-foreground)]">
        You don't have permission to view this page. Contact your administrator if you believe this is a mistake.
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
