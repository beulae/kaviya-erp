import { z } from 'zod'
import { LOGO_ACCEPTED_TYPES, SIGNATURE_ACCEPTED_TYPES, MAX_UPLOAD_SIZE_BYTES } from '../constants/options'

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/
const PHONE_REGEX = /^[6-9]\d{9}$/

const isValidUrl = (value: string) => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

const optionalText = (max?: number) => {
  const base = max ? z.string().trim().max(max) : z.string().trim()
  return base.optional().or(z.literal(''))
}

export const editProfileSchema = z
  .object({
    transporterName: z.string().trim().min(2, 'Transporter name is required.'),
    aboutTransport: optionalText(500),

    riskType: z.enum(['owner', 'carrier'], { error: 'Select a risk type.' }),
    userType: z.enum(['fleetOwner', 'broker'], { error: 'Select a user type.' }),

    registrationNumber: optionalText(50),
    gstNumber: optionalText(15),
    dailyService: z.array(z.string()).default([]),

    city: z.string().trim().min(1, 'City is required.'),
    state: z.string().trim().min(1, 'State is required.'),
    address: z.string().trim().min(5, 'Address is required.'),

    contactNo1: z.string().trim().regex(PHONE_REGEX, 'Contact number must contain 10 digits.'),
    contactNo2: z
      .string()
      .trim()
      .regex(PHONE_REGEX, 'Contact number must contain 10 digits.')
      .optional()
      .or(z.literal('')),
    contactNo3: z
      .string()
      .trim()
      .regex(PHONE_REGEX, 'Contact number must contain 10 digits.')
      .optional()
      .or(z.literal('')),
    email: z.string().trim().toLowerCase().pipe(z.email('Please enter a valid email address.')),
    officeBranch: optionalText(100),
    website: optionalText(200),

    bankAccountNumber: optionalText(30),
    bankName: optionalText(100),
    ifscCode: optionalText(11),
    accountHolderName: optionalText(100),

    panNumber: optionalText(10),
    panCardName: optionalText(100),

    // Logo
    existingLogoUrl: z.string().optional().or(z.literal('')),
    removeLogo: z.boolean().default(false),
    logoFile: z.instanceof(File).optional(),

    // Signature
    signatureMethod: z.enum(['pad', 'upload'], { error: 'Please select a signature method.' }).default('pad'),
    existingSignatureUrl: z.string().optional().or(z.literal('')),
    signaturePad: z.string().optional().or(z.literal('')),
    signatureFile: z.instanceof(File).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.gstNumber && !GSTIN_REGEX.test(values.gstNumber)) {
      ctx.addIssue({ code: 'custom', message: 'Please enter a valid GST number.', path: ['gstNumber'] })
    }
    if (values.panNumber && !PAN_REGEX.test(values.panNumber)) {
      ctx.addIssue({ code: 'custom', message: 'Please enter a valid PAN number.', path: ['panNumber'] })
    }
    if (values.ifscCode && !IFSC_REGEX.test(values.ifscCode)) {
      ctx.addIssue({ code: 'custom', message: 'Please enter a valid IFSC code.', path: ['ifscCode'] })
    }
    if (values.website && !isValidUrl(values.website)) {
      ctx.addIssue({ code: 'custom', message: 'Please enter a valid website URL.', path: ['website'] })
    }
    if (values.logoFile) {
      if (!LOGO_ACCEPTED_TYPES.includes(values.logoFile.type)) {
        ctx.addIssue({ code: 'custom', message: 'Logo must be a PNG, JPG or WEBP image.', path: ['logoFile'] })
      }
      if (values.logoFile.size > MAX_UPLOAD_SIZE_BYTES) {
        ctx.addIssue({ code: 'custom', message: 'Logo must be 2 MB or smaller.', path: ['logoFile'] })
      }
    }
    if (values.signatureMethod === 'upload') {
      if (values.signatureFile) {
        if (!SIGNATURE_ACCEPTED_TYPES.includes(values.signatureFile.type)) {
          ctx.addIssue({ code: 'custom', message: 'Signature must be a PNG or JPG image.', path: ['signatureFile'] })
        }
        if (values.signatureFile.size > MAX_UPLOAD_SIZE_BYTES) {
          ctx.addIssue({ code: 'custom', message: 'Signature must be 2 MB or smaller.', path: ['signatureFile'] })
        }
      } else if (!values.existingSignatureUrl) {
        ctx.addIssue({ code: 'custom', message: 'Upload a signature file.', path: ['signatureFile'] })
      }
    }
    if (values.signatureMethod === 'pad' && !values.signaturePad && !values.existingSignatureUrl) {
      ctx.addIssue({ code: 'custom', message: 'Please draw your signature.', path: ['signaturePad'] })
    }
  })

export type EditProfileFormValues = z.infer<typeof editProfileSchema>
