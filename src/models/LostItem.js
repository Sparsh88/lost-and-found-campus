import mongoose from 'mongoose'
import { DEFAULT_ITEM_IMAGE, ITEM_CATEGORIES, LOST_ITEM_STATUSES } from '@/lib/constants'

const LostItemSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [120, 'Item name cannot exceed 120 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ITEM_CATEGORIES,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    lostDate: {
      type: String,
      required: [true, 'Lost date is required'],
    },
    lostLocation: {
      type: String,
      required: [true, 'Lost location is required'],
      trim: true,
      index: true,
    },
    imageUrl: {
      type: String,
      default: DEFAULT_ITEM_IMAGE,
    },
    imagePublicId: {
      type: String,
      default: '',
    },
    identifyingDetails: {
      type: String,
      default: '',
      maxlength: [1500, 'Identifying details cannot exceed 1500 characters'],
    },
    status: {
      type: String,
      enum: LOST_ITEM_STATUSES,
      default: 'ACTIVE',
      index: true,
    },
    finderSubmissionsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

LostItemSchema.index({ itemName: 'text', description: 'text', lostLocation: 'text' })
LostItemSchema.index({ ownerId: 1, createdAt: -1 })
LostItemSchema.index({ status: 1, category: 1, createdAt: -1 })

export default mongoose.models.LostItem || mongoose.model('LostItem', LostItemSchema)
