import mongoose from 'mongoose'

const ClaimSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
      index: true,
    },
    claimant: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      name: {
        type: String,
        required: [true, 'Please provide your full name'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Please provide your email'],
        lowercase: true,
        trim: true,
      },
      studentId: {
        type: String,
        required: [true, 'Please provide your Student Roll / ID number'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Please provide a contact phone number'],
        trim: true,
      },
    },
    proofDescription: {
      type: String,
      required: [true, 'Please describe detailed proof of ownership'],
      maxlength: [2000, 'Proof cannot exceed 2000 characters'],
    },
    proofAttachments: [
      {
        type: String,
      },
    ],
    answerToChallenge: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Disputed', 'Handed Over'],
      default: 'Submitted',
      index: true,
    },
    handoverOtp: {
      type: String,
      default: '', // 6-digit OTP generated when approved
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    reviewedBy: {
      officerName: { type: String, default: '' },
      reviewedAt: { type: Date, default: null },
      notes: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Claim || mongoose.model('Claim', ClaimSchema)
