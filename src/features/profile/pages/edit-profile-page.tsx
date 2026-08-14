import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multi-select'
import { useToast } from '@/components/ui/toaster'
import { getApiErrorMessage } from '@/api/axios-instance'

import { editProfileSchema, type EditProfileFormValues } from '../schemas/profile-schema'
import { useProfile, useUpdateProfile, useDeleteLogo } from '../api/use-profile'
import { buildProfileFormData } from '../api/profile-mapper'
import { ProfileLogoUpload } from '../components/profile-logo-upload'
import { ProfileSignatureSection } from '../components/profile-signature-section'
import {
  RISK_TYPE_OPTIONS,
  USER_TYPE_OPTIONS,
  STATE_OPTIONS,
  OFFICE_BRANCH_OPTIONS,
  DAILY_SERVICE_OPTIONS,
} from '../constants/options'
import type { TransporterProfile } from '@/types/profile'

const EMPTY_DEFAULTS: EditProfileFormValues = {
  transporterName: '',
  aboutTransport: '',
  riskType: 'owner',
  userType: 'fleetOwner',
  registrationNumber: '',
  gstNumber: '',
  dailyService: [],
  city: '',
  state: '',
  address: '',
  contactNo1: '',
  contactNo2: '',
  contactNo3: '',
  email: '',
  officeBranch: '',
  website: '',
  bankAccountNumber: '',
  bankName: '',
  ifscCode: '',
  accountHolderName: '',
  panNumber: '',
  panCardName: '',
  existingLogoUrl: '',
  removeLogo: false,
  logoFile: undefined,
  signatureMethod: 'pad',
  existingSignatureUrl: '',
  signaturePad: '',
  signatureFile: undefined,
}

function profileToFormValues(profile: TransporterProfile): EditProfileFormValues {
  return {
    transporterName: profile.transporterName,
    aboutTransport: profile.aboutTransport ?? '',
    riskType: profile.riskType,
    userType: profile.userType,
    registrationNumber: profile.registrationNumber ?? '',
    gstNumber: profile.gstNumber ?? '',
    dailyService: profile.dailyService,
    city: profile.city,
    state: profile.state,
    address: profile.address,
    contactNo1: profile.contactNo1,
    contactNo2: profile.contactNo2 ?? '',
    contactNo3: profile.contactNo3 ?? '',
    email: profile.email,
    officeBranch: profile.officeBranch ?? '',
    website: profile.website ?? '',
    bankAccountNumber: profile.bankAccountNumber ?? '',
    bankName: profile.bankName ?? '',
    ifscCode: profile.ifscCode ?? '',
    accountHolderName: profile.accountHolderName ?? '',
    panNumber: profile.panNumber ?? '',
    panCardName: profile.panCardName ?? '',
    existingLogoUrl: profile.logoUrl ?? '',
    removeLogo: false,
    logoFile: undefined,
    signatureMethod: profile.signatureMethod,
    existingSignatureUrl: profile.signatureUrl ?? '',
    signaturePad: '',
    signatureFile: undefined,
  }
}

