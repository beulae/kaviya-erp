import * as React from 'react'
import { Menu, Search, Bell, Sun, Moon, Monitor, ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@/app/theme-provider'
import { useAuth } from '@/features/auth/api/auth-context'
import { initials } from '@/utils/format'
import { cn } from '@/utils/cn'

export function Topbar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = React.useState(false)
  const [notifOpen, setNotifOpen] = React.useState(false)

  const themeIcons = { light: Sun, dark: Moon, system: Monitor } as const
  const ThemeIcon = themeIcons[theme]

  const notifications = [
    { id: 1, title: 'Bilty KRW-B1032 dispatched', time: '5m ago' },
    { id: 2, title: 'Payment received from AVM Textiles', time: '1h ago' },
    { id: 3, title: 'Vehicle TN 18 AB 1004 due for service', time: '3h ago' },
  ]

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-[var(--color-chrome)] px-4 text-white shadow-[0_1px_0_rgba(255,255,255,0.08)]">
      <button className="lg:hidden" onClick={onOpenMobileMenu} aria-label="Open menu">
        <Menu className="h-5 w-5 text-white" />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/60" />
        <input
          type="search"
          placeholder="Search bilty, customer, vehicle…"
          className="h-9 w-full rounded-[var(--radius-md)] border border-white/15 bg-white/10 pr-3 pl-9 text-sm text-white placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={() => setTheme(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system')}
          className="rounded-[var(--radius-md)] p-2 text-white/80 hover:bg-white/10 hover:text-white"
          title={`Theme: ${theme} (${resolvedTheme})`}
          aria-label="Toggle theme"
        >
          <ThemeIcon className="h-4.5 w-4.5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative rounded-[var(--radius-md)] p-2 text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--color-accent)] ring-2 ring-[var(--color-chrome)]" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-[var(--color-foreground)] shadow-xl">
              <p className="px-2 py-1.5 text-xs font-semibold text-[var(--color-muted-foreground)]">Notifications</p>
              {notifications.map((n) => (
                <div key={n.id} className="rounded-[var(--radius-md)] px-2 py-2 hover:bg-[var(--color-surface-muted)]">
                  <p className="text-sm text-[var(--color-foreground)]">{n.title}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 rounded-[var(--radius-md)] p-1.5 hover:bg-white/10"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-semibold text-[var(--color-accent-foreground)]">
              {user ? initials(user.name) : 'U'}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-medium text-white">{user?.name}</span>
              <span className="block text-xs text-white/60 capitalize">{user?.role}</span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-white/60 sm:block" />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-xl">
              <button
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/profile')
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-sm hover:bg-[var(--color-surface-muted)]',
                )}
              >
                <UserIcon className="h-4 w-4" /> Profile
              </button>
              <button
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/settings')
                }}
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-sm hover:bg-[var(--color-surface-muted)]"
              >
                <Settings className="h-4 w-4" /> Settings
              </button>
              <hr className="my-1 border-[var(--color-border)]" />
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface-muted)]"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
