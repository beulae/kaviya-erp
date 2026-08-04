import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthShell } from '../components/auth-shell'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '../api/auth-context'
import { loginSchema, type LoginFormValues } from '../schemas/auth-schemas'
import { useToast } from '@/components/ui/toaster'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), defaultValues: { rememberMe: true } })

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null)
    try {
      await login(values)
      toast({ title: 'Welcome back', description: 'You have been signed in.', variant: 'success' })
      const redirectTo = (location.state as { from?: string })?.from || '/dashboard'
      navigate(redirectTo, { replace: true })
    } catch {
      setServerError('Invalid email/mobile or password. Please try again.')
    }
  }

  return (
    <AuthShell
      title="Sign in to your account"
      subtitle="Enter your details to access the Kaviya Roadways dashboard."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-[var(--color-primary)] hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-3 text-sm text-[var(--color-danger)]">
            {serverError}
          </div>
        )}
        <Field label="Email or mobile number" htmlFor="identifier" error={errors.identifier?.message} required>
          <Input id="identifier" placeholder="you@company.com" autoComplete="username" {...register('identifier')} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password?.message} required>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
          />
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--color-border)]"
              {...register('rememberMe')}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-[var(--color-primary)] hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Login
        </Button>
      </form>
    </AuthShell>
  )
}
