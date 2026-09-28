import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal, FileX2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toaster'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useAuth } from '@/features/auth/api/auth-context'
import { QuotationCard } from '../components/quotation-card'
import { useQuotations, useDeleteQuotation } from '../api/use-quotation'
import { useDownloadQuotationPdf } from '../api/use-quotation-pdf'
import type { Quotation } from '@/types/quotation'

const PAGE_SIZE = 10

export default function QuotationListPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [search, setSearch] = React.useState('')
  const [debouncedSearch, setDebouncedSearch] = React.useState('')
  const [showFilters, setShowFilters] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [expandedIds, setExpandedIds] = React.useState<Set<string | number>>(new Set())
  const [deleteId, setDeleteId] = React.useState<string | number | null>(null)

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [search])

  const { data, isLoading } = useQuotations({ search: debouncedSearch, page, pageSize: PAGE_SIZE })
  const deleteQuotation = useDeleteQuotation()
  const { download, downloadingId } = useDownloadQuotationPdf()

  const quotations = (data?.data ?? []) as Quotation[]
  const total = data?.total ?? quotations.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteQuotation.mutateAsync(deleteId)
      setDeleteId(null)
      setExpandedIds((current) => {
        const next = new Set(current)
        next.delete(deleteId)
        return next
      })
      toast({
        title: 'Quotation deleted',
        description: 'The quotation has been removed successfully.',
        variant: 'success',
      })
    } catch {
      toast({
        title: 'Delete failed',
        description: 'The quotation could not be removed right now.',
        variant: 'error',
      })
    }
  }

  return (
    <div>
      <PageHeader
        title={`Transport Quotation List${total ? ` (${total})` : ''}`}
        actions={
          <div className="flex items-center gap-2">
            <Button type="button" variant="primary" size="sm" onClick={() => setShowFilters((v) => !v)}>
              <SlidersHorizontal className="h-4 w-4" /> Filter
            </Button>
            <Button type="button" variant="navy" size="sm" onClick={() => navigate('/quotation/create')}>
              <Plus className="h-4 w-4" /> Create Transport Quotation
            </Button>
          </div>
        }
      />

      {showFilters && (
        <Card className="mb-4 p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
            <Input
              placeholder="Search quotation no., customer, company, material, from or to…"
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-[var(--color-surface-muted)]" />
          ))}
        </div>
      ) : quotations.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <FileX2 className="h-8 w-8 text-[var(--color-muted-foreground)]" />
          <p className="text-sm text-[var(--color-muted-foreground)]">No quotations found</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
          {quotations.map((quotation) => {
            const id = quotation.id
            if (id === undefined || id === null) return null

            return (
              <QuotationCard
                key={id}
                quotation={quotation}
                createdBy={user?.companyName}
                expanded={expandedIds.has(id)}
                onToggle={() =>
                  setExpandedIds((current) => {
                    const next = new Set(current)
                    if (next.has(id)) {
                      next.delete(id)
                    } else {
                      next.add(id)
                    }
                    return next
                  })
                }
                onView={() => navigate(`/quotation/${id}/view`)}
                onDownload={() => download(id, quotation)}
                downloading={downloadingId === id}
                onEdit={() => navigate(`/quotation/${id}/edit`)}
                onDelete={() => setDeleteId(id)}
              />
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => setPage(pageNumber)}
              className={
                pageNumber === page
                  ? 'flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-sm font-medium text-[var(--color-primary-foreground)]'
                  : 'flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]'
              }
            >
              {pageNumber}
            </button>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete quotation"
        description="This action cannot be undone. Are you sure you want to delete this quotation?"
        confirmLabel="Delete"
        variant="danger"
        loading={deleteQuotation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />                          
    </div>
  )
}
