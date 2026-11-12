import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import LostItem from '@/models/LostItem'
import { LOST_ITEM_STATUSES } from '@/lib/constants'
import { recordAuditLog } from '@/lib/audit'

export async function PATCH(request, { params }) {
  try {
    const { admin, errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!LOST_ITEM_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid lost item status' }, { status: 400 })
    }

    await connectDB()

    const item = mongoose.Types.ObjectId.isValid(id)
      ? await LostItem.findById(id)
      : await LostItem.findOne({ reportId: id })

    if (!item) {
      return NextResponse.json({ error: 'Lost item report not found' }, { status: 404 })
    }

    const previousStatus = item.status
    item.status = status
    await item.save()

    await recordAuditLog({
      actor: admin,
      action: 'LOST_ITEM_STATUS_UPDATED',
      targetModel: 'LostItem',
      targetId: item._id.toString(),
      details: `Updated ${item.reportId} status from ${previousStatus} to ${status}`,
      request,
    })

    return NextResponse.json({
      message: `Lost report updated to ${status}`,
      item: { ...item.toObject(), id: item._id.toString() },
    })
  } catch (error) {
    console.error('Admin Update Lost Item Error:', error)
    return NextResponse.json({ error: 'Failed to update lost item' }, { status: 500 })
  }
}