export default function EditProfilePage() {
  const { toast } = useToast()
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const deleteLogo = useDeleteLogo()

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormValues>({
    // `any` cast: zod's cross-field `superRefine` output type diverges from
    // the strict Resolver generic here (same class of friction the project
    // already works around for `coerce.number()` on the Bilty/Quotation
    // forms) — safe in practice since the runtime shape matches.
    resolver: zodResolver(editProfileSchema) as any,
    defaultValues: EMPTY_DEFAULTS,
  })

  React.useEffect(() => {
    if (profile) reset(profileToFormValues(profile))
  }, [profile, reset])

  const signatureMethod = watch('signatureMethod')
  const signaturePad = watch('signaturePad')
  const signatureFile = watch('signatureFile')
  const existingSignatureUrl = watch('existingSignatureUrl')
  const existingLogoUrl = watch('existingLogoUrl')
  const logoFile = watch('logoFile')

  const handleDeleteLogo = async () => {
    try {
      const updated = await deleteLogo.mutateAsync()
      setValue('existingLogoUrl', updated.logoUrl ?? '', { shouldDirty: false })
      setValue('logoFile', undefined, { shouldDirty: false })
      toast({ title: 'Logo removed', description: 'The company logo has been deleted.', variant: 'success' })
    } catch (error) {
      toast({ title: 'Delete failed', description: getApiErrorMessage(error), variant: 'error' })
    }
  }

  const onSubmit = async (values: EditProfileFormValues) => {
    try {
      const formData = buildProfileFormData(values)
      const updated = await updateProfile.mutateAsync(formData)
      reset(profileToFormValues(updated))
      toast({
        title: 'Profile updated',
        description: 'Your transporter profile has been updated successfully.',
        variant: 'success',
      })
    } catch (error) {
      toast({ title: 'Update failed', description: getApiErrorMessage(error), variant: 'error' })
    }
  }

  return (
    <div>
      <PageHeader
        title="Edit Profile"
        description="Manage your transporter company information, contact details, banking information and digital signature."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Transporter Name"
                htmlFor="transporterName"
                error={errors.transporterName?.message}
                required
              >
                <Input id="transporterName" placeholder="Enter transporter name" {...register('transporterName')} />
              </Field>
              <Field label="About Transport" htmlFor="aboutTransport" error={errors.aboutTransport?.message}>
                <Input
                  id="aboutTransport"
                  placeholder="Transport Contractor / Commission Agent / Broker"
                  {...register('aboutTransport')}
                />
              </Field>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-[var(--color-foreground)]">
                Risk Type <span className="text-[var(--color-danger)]">*</span>
              </legend>
              <div className="flex flex-wrap gap-4">
                {RISK_TYPE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                    <input
                      type="radio"
                      value={opt.value}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                      {...register('riskType')}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.riskType && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.riskType.message}</p>}
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-[var(--color-foreground)]">
                User Type <span className="text-[var(--color-danger)]">*</span>
              </legend>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                {USER_TYPE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                    <input
                      type="radio"
                      value={opt.value}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                      {...register('userType')}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              {errors.userType && <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.userType.message}</p>}
            </fieldset>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registration & Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                label="Registration Number"
                htmlFor="registrationNumber"
                error={errors.registrationNumber?.message}
              >
                <Input id="registrationNumber" {...register('registrationNumber')} />
              </Field>
              <Field
                label="GST Number"
                htmlFor="gstNumber"
                error={errors.gstNumber?.message}
                hint="Maximum 15 characters"
              >
                <Input
                  id="gstNumber"
                  maxLength={15}
                  className="uppercase"
                  {...register('gstNumber')}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase()
                    register('gstNumber').onChange(e)
                  }}
                />
              </Field>
              <Field label="Daily Service" htmlFor="dailyService" error={errors.dailyService?.message}>
                <Controller
                  control={control}
                  name="dailyService"
                  render={({ field }) => (
                    <MultiSelect
                      id="dailyService"
                      options={DAILY_SERVICE_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select service coverage"
                      error={!!errors.dailyService}
                    />
                  )}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact & Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="City" htmlFor="city" error={errors.city?.message} required>
                <Input id="city" {...register('city')} />
              </Field>
              <Field label="State" htmlFor="state" error={errors.state?.message} required>
                <Select id="state" placeholder="Select state" options={STATE_OPTIONS} {...register('state')} />
              </Field>
              <Field
                label="Address"
                htmlFor="address"
                error={errors.address?.message}
                required
                className="sm:col-span-2 lg:col-span-2"
              >
                <Textarea id="address" rows={2} {...register('address')} />
              </Field>
              <Field
                label="Contact Number 1"
                htmlFor="contactNo1"
                error={errors.contactNo1?.message}
                required
                hint="Maximum 10 digits"
              >
                <Input id="contactNo1" type="tel" maxLength={10} {...register('contactNo1')} />
              </Field>
              <Field
                label="Contact Number 2"
                htmlFor="contactNo2"
                error={errors.contactNo2?.message}
                hint="Maximum 10 digits"
              >
                <Input id="contactNo2" type="tel" maxLength={10} {...register('contactNo2')} />
              </Field>
              <Field
                label="Contact Number 3"
                htmlFor="contactNo3"
                error={errors.contactNo3?.message}
                hint="Maximum 10 digits"
              >
                <Input id="contactNo3" type="tel" maxLength={10} {...register('contactNo3')} />
              </Field>
              <Field label="Email" htmlFor="email" error={errors.email?.message} required>
                <Input id="email" type="email" {...register('email')} />
              </Field>
              <Field label="Office Branch" htmlFor="officeBranch" error={errors.officeBranch?.message}>
                <Select
                  id="officeBranch"
                  placeholder="Select branch"
                  options={OFFICE_BRANCH_OPTIONS}
                  {...register('officeBranch')}
                />
              </Field>
              <Field label="Website" htmlFor="website" error={errors.website?.message}>
                <Input id="website" type="url" placeholder="https://example.com" {...register('website')} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banking Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Bank Account Number" htmlFor="bankAccountNumber" error={errors.bankAccountNumber?.message}>
                <Input id="bankAccountNumber" inputMode="numeric" {...register('bankAccountNumber')} />
              </Field>
              <Field label="Bank Name" htmlFor="bankName" error={errors.bankName?.message}>
                <Input id="bankName" {...register('bankName')} />
              </Field>
              <Field label="IFSC Code" htmlFor="ifscCode" error={errors.ifscCode?.message}>
                <Input
                  id="ifscCode"
                  maxLength={11}
                  className="uppercase"
                  {...register('ifscCode')}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase()
                    register('ifscCode').onChange(e)
                  }}
                />
              </Field>
              <Field label="Account Holder Name" htmlFor="accountHolderName" error={errors.accountHolderName?.message}>
                <Input id="accountHolderName" {...register('accountHolderName')} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PAN Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="PAN Number"
                htmlFor="panNumber"
                error={errors.panNumber?.message}
                hint="Maximum 10 characters"
              >
                <Input
                  id="panNumber"
                  maxLength={10}
                  className="uppercase"
                  {...register('panNumber')}
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase()
                    register('panNumber').onChange(e)
                  }}
                />
              </Field>
              <Field label="PAN Card Name" htmlFor="panCardName" error={errors.panCardName?.message}>
                <Input id="panCardName" {...register('panCardName')} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileLogoUpload
              existingLogoUrl={existingLogoUrl || undefined}
              file={logoFile}
              onFileChange={(file) => setValue('logoFile', file, { shouldDirty: true })}
              onDelete={handleDeleteLogo}
              isDeleting={deleteLogo.isPending}
              error={errors.logoFile?.message}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>E-Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileSignatureSection
              signatureMethod={signatureMethod}
              onSignatureMethodChange={(method) => setValue('signatureMethod', method, { shouldDirty: true })}
              signaturePad={signaturePad}
              onSignaturePadChange={(dataUrl) =>
                setValue('signaturePad', dataUrl, { shouldDirty: true, shouldValidate: true })
              }
              signatureFile={signatureFile}
              onSignatureFileChange={(file) =>
                setValue('signatureFile', file, { shouldDirty: true, shouldValidate: true })
              }
              existingSignatureUrl={existingSignatureUrl || undefined}
              padError={errors.signaturePad?.message}
              fileError={errors.signatureFile?.message}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="submit" loading={updateProfile.isPending} disabled={isLoading || !isDirty}>
            Update Profile
          </Button>
        </div>
      </form>
    </div>
  )
}
