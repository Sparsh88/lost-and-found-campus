import { z } from 'zod'
import { ITEM_CATEGORIES, LOST_ITEM_STATUSES, FOUND_ITEM_STATUSES } from './constants'

export function formatZodError(validation, fallback = 'Invalid input data') {
  if (!validation || validation.success) return ''
  const issues = validation.error?.issues || validation.error?.errors || []
  return issues[0]?.message || fallback
}

const phoneRegex = /^[+]?[\d\s-]{8,16}$/

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80),
  email: z.string().trim().email('Please enter a valid campus email address'),
  registrationNumber: z
    .string()
    .trim()
    .min(3, 'Registration / Roll number is required (at least 3 characters)')
    .max(40),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Please enter a valid mobile number (8–15 digits)'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
})

export const AdminRegisterSchema = z.object({
  name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(80),
  registrationNumber: z
    .string()
    .trim()
    .min(3, 'Admin / Staff ID is required (at least 3 characters)')
    .max(40),
  email: z.string().trim().email('Please enter a valid campus email address'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Please enter a valid mobile number (8–15 digits)'),
  role: z.enum(['admin', 'security']).default('admin'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  enrollmentKey: z.string().trim().optional().or(z.literal('')),
})

export const StudentLoginSchema = z.object({
  registrationNumber: z
    .string({ required_error: 'University Registration Number is required' })
    .trim()
    .min(3, 'University Registration Number must be at least 3 characters')
    .max(40)
    .refine(
      (val) => !val.includes('@'),
      'Please enter your University Registration Number, not your email address'
    ),
  password: z.string().min(1, 'Password is required'),
})

export const LoginSchema = z
  .object({
    registrationNumber: z.string().trim().optional(),
    adminId: z.string().trim().optional(),
    identifier: z.string().trim().optional(),
    email: z.string().trim().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine(
    (data) =>
      Boolean(
        (data.registrationNumber && data.registrationNumber.length >= 2) ||
          (data.adminId && data.adminId.length >= 2) ||
          (data.identifier && data.identifier.length >= 2) ||
          (data.email && data.email.length >= 3)
      ),
    { message: 'ID / Registration Number is required' }
  )

export const LostItemCreateSchema = z.object({
  itemName: z.string().trim().min(3, 'Item name must be at least 3 characters').max(120),
  category: z.enum(ITEM_CATEGORIES),
  description: z.string().trim().min(10, 'Detailed description must be at least 10 characters').max(2000),
  lostDate: z.string().trim().min(1, 'Lost date is required'),
  lostLocation: z.string().trim().min(2, 'Lost location is required').max(150),
  imageUrl: z.string().trim().optional().or(z.literal('')),
  imagePublicId: z.string().trim().optional().or(z.literal('')),
  identifyingDetails: z.string().trim().max(1500).optional().or(z.literal('')),
})

export const LostItemUpdateSchema = z.object({
  itemName: z.string().trim().min(3).max(120).optional(),
  category: z.enum(ITEM_CATEGORIES).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  lostDate: z.string().trim().min(1).optional(),
  lostLocation: z.string().trim().min(2).max(150).optional(),
  imageUrl: z.string().trim().optional().or(z.literal('')),
  imagePublicId: z.string().trim().optional().or(z.literal('')),
  identifyingDetails: z.string().trim().max(1500).optional().or(z.literal('')),
  status: z.enum(LOST_ITEM_STATUSES).optional(),
})

export const FinderSubmissionSchema = z.object({
  finderName: z.string().trim().min(2, 'Full name is required').max(80),
  registrationNumber: z.string().trim().min(3, 'Registration number is required').max(40),
  mobileNumber: z
    .string()
    .trim()
    .regex(phoneRegex, 'Please enter a valid mobile number'),
  message: z
    .string()
    .trim()
    .min(10, 'Please provide helpful details about finding the item (at least 10 characters)')
    .max(2000),
  photoFileId: z.string().trim().optional().or(z.literal('')),
  photoFileName: z.string().trim().optional().or(z.literal('')),
})

export const FoundItemCreateSchema = z.object({
  itemName: z.string().trim().min(3, 'Item name must be at least 3 characters').max(120),
  category: z.enum(ITEM_CATEGORIES),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  foundDate: z.string().trim().min(1, 'Found date is required'),
  foundTime: z.string().trim().optional().or(z.literal('')),
  foundLocation: z.string().trim().min(2, 'Found location is required').max(150),
  imageUrl: z.string().trim().optional().or(z.literal('')),
  imagePublicId: z.string().trim().optional().or(z.literal('')),
  hiddenIdentifyingDetails: z.string().trim().max(1500).optional().or(z.literal('')),
  custodyOffice: z.string().trim().max(150).optional().or(z.literal('')),
})

export const FoundItemUpdateSchema = z.object({
  itemName: z.string().trim().min(3).max(120).optional(),
  category: z.enum(ITEM_CATEGORIES).optional(),
  description: z.string().trim().min(10).max(2000).optional(),
  foundDate: z.string().trim().min(1).optional(),
  foundTime: z.string().trim().optional().or(z.literal('')),
  foundLocation: z.string().trim().min(2).max(150).optional(),
  imageUrl: z.string().trim().optional().or(z.literal('')),
  imagePublicId: z.string().trim().optional().or(z.literal('')),
  hiddenIdentifyingDetails: z.string().trim().max(1500).optional().or(z.literal('')),
  custodyOffice: z.string().trim().max(150).optional().or(z.literal('')),
  shelfBin: z.string().trim().max(60).optional().or(z.literal('')),
  status: z.enum(FOUND_ITEM_STATUSES).optional(),
})

const PrivateFileRefSchema = z
  .object({
    fileId: z.string().trim().min(1),
    originalName: z.string().trim().min(1).max(255),
    mimeType: z.string().trim().min(1).max(100),
    size: z.number().int().positive().max(6 * 1024 * 1024),
  })
  .nullable()
  .optional()

export const ClaimCreateSchema = z.object({
  foundItemId: z.string().trim().min(1, 'Found item ID is required'),
  fullName: z.string().trim().min(2, 'Full name is required').max(80),
  registrationNumber: z.string().trim().min(3, 'Registration number is required').max(40),
  mobileNumber: z
    .string()
    .trim()
    .regex(phoneRegex, 'Please enter a valid mobile number'),
  ownershipDetails: z.object({
    uniqueIdentifiers: z
      .string()
      .trim()
      .min(5, 'Please explain what makes this item uniquely identifiable')
      .max(1000),
    marksOrStickers: z
      .string()
      .trim()
      .min(3, 'Please describe any scratches, marks, stickers, or note "None"')
      .max(1000),
    contentsInside: z
      .string()
      .trim()
      .min(2, 'Please describe what was stored inside or note "N/A"')
      .max(1000),
    ownerOnlyDetail: z
      .string()
      .trim()
      .min(5, 'Please provide a detail that only the true owner would know')
      .max(1000),
  }),
  proofFile: PrivateFileRefSchema,
  purchaseBillFile: PrivateFileRefSchema,
  additionalEvidenceText: z.string().trim().max(1500).optional().or(z.literal('')),
  additionalFile: PrivateFileRefSchema,
})

export const ClaimStudentResponseSchema = z.object({
  additionalResponse: z
    .string()
    .trim()
    .min(5, 'Please provide the requested additional information')
    .max(2000),
  proofFile: PrivateFileRefSchema,
  purchaseBillFile: PrivateFileRefSchema,
  additionalFile: PrivateFileRefSchema,
})

export const AdminRejectClaimSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(5, 'Rejection reason is required (at least 5 characters)')
    .max(1000),
  internalAdminNotes: z.string().trim().max(2000).optional().or(z.literal('')),
  allowResubmission: z.boolean().optional(),
})

export const AdminRequestInfoSchema = z.object({
  requestMessage: z
    .string()
    .trim()
    .min(5, 'Please specify what additional information is required')
    .max(1500),
  internalAdminNotes: z.string().trim().max(2000).optional().or(z.literal('')),
})

export const AdminApproveClaimSchema = z.object({
  internalAdminNotes: z.string().trim().max(2000).optional().or(z.literal('')),
})

export const AdminNotesSchema = z.object({
  internalAdminNotes: z.string().trim().max(2000),
  allowResubmission: z.boolean().optional(),
})

export const HandoverCreateSchema = z.object({
  claimId: z.string().trim().min(1, 'Approved claim ID is required'),
  foundItemId: z.string().trim().min(1, 'Found item ID is required'),
  staffMemberName: z.string().trim().min(2, 'Staff member name is required').max(100),
  handoverDateTime: z.string().trim().min(1, 'Handover date and time is required'),
  studentIdentityVerified: z.literal(true, {
    error: 'Student identity verification must be confirmed before handover',
  }),
  handoverConfirmed: z.literal(true, {
    error: 'Physical handover confirmation is required',
  }),
  otpCode: z.string().trim().max(10).optional().or(z.literal('')),
  acknowledgementNotes: z.string().trim().max(1000).optional().or(z.literal('')),
  handoverPhotoFile: PrivateFileRefSchema,
})
