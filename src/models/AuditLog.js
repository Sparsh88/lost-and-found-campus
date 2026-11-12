import mongoose from 'mongoose'

const AuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
    },
    actorRole: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    targetModel: {
      type: String,
      required: true,
      trim: true,
    },
    targetId: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

AuditLogSchema.index({ createdAt: -1 })
AuditLogSchema.index({ targetModel: 1, targetId: 1 })

export default mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema)
