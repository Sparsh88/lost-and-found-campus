import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import FoundItem from '@/models/FoundItem'
import Claim from '@/models/Claim'
import Handover from '@/models/Handover'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const { errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    const { id } = params
    await connectDB()

    const foundItem = mongoose.Types.ObjectId.isValid(id)
      ? await FoundItem.findById(id).select('+hiddenIdentifyingDetails').lean()
      : await FoundItem.findOne({ foundId: id }).select('+hiddenIdentifyingDetails').lean()

    if (!foundItem) {
      return NextResponse.json({ error: 'Found item not found' }, { status: 404 })
    }

    const [claims, handover] = await Promise.all([
      Claim.find({ foundItemId: foundItem._id })
        .select('+internalAdminNotes')
        .populate('claimantId', 'name email registrationNumber phone')
        .sort({ createdAt: 1 })
        .lean(),
      Handover.findOne({ foundItemId: foundItem._id }).lean(),
    ])

    return NextResponse.json({
      foundItem: {
        ...foundItem,
        id: foundItem._id.toString(),
      },
      claims: claims.map((c) => ({
        ...c,
        id: c._id.toString(),
      })),
      handover: handover ? { ...handover, id: handover._id.toString() } : null,
    })
  } catch (error) {
    console.error('Admin Found Item Claims Error:', error)
    return NextResponse.json({ error: 'Failed to load item claimants' }, { status: 500 })
  }
}
