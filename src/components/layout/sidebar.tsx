import * as React from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown, X } from 'lucide-react'
import { NAV_ITEMS } from '@/constants/nav'
import { cn } from '@/utils/cn'
import logo from '@/assets/images/logo.png'

interface SidebarProps {
  mobileOpen: boolean
  onCloseMobile: () => void
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({ Operations: true })

  const toggleGroup = (label: string) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }))

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-[var(--color-border)] px-4">
        <img src={logo} alt="Kaviya Roadways and Logistics Services" className="h-9 w-auto" />
        <button className="ml-auto lg:hidden" onClick={onCloseMobile} aria-label="Close menu">
          <X className="h-5 w-5 text-[var(--color-muted-foreground)]" />
        </button>
      </div>
      <nav className="flex-1 scrollbar-thin overflow-y-auto px-2 py-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            if (!item.children) {
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.to!}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-[var(--color-chrome)] text-[var(--color-chrome-foreground)]'
                          : 'text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]',
                      )
                    }
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {item.label}
                  </NavLink>
                </li>
              )
            }
            const isOpen = openGroups[item.label]
            return (
              <li key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]"
                  aria-expanded={isOpen}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <ul className="mt-0.5 ml-4 space-y-0.5 border-l border-[var(--color-border)] pl-4">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          onClick={onCloseMobile}
                          className={({ isActive }) =>
                            cn(
                              'block rounded-[var(--radius-md)] px-3 py-1.5 text-sm transition-colors',
                              isActive
                                ? 'font-medium text-[var(--color-primary)]'
                                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]',
                            )
                          }
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] lg:block">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onCloseMobile} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-[var(--color-surface)] shadow-xl">{content}</aside>
        </div>
      )}
    </>
  )
}
