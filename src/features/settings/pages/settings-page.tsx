import * as React from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/app/theme-provider'
import { useToast } from '@/components/ui/toaster'
import { cn } from '@/utils/cn'

const SECTIONS = [
  'Company Details',
  'Branch Settings',
  'Theme & Language',
  'GST & Invoice Settings',
  'Email Settings',
  'SMS & WhatsApp Settings',
  'Roles & Permissions',
] as const

const CURRENCIES = [
  { label: 'Indian Rupee (INR)', value: 'INR' },
  { label: 'US Dollar (USD)', value: 'USD' },
]
const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Hindi', value: 'hi' },
]

export default function SettingsPage() {
  const [active, setActive] = React.useState<(typeof SECTIONS)[number]>('Company Details')
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  return (
    <div>
      <PageHeader title="Settings" description="Configure your company, branches, billing and system preferences." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
        <Card className="h-fit p-2">
          <ul className="space-y-0.5">
            {SECTIONS.map((s) => (
              <li key={s}>
                <button
                  onClick={() => setActive(s)}
                  className={cn(
                    'w-full rounded-[var(--radius-md)] px-3 py-2 text-left text-sm font-medium transition-colors',
                    active === s
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]',
                  )}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardContent>
            {active === 'Company Details' && (
              <form
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  toast({ title: 'Company settings saved', variant: 'success' })
                }}
              >
                <Field label="Company Name" required>
                  <Input defaultValue="KAVIYA ROADWAYS AND LOGISTICS SERVICES" />
                </Field>
                <Field label="Company Code" required>
                  <Input defaultValue="KAV001" />
                </Field>
                <Field label="Email" required>
                  <Input type="email" defaultValue="info@kaviyaroadways.com" />
                </Field>
                <Field label="Mobile" required>
                  <Input defaultValue="+91 98765 43210" />
                </Field>
                <Field label="Website">
                  <Input defaultValue="www.kaviyaroadways.com" />
                </Field>
                <Field label="Currency">
                  <Select options={CURRENCIES} defaultValue="INR" />
                </Field>
                <div className="flex justify-end gap-2 sm:col-span-2">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            )}

            {active === 'Theme & Language' && (
              <div className="max-w-sm space-y-4">
                <Field label="Theme">
                  <Select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                    options={[
                      { label: 'System', value: 'system' },
                      { label: 'Light', value: 'light' },
                      { label: 'Dark', value: 'dark' },
                    ]}
                  />
                </Field>
                <Field label="Language">
                  <Select defaultValue="en" options={LANGUAGES} />
                </Field>
              </div>
            )}

            {!['Company Details', 'Theme & Language'].includes(active) && (
              <p className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
                {active} follows the same form pattern shown in Company Details — connect it to your settings API when
                ready.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
