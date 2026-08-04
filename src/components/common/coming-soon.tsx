import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Construction } from 'lucide-react'

interface ComingSoonPageProps {
  title: string
  description?: string
  icon?: LucideIcon
}

/** Placeholder for modules scaffolded but not yet wired to a backend — keeps routing/nav complete. */
export function ComingSoonPage({ title, description, icon = Construction }: ComingSoonPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Card>
        <EmptyState
          icon={icon}
          title={`${title} module`}
          description="This module is scaffolded and ready — connect it to your backend using the same pattern as Bilty/Quotation."
        />
      </Card>
    </div>
  )
}
