import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthShell } from '../components/auth-shell'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas/auth-schemas'
import { useToast } from '@/components/ui/toaster'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const email = (location.state as { email?: string })?.email

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600))
    toast({ title: 'Password updated', description: 'You can now sign in with your new password.', variant: 'success' })
    navigate('/login', { replace: true })
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle={
        email ? `Enter the OTP sent to ${email} and choose a new password.` : 'Enter the OTP and choose a new password.'
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="OTP" htmlFor="otp" error={errors.otp?.message} required>
          <Input id="otp" inputMode="numeric" maxLength={6} placeholder="6-digit code" {...register('otp')} />
        </Field>
        <Field label="New password" htmlFor="newPassword" error={errors.newPassword?.message} required>
          <Input id="newPassword" type="password" {...register('newPassword')} />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
          <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
        </Field>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </AuthShell>
  )
}
