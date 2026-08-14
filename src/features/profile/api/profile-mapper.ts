import type { EditProfileFormValues } from '../schemas/profile-schema'

/**
 * Builds the multipart payload for the profile update endpoint. Kept
 * separate from the JSX/page so form components never construct FormData
 * themselves.
 */
export function buildProfileFormData(values: EditProfileFormValues): FormData {
  const formData = new FormData()

  const appendText = (key: string, value: string | undefined) => {
    if (value) formData.append(key, value)
  }

  appendText('transporterName', values.transporterName)
  appendText('aboutTransport', values.aboutTransport)
  appendText('riskType', values.riskType)
  appendText('userType', values.userType)

  appendText('registrationNumber', values.registrationNumber)
  appendText('gstNumber', values.gstNumber)
  values.dailyService.forEach((service) => formData.append('dailyService', service))

  appendText('city', values.city)
  appendText('state', values.state)
  appendText('address', values.address)

  appendText('contactNo1', values.contactNo1)
  appendText('contactNo2', values.contactNo2)
  appendText('contactNo3', values.contactNo3)
  appendText('email', values.email)
  appendText('officeBranch', values.officeBranch)
  appendText('website', values.website)

  appendText('bankAccountNumber', values.bankAccountNumber)
  appendText('bankName', values.bankName)
  appendText('ifscCode', values.ifscCode)
  appendText('accountHolderName', values.accountHolderName)

  appendText('panNumber', values.panNumber)
  appendText('panCardName', values.panCardName)

  formData.append('removeLogo', String(values.removeLogo))
  if (values.logoFile) formData.append('logoFile', values.logoFile)

  appendText('signatureMethod', values.signatureMethod)
  if (values.signatureMethod === 'pad' && values.signaturePad) {
    formData.append('signaturePad', values.signaturePad)
  }
  if (values.signatureMethod === 'upload' && values.signatureFile) {
    formData.append('signatureFile', values.signatureFile)
  }

  return formData
}
