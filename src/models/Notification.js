import mongoose from 'mongoose'

const NotificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ['student', 'admin'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'FINDER_SUBMISSION',
        'NEW_LOST_REPORT',
        'NEW_FOUND_REPORT',
        'NEW_CLAIM',
        'CLAIM_INFO_REQUESTED',
        'CLAIM_INFO_SUBMITTED',
        'CLAIM_APPROVED',
        'CLAIM_REJECTED',
        'CLAIM_CLOSED',
        'ITEM_READY_FOR_COLLECTION',
        'ITEM_RETURNED',
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    relatedModel: {
      type: String,
      enum: ['LostItem', 'FoundItem', 'FinderSubmission', 'Claim', 'Handover'],
      default: 'FoundItem',
    },
    relatedId: {
      type: String,
      default: '',
    },
    privatePayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 })
NotificationSchema.index({ recipientRole: 1, isRead: 1, createdAt: -1 })

export default mongoose.models.Notification ||
  mongoose.model('Notification', NotificationSchema)
