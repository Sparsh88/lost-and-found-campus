import mongoose from 'mongoose'

const PrivateFileSubSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
)

const HandoverSchema = new mongoose.Schema(
  {
    handoverId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: true,
      unique: true,
    },
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: true,
      unique: true,
    },
    claimantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    claimantName: {
      type: String,
      required: true,
      trim: true,
    },
    claimantRegistrationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    staffMemberName: {
      type: String,
      required: true,
      trim: true,
    },
    handoverDateTime: {
      type: Date,
      required: true,
    },
    studentIdentityVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    handoverConfirmed: {
      type: Boolean,
      required: true,
      default: false,
    },
    acknowledgementNotes: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    handoverPhotoFile: {
      type: PrivateFileSubSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

HandoverSchema.index({ createdAt: -1 })

export default mongoose.models.Handover || mongoose.model('Handover', HandoverSchema)
