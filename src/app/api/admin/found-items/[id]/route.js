import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import FoundItem from '@/models/FoundItem'
import { FoundItemUpdateSchema, formatZodError } from '@/lib/validators'
import { recordAuditLog } from '@/lib/audit'

export async function PATCH(request, { params }) {
  try {
    const { admin, errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    const { id } = params
    const body = await request.json()
    const validation = FoundItemUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    await connectDB()

    const item = mongoose.Types.ObjectId.isValid(id)
      ? await FoundItem.findById(id).select('+hiddenIdentifyingDetails')
      : await FoundItem.findOne({ foundId: id }).select('+hiddenIdentifyingDetails')

    if (!item) {
      return NextResponse.json({ error: 'Found item not found' }, { status: 404 })
    }

    if (item.status === 'RETURNED' && validation.data.status && validation.data.status !== 'RETURNED') {
      return NextResponse.json(
        { error: 'Returned items cannot be reopened once physical handover is complete.' },
        { status: 400 }
      )
    }

    for (const [key, val] of Object.entries(validation.data)) {
      if (val !== undefined) {
        item[key] = val
      }
    }

    await item.save()

    await recordAuditLog({
      actor: admin,
      action: 'FOUND_ITEM_UPDATED',
      targetModel: 'FoundItem',
      targetId: item._id.toString(),
      details: `Updated found item ${item.foundId} (status: ${item.status}, shelf: ${item.shelfBin})`,
      request,
    })

    return NextResponse.json({
      message: 'Found item updated.',
      item: { ...item.toObject(), id: item._id.toString() },
    })
  } catch (error) {
    console.error('Admin Update Found Item Error:', error)
    return NextResponse.json({ error: 'Failed to update found item' }, { status: 500 })
  }
}
