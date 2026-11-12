import mongoose from 'mongoose'
import { DEFAULT_ITEM_IMAGE, ITEM_CATEGORIES, FOUND_ITEM_STATUSES } from '@/lib/constants'

const FoundItemSchema = new mongoose.Schema(
  {
    foundId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    finderId: {
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
    finderRegistrationNumber: {
      type: String,
      required: true,
      trim: true,
    },
    finderPhone: {
      type: String,
      default: '',
      trim: true,
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
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    foundDate: {
      type: String,
      required: [true, 'Found date is required'],
    },
    foundTime: {
      type: String,
      default: '',
    },
    foundLocation: {
      type: String,
      required: [true, 'Found location is required'],
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
    hiddenIdentifyingDetails: {
      type: String,
      default: '',
      maxlength: [1500, 'Hidden identifying details cannot exceed 1500 characters'],
      select: false,
    },
    custodyOffice: {
      type: String,
      default: 'Campus Security Desk (Block 29)',
    },
    shelfBin: {
      type: String,
      default: 'Unassigned',
    },
    status: {
      type: String,
      enum: FOUND_ITEM_STATUSES,
      default: 'AVAILABLE',
      index: true,
    },
    claimsCount: {
      type: Number,
      default: 0,
    },
    approvedClaimId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      default: null,
    },
    handoverInfo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

FoundItemSchema.index({ itemName: 'text', description: 'text', foundLocation: 'text' })
FoundItemSchema.index({ finderId: 1, createdAt: -1 })
FoundItemSchema.index({ status: 1, category: 1, createdAt: -1 })

export default mongoose.models.FoundItem || mongoose.model('FoundItem', FoundItemSchema)
