import * as React from 'react'
import { ChevronDown, Eye, Download, Loader2, Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Quotation } from '@/types/quotation'

interface QuotationCardProps {
    quotation: Quotation
    createdBy?: string
    expanded: boolean
    onToggle: () => void
    onView: () => void
    onDownload: () => void
    downloading?: boolean
    onEdit: () => void
    onDelete: () => void
}

const dash = (value?: string | number | null) => (value === undefined || value === null || value === '' ? '—' : value)

function resolveFrom(quotation: Quotation): string | undefined {
    return (
        quotation.addresses?.find((item) => item.addressType === 'FROM')?.address ??
        quotation.pickup ??
        quotation.detail?.fromAddresses?.[0]
    )
}

function resolveTo(quotation: Quotation): string | undefined {
    return (
        quotation.addresses?.find((item) => item.addressType === 'TO')?.address ??
        quotation.destination ??
        quotation.detail?.toAddresses?.[0]
    )
}

/**
 * One quotation summary card that expands in place to reveal row actions —
 * mirrors the legacy system's "Transport Quotation List" card layout
 * (quotation summary left/middle, generated date top-right, a circular
 * chevron toggle, and an action row + Close button once expanded).
 */
export function QuotationCard({
    quotation,
    createdBy,
    expanded,
    onToggle,
    onView,
    onDownload,
    downloading = false,
    onEdit,
    onDelete,
}: QuotationCardProps) {
    const quotationNo = quotation.quotationNumber ?? quotation.id
    const companyName = quotation.companyName ?? quotation.customerName
    const loadingDate = quotation.detail?.loadingDate
    const validTill = quotation.quotationValidUpto ?? quotation.validity
    const materialName = quotation.detail?.materialName
    const generatedDate = quotation.quotationGeneratedDate ?? quotation.date
    const from = resolveFrom(quotation)
    const to = resolveTo(quotation)

    return (
        <Card className="overflow-hidden">
            <div className="relative p-4 sm:p-5">
                {generatedDate && (
                    <span className="absolute top-4 right-4 text-xs text-[var(--color-muted-foreground)] sm:top-5 sm:right-5">
                        {formatDate(generatedDate)}
                    </span>
                )}

                <div className="grid grid-cols-1 gap-x-6 gap-y-1 pr-16 sm:grid-cols-2">
                    <dl className="space-y-1 text-sm">
                        <div>
                            <dt className="inline font-semibold text-[var(--color-foreground)]">Quotation No : </dt>
                            <dd className="inline text-[var(--color-foreground)]">{dash(quotationNo)}</dd>
                        </div>
                        <div>
                            <dt className="inline font-semibold text-[var(--color-foreground)]">Company Name : </dt>
                            <dd className="inline text-[var(--color-foreground)]">{dash(companyName)}</dd>
                        </div>
                        <div>
                            <dt className="inline font-semibold text-[var(--color-foreground)]">Loading Date : </dt>
                            <dd className="inline text-[var(--color-foreground)]">{loadingDate ? formatDate(loadingDate) : '—'}</dd>
                        </div>
                        <div>
                            <dt className="inline font-semibold text-[var(--color-foreground)]">Quotation Valid Till : </dt>
                            <dd className="inline text-[var(--color-foreground)]">{validTill ? formatDate(validTill) : '—'}</dd>
                        </div>
                    </dl>

                    <dl className="space-y-1 text-sm">
                        <div>
                            <dt className="inline font-semibold text-[var(--color-foreground)]">Material Name : </dt>
                            <dd className="inline text-[var(--color-foreground)]">{dash(materialName)}</dd>
                        </div>
                        <div>
                            <dt className="inline font-semibold text-[var(--color-foreground)]">From : </dt>
                            <dd className="inline text-[var(--color-foreground)]">{dash(from)}</dd>
                        </div>
                        <div>
                            <dt className="inline font-semibold text-[var(--color-foreground)]">To : </dt>
                            <dd className="inline text-[var(--color-foreground)]">{dash(to)}</dd>
                        </div>
                    </dl>
                </div>

                <div className="mt-3 flex items-end justify-between">
                    {createdBy && <p className="text-xs text-[var(--color-muted-foreground)]">Created By : {createdBy}</p>}

                    <button
                        type="button"
                        onClick={onToggle}
                        aria-label={expanded ? 'Collapse details' : 'Expand details'}
                        aria-expanded={expanded}
                        className={cn(
                            'ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors',
                            expanded
                                ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                                : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)]',
                        )}
                    >
                        <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-[var(--color-border)]">
                    <div className="grid grid-cols-2 divide-x divide-[var(--color-border)] sm:grid-cols-4">
                        <button
                            type="button"
                            onClick={onView}
                            className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]"
                        >
                            <Eye className="h-4 w-4" /> View
                        </button>
                        <button
                            type="button"
                            onClick={onDownload}
                            className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] disabled:cursor-wait disabled:opacity-60"
                            disabled={downloading}
                        >
                            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            {downloading ? 'Preparing…' : 'Download'}
                        </button>
                        <button
                            type="button"
                            onClick={onEdit}
                            className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]"
                        >
                            <Pencil className="h-4 w-4" /> Edit
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-surface-muted)]"
                        >
                            <Trash2 className="h-4 w-4" /> Delete
                        </button>
                    </div>
                    <div className="border-t border-[var(--color-border)] p-3 text-center">
                        <Button type="button" variant="secondary" size="sm" onClick={onToggle}>
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    )
}
