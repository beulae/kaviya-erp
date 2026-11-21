import { z } from 'zod'

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
const PHONE_REGEX = /^[6-9]\d{9}$/

export const partySchema = z.object({
  partyName: z.string().trim().min(2, 'Party name is required.'),
  contactNumber: z
    .string()
    .trim()
    .refine((v) => v === '' || PHONE_REGEX.test(v), 'Enter a valid 10-digit mobile number.'),
  gstin: z
    .string()
    .trim()
    .refine((v) => v === '' || GSTIN_REGEX.test(v), 'Enter a valid GSTIN.'),
  email: z
    .string()
    .trim()
    .refine((v) => v === '' || z.email().safeParse(v).success, 'Enter a valid email.'),
  address: z.string().trim().min(1, 'Address is required.'),
})

export type PartyFormValues = z.infer<typeof partySchema>
