import * as React from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs } from '@/components/ui/tabs'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/api/auth-context'
import { initials } from '@/utils/format'
import { useToast } from '@/components/ui/toaster'

const TABS = [
  { value: 'profile', label: 'Profile Information' },
  { value: 'password', label: 'Change Password' },
  { value: 'security', label: 'Two-Factor Auth' },
  { value: 'notifications', label: 'Notification Settings' },
  { value: 'documents', label: 'Documents' },
  { value: 'activity', label: 'Activity Log' },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tab, setTab] = React.useState('profile')

  return (
    <div>
      <PageHeader title="Profile" description="Manage your personal and company information." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit p-5 text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-primary)] text-2xl font-semibold text-white">
            {user ? initials(user.name) : 'U'}
          </span>
          <p className="mt-3 font-semibold text-[var(--color-foreground)]">{user?.name}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{user?.companyName}</p>
          <Button size="sm" variant="outline" className="mt-4 w-full">
            Change Photo
          </Button>
        </Card>

        <Card>
          <div className="overflow-x-auto px-4 pt-2">
            <Tabs tabs={TABS} value={tab} onChange={setTab} />
          </div>
          <CardContent>
            {tab === 'profile' && (
              <form
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  toast({ title: 'Profile updated', variant: 'success' })
                }}
              >
                <Field label="Full Name">
                  <Input defaultValue={user?.name} />
                </Field>
                <Field label="Email">
                  <Input type="email" defaultValue={user?.email} />
                </Field>
                <Field label="Mobile Number">
                  <Input defaultValue="+91 98765 43210" />
                </Field>
                <Field label="Designation">
                  <Input defaultValue="Administrator" />
                </Field>
                <Field label="Role">
                  <Input defaultValue="Super Admin" disabled />
                </Field>
                <Field label="Branch">
                  <Input defaultValue="Head Office" />
                </Field>
                <Field label="Address" className="sm:col-span-2">
                  <Input defaultValue="No. 123, GST Road, Chennai, Tamil Nadu - 600001" />
                </Field>
                <div className="flex justify-end gap-2 sm:col-span-2">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            )}
            {tab === 'password' && (
              <form
                className="max-w-sm space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  toast({ title: 'Password changed', variant: 'success' })
                }}
              >
                <Field label="Current Password">
                  <Input type="password" />
                </Field>
                <Field label="New Password">
                  <Input type="password" />
                </Field>
                <Field label="Confirm New Password">
                  <Input type="password" />
                </Field>
                <Button type="submit">Update Password</Button>
              </form>
            )}
            {['security', 'notifications', 'documents', 'activity'].includes(tab) && (
              <p className="py-8 text-center text-sm text-[var(--color-muted-foreground)]">
                This section is ready to be wired up to your backend — layout follows the same pattern as Profile
                Information.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
