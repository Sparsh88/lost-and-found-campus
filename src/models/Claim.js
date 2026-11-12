import mongoose from 'mongoose'
import { CLAIM_STATUSES } from '@/lib/constants'

const PrivateFileSubSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
)

const ClaimSchema = new mongoose.Schema(
  {
    claimId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true,
      index: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    claimantName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    ownershipDetails: {
      uniqueIdentifiers: { type: String, required: true, maxlength: 1000 },
      marksOrStickers: { type: String, required: true, maxlength: 1000 },
      contentsInside: { type: String, required: true, maxlength: 1000 },
      ownerOnlyDetail: { type: String, required: true, maxlength: 1000 },
    },
    proofFile: {
      type: PrivateFileSubSchema,
      default: null,
    },
    purchaseBillFile: {
      type: PrivateFileSubSchema,
      default: null,
    },
    additionalEvidenceText: {
      type: String,
      default: '',
      maxlength: 1500,
    },
    additionalFile: {
      type: PrivateFileSubSchema,
      default: null,
    },
    adminInfoRequestMessage: {
      type: String,
      default: '',
      maxlength: 1500,
    },
    claimantAdditionalResponse: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    allowResubmission: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: CLAIM_STATUSES,
      default: 'PENDING',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    internalAdminNotes: {
      type: String,
      default: '',
      maxlength: 2000,
      select: false,
    },
    handoverOtp: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedByName: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedByName: {
      type: String,
      default: '',
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// Enforce at most one active claim per claimant per found item at database level
ClaimSchema.index(
  { foundItemId: 1, claimantId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['PENDING', 'ADDITIONAL_INFO_REQUESTED', 'APPROVED'] },
    },
  }
)
ClaimSchema.index({ foundItemId: 1, status: 1, createdAt: -1 })
ClaimSchema.index({ claimantId: 1, createdAt: -1 })

export default mongoose.models.Claim || mongoose.model('Claim', ClaimSchema)
