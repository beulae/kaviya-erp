import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../components/auth-shell'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '../api/auth-context'
import { registerSchema, type RegisterFormValues } from '../schemas/auth-schemas'
import { useToast } from '@/components/ui/toaster'

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values: RegisterFormValues) => {
    await registerUser(values)
    toast({ title: 'Account created', description: 'Welcome to Kaviya Roadways ERP.', variant: 'success' })
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthShell
      title="Create your company account"
      subtitle="Set up Kaviya Roadways ERP for your transport business."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Field label="Company name" htmlFor="companyName" error={errors.companyName?.message} required>
          <Input id="companyName" placeholder="Kaviya Roadways and Logistics Services" {...register('companyName')} />
        </Field>
        <Field label="Owner name" htmlFor="ownerName" error={errors.ownerName?.message} required>
          <Input id="ownerName" placeholder="Full name" {...register('ownerName')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mobile" htmlFor="mobile" error={errors.mobile?.message} required>
            <Input id="mobile" placeholder="98765 43210" {...register('mobile')} />
          </Field>
          <Field label="Email" htmlFor="email" error={errors.email?.message} required>
            <Input id="email" type="email" placeholder="you@company.com" {...register('email')} />
          </Field>
        </div>
        <Field label="GST number" htmlFor="gstNumber" error={errors.gstNumber?.message} required>
          <Input id="gstNumber" placeholder="33ABCDE1234F1Z5" className="uppercase" {...register('gstNumber')} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Password" htmlFor="password" error={errors.password?.message} required>
            <Input id="password" type="password" {...register('password')} />
          </Field>
          <Field label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message} required>
            <Input id="confirmPassword" type="password" {...register('confirmPassword')} />
          </Field>
        </div>
        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthShell>
  )
}
