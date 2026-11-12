import mongoose from 'mongoose'
import { FINDER_SUBMISSION_STATUSES } from '@/lib/constants'

const PrivateFileSubSchema = new mongoose.Schema(
  {
    fileId: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
)

const FinderSubmissionSchema = new mongoose.Schema(
  {
    submissionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lostItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LostItem',
      required: true,
      index: true,
    },
    lostReportOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    finderUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    finderName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    photoFile: {
      type: PrivateFileSubSchema,
      default: null,
    },
    status: {
      type: String,
      enum: FINDER_SUBMISSION_STATUSES,
      default: 'NEW',
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

FinderSubmissionSchema.index({ lostItemId: 1, createdAt: -1 })
FinderSubmissionSchema.index({ lostReportOwnerId: 1, createdAt: -1 })

export default mongoose.models.FinderSubmission ||
  mongoose.model('FinderSubmission', FinderSubmissionSchema)
