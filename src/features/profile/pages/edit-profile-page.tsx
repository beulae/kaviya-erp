import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { MultiSelect } from '@/components/ui/multi-select'
import { useToast } from '@/components/ui/toaster'
import { getApiErrorMessage } from '@/api/axios-instance'

import { editProfileSchema, type EditProfileFormValues } from '../schemas/profile-schema'
import { useProfile, useUpdateProfile, useDeleteLogo, useDailyServices } from '../api/use-profile'
import { buildProfilePayload } from '../api/profile-mapper'
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

const CONTROL_CLASS = 'min-h-8 h-8 text-xs'

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
    logoFile: undefined,
    signatureMethod: profile.signatureMethod,
    existingSignatureUrl: profile.signatureUrl ?? '',
    signaturePad: '',
    signatureFile: undefined,
  }
}

export default function EditProfilePage() {
  const { toast } = useToast()
  const { data: profile, isLoading, isError, error, refetch } = useProfile()
  const dailyServices = useDailyServices()
  const updateProfile = useUpdateProfile()
  const deleteLogo = useDeleteLogo()
  const hasLoadedProfile = React.useRef(false)
  const dailyServiceOptions = React.useMemo(
    () =>
      dailyServices.data
        ? dailyServices.data.map((service) => ({
            value: String(service.dailyServiceId),
            label: service.serviceName,
          }))
        : DAILY_SERVICE_OPTIONS,
    [dailyServices.data],
  )

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormValues>({
    // Zod's cross-field refinement widens the inferred resolver type; the
    // form's runtime values still match this schema.
    resolver: zodResolver(editProfileSchema) as any,
    defaultValues: EMPTY_DEFAULTS,
  })

  React.useEffect(() => {
    if (profile && dailyServices.isFetched && !hasLoadedProfile.current) {
      const serviceValues = dailyServices.data?.map((service) => ({
        id: String(service.dailyServiceId),
        name: service.serviceName,
      }))
      reset({
        ...profileToFormValues(profile),
        dailyService: profile.dailyService.map(
          (selected) =>
            serviceValues?.find(
              (service) => service.id === selected || service.name.toLowerCase() === selected.toLowerCase(),
            )?.id ?? selected,
        ),
      })
      hasLoadedProfile.current = true
    }
  }, [dailyServices.data, dailyServices.isFetched, profile, reset])

  const signatureMethod = watch('signatureMethod')
  const signaturePad = watch('signaturePad')
  const signatureFile = watch('signatureFile')
  const existingSignatureUrl = watch('existingSignatureUrl')
  const existingLogoUrl = watch('existingLogoUrl')
  const logoFile = watch('logoFile')

  const handleDeleteLogo = async () => {
    if (!profile) return
    try {
      const updated = await deleteLogo.mutateAsync({ id: profile.id, documents: profile.documents ?? [] })
      setValue('existingLogoUrl', updated.logoUrl ?? '', { shouldDirty: false })
      setValue('logoFile', undefined, { shouldDirty: false })
      setValue('existingSignatureUrl', updated.signatureUrl ?? '', { shouldDirty: false })
      toast({ title: 'Logo removed', description: 'The company logo has been deleted.', variant: 'success' })
    } catch (deleteError) {
      toast({ title: 'Delete failed', description: getApiErrorMessage(deleteError), variant: 'error' })
    }
  }

  const onSubmit = async (values: EditProfileFormValues) => {
    try {
      const payload = await buildProfilePayload(values, profile)
      const updated = await updateProfile.mutateAsync({ id: profile?.id, payload })
      reset(profileToFormValues(updated))
      toast({
        title: 'Profile updated',
        description: 'Your transporter profile has been updated successfully.',
        variant: 'success',
      })
    } catch (submitError) {
      toast({ title: 'Update failed', description: getApiErrorMessage(submitError), variant: 'error' })
    }
  }

  return (
    <div>
      <PageHeader title="Edit Profile" />

      {isLoading && (
        <Card>
          <CardContent>
            <p className="py-8 text-center text-sm text-[var(--color-muted-foreground)]" role="status">
              Loading transporter profile…
            </p>
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-[var(--color-danger)]">
              {error ? getApiErrorMessage(error) : 'The transporter profile could not be loaded.'}
            </p>
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Card>
            <CardContent className="space-y-5 p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-4">
                <Field
                  label="Transporter Name"
                  htmlFor="transporterName"
                  error={errors.transporterName?.message}
                  required
                  className="lg:col-span-3"
                >
                  <Input id="transporterName" className={CONTROL_CLASS} {...register('transporterName')} />
                </Field>
                <Field
                  label="About Transport"
                  htmlFor="aboutTransport"
                  error={errors.aboutTransport?.message}
                  className="lg:col-span-3"
                >
                  <Input id="aboutTransport" className={CONTROL_CLASS} {...register('aboutTransport')} />
                </Field>
                <fieldset className="lg:col-span-3">
                  <legend className="mb-2 text-sm font-medium text-[var(--color-foreground)]">
                    Risk Type <span className="text-[var(--color-danger)]">*</span>
                  </legend>
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    {RISK_TYPE_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          value={option.value}
                          className="h-4 w-4 accent-[var(--color-primary)]"
                          {...register('riskType')}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {errors.riskType && (
                    <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.riskType.message}</p>
                  )}
                </fieldset>
                <fieldset className="lg:col-span-3">
                  <legend className="mb-2 text-sm font-medium text-[var(--color-foreground)]">
                    User Type <span className="text-[var(--color-danger)]">*</span>
                  </legend>
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    {USER_TYPE_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          value={option.value}
                          className="h-4 w-4 accent-[var(--color-primary)]"
                          {...register('userType')}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                  {errors.userType && (
                    <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.userType.message}</p>
                  )}
                </fieldset>
                <div className="lg:col-start-4 lg:row-start-1 lg:row-span-4">
                  <ProfileLogoUpload
                    existingLogoUrl={existingLogoUrl || undefined}
                    file={logoFile}
                    onFileChange={(file) => setValue('logoFile', file, { shouldDirty: true, shouldValidate: true })}
                    onDelete={() => void handleDeleteLogo()}
                    isDeleting={deleteLogo.isPending}
                    error={errors.logoFile?.message}
                  />
                </div>
              </div>

              <section className="grid grid-cols-1 gap-3 border-t border-[var(--color-border)] pt-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Registration Number" htmlFor="registrationNumber" error={errors.registrationNumber?.message}>
                  <Input id="registrationNumber" className={CONTROL_CLASS} {...register('registrationNumber')} />
                </Field>
                <Field label="GST Number" htmlFor="gstNumber" error={errors.gstNumber?.message}>
                  <Input
                    id="gstNumber"
                    maxLength={15}
                    className={`${CONTROL_CLASS} uppercase`}
                    {...register('gstNumber', {
                      onChange: (event) => {
                        event.target.value = event.target.value.toUpperCase()
                      },
                    })}
                  />
                </Field>
                <Field label="Daily Service" htmlFor="dailyService" error={errors.dailyService?.message} required>
                  <Controller
                    control={control}
                    name="dailyService"
                    render={({ field }) => (
                      <MultiSelect
                        id="dailyService"
                        options={dailyServiceOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select service coverage"
                        error={!!errors.dailyService}
                        className={CONTROL_CLASS}
                      />
                    )}
                  />
                  {dailyServices.isError && (
                    <p className="mt-1 text-xs text-[var(--color-danger)]" role="status">
                      Could not load service areas ({getApiErrorMessage(dailyServices.error)}). Standard choices are
                      shown as a fallback.
                      <button
                        type="button"
                        className="ml-1 underline"
                        onClick={() => void dailyServices.refetch()}
                      >
                        Retry
                      </button>
                    </p>
                  )}
                </Field>
                <Field label="City" htmlFor="city" error={errors.city?.message} required>
                  <Input id="city" className={CONTROL_CLASS} {...register('city')} />
                </Field>
                <Field label="State" htmlFor="state" error={errors.state?.message} required>
                  <Select
                    id="state"
                    placeholder="Select state"
                    options={STATE_OPTIONS}
                    className={CONTROL_CLASS}
                    {...register('state')}
                  />
                </Field>
                <Field label="Address" htmlFor="address" error={errors.address?.message} required>
                  <Input id="address" className={CONTROL_CLASS} {...register('address')} />
                </Field>
                <Field label="Contact No. 1" htmlFor="contactNo1" error={errors.contactNo1?.message} required>
                  <Input id="contactNo1" type="tel" maxLength={10} className={CONTROL_CLASS} {...register('contactNo1')} />
                </Field>
                <Field label="Contact No. 2" htmlFor="contactNo2" error={errors.contactNo2?.message}>
                  <Input id="contactNo2" type="tel" maxLength={10} className={CONTROL_CLASS} {...register('contactNo2')} />
                </Field>
                <Field label="Contact No. 3" htmlFor="contactNo3" error={errors.contactNo3?.message}>
                  <Input id="contactNo3" type="tel" maxLength={10} className={CONTROL_CLASS} {...register('contactNo3')} />
                </Field>
                <Field label="Email" htmlFor="email" error={errors.email?.message} required>
                  <Input id="email" type="email" className={CONTROL_CLASS} {...register('email')} />
                </Field>
                <Field label="Office Branch" htmlFor="officeBranch" error={errors.officeBranch?.message}>
                  <Select
                    id="officeBranch"
                    placeholder="Select branch"
                    options={OFFICE_BRANCH_OPTIONS}
                    className={CONTROL_CLASS}
                    {...register('officeBranch')}
                  />
                </Field>
                <Field label="Website" htmlFor="website" error={errors.website?.message}>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    className={CONTROL_CLASS}
                    {...register('website')}
                  />
                </Field>
                <Field label="Bank Account Number" htmlFor="bankAccountNumber" error={errors.bankAccountNumber?.message}>
                  <Input
                    id="bankAccountNumber"
                    inputMode="numeric"
                    className={CONTROL_CLASS}
                    {...register('bankAccountNumber')}
                  />
                </Field>
                <Field label="Bank Name" htmlFor="bankName" error={errors.bankName?.message}>
                  <Input id="bankName" className={CONTROL_CLASS} {...register('bankName')} />
                </Field>
                <Field label="IFSC Code" htmlFor="ifscCode" error={errors.ifscCode?.message}>
                  <Input
                    id="ifscCode"
                    maxLength={11}
                    className={`${CONTROL_CLASS} uppercase`}
                    {...register('ifscCode', {
                      onChange: (event) => {
                        event.target.value = event.target.value.toUpperCase()
                      },
                    })}
                  />
                </Field>
                <Field label="PAN Number" htmlFor="panNumber" error={errors.panNumber?.message}>
                  <Input
                    id="panNumber"
                    maxLength={10}
                    className={`${CONTROL_CLASS} uppercase`}
                    {...register('panNumber', {
                      onChange: (event) => {
                        event.target.value = event.target.value.toUpperCase()
                      },
                    })}
                  />
                </Field>
                <Field label="PAN Card Name" htmlFor="panCardName" error={errors.panCardName?.message}>
                  <Input id="panCardName" className={CONTROL_CLASS} {...register('panCardName')} />
                </Field>
                <Field label="Account Holder Name" htmlFor="accountHolderName" error={errors.accountHolderName?.message}>
                  <Input id="accountHolderName" className={CONTROL_CLASS} {...register('accountHolderName')} />
                </Field>
              </section>

              <section className="border-t border-[var(--color-border)] pt-4">
                <ProfileSignatureSection
                  signatureMethod={signatureMethod}
                  onSignatureMethodChange={(method) =>
                    setValue('signatureMethod', method, { shouldDirty: true, shouldValidate: true })
                  }
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
              </section>

              <div className="flex justify-center border-t border-[var(--color-border)] pt-4">
                <Button
                  type="submit"
                  className="w-full max-w-md"
                  loading={updateProfile.isPending}
                  disabled={!isDirty}
                >
                  Update Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}
