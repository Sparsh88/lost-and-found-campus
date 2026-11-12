import mongoose from 'mongoose'

const ItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['LOST', 'FOUND'],
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
      enum: [
        'ID Card',
        'Laptop',
        'Mobile',
        'Bottle',
        'Documents',
        'Bag',
        'Wallet',
        'Keys',
        'Clothing',
        'Books',
        'Other',
      ],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1500, 'Description cannot exceed 1500 characters'],
    },
    location: {
      type: String,
      required: [true, 'Campus location is required'],
      index: true,
    },
    foundDate: {
      type: String,
      required: true,
    },
    foundTime: {
      type: String,
      default: '',
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80',
    },
    status: {
      type: String,
      enum: ['Pending', 'Claimed', 'Verified', 'Disputed', 'Handed Over', 'Closed'],
      default: 'Pending',
      index: true,
    },
    // Finder / Reporter Details
    finderName: {
      type: String,
      required: true,
      trim: true,
    },
    finderContact: {
      type: String,
      required: true,
      trim: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Physical Custody
    custodyOffice: {
      type: String,
      default: 'Campus Security Desk (Block 29)',
    },
    shelfBin: {
      type: String,
      default: 'Unassigned',
    },
    handoverInfo: {
      type: String,
      default: '',
    },
    // Blind Verification Anchors (Sensitive verification questions)
    verificationAnchors: {
      secretQuestion: { type: String, default: '' },
      secretAnswer: { type: String, default: '' },
      privateStaffNotes: { type: String, default: '' },
    },
    // Cross-module linking
    matchedItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

ItemSchema.index({ itemName: 'text', description: 'text', location: 'text' })

export default mongoose.models.Item || mongoose.model('Item', ItemSchema)
