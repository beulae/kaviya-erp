import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/auth-shell'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas/auth-schemas'
import { useToast } from '@/components/ui/toaster'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    await new Promise((r) => setTimeout(r, 500))
    toast({ title: 'OTP sent', description: `Check ${values.email} for your verification code.`, variant: 'success' })
    navigate('/reset-password', { state: { email: values.email } })
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="We'll send a one-time code to your registered email.">
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Email" htmlFor="email" error={errors.email?.message} required>
          <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
        </Field>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Send OTP
        </Button>
        <p className="text-center text-sm text-[var(--color-muted-foreground)]">
          <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">
            Back to login
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}
