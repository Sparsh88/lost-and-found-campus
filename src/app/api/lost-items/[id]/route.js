import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import { getAuthenticatedUser, requireUser, STUDENT_COOKIE_NAME } from '@/lib/auth'
import { LostItemUpdateSchema, formatZodError } from '@/lib/validators'
import { resolveItemImage } from '@/lib/itemImages'

export const dynamic = 'force-dynamic'

async function findLostItemByIdOrCode(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byId = await LostItem.findById(id).populate('ownerId', 'name')
    if (byId) return byId
  }
  return LostItem.findOne({ reportId: id }).populate('ownerId', 'name')
}

export async function GET(request, { params }) {
  try {
    const { id } = params
    await connectDB()

    const item = await findLostItemByIdOrCode(id)
    if (!item) {
      return NextResponse.json({ error: 'Lost item report not found' }, { status: 404 })
    }

    const currentUser = await getAuthenticatedUser(request, { cookieName: STUDENT_COOKIE_NAME })
    const ownerIdStr = item.ownerId?._id ? item.ownerId._id.toString() : String(item.ownerId || '')
    const isOwner = Boolean(currentUser && currentUser.id === ownerIdStr)

    return NextResponse.json({
      item: {
        id: item._id.toString(),
        reportId: item.reportId,
        itemName: item.itemName,
        category: item.category,
        description: item.description,
        lostDate: item.lostDate,
        lostLocation: item.lostLocation,
        location: item.lostLocation,
        imageUrl: resolveItemImage(item.itemName, item.category, item.imageUrl),
        identifyingDetails: item.identifyingDetails || '',
        status: item.status,
        finderSubmissionsCount: item.finderSubmissionsCount || 0,
        ownerName: item.ownerId?.name || 'Campus Student',
        isOwner,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    })
  } catch (error) {
    console.error('Get Lost Item Error:', error)
    return NextResponse.json({ error: 'Failed to load lost item' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { user, errorResponse } = await requireUser(request)
    if (errorResponse) return errorResponse

    const { id } = params
    const body = await request.json()
    const validation = LostItemUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    await connectDB()

    const item = await findLostItemByIdOrCode(id)
    if (!item) {
      return NextResponse.json({ error: 'Lost item report not found' }, { status: 404 })
    }

    const ownerIdStr = item.ownerId?._id ? item.ownerId._id.toString() : String(item.ownerId)
    if (ownerIdStr !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Only the report owner can modify this lost report.' },
        { status: 403 }
      )
    }

    if (item.status === 'RETURNED') {
      return NextResponse.json(
        { error: 'Returned lost reports are locked and cannot be edited.' },
        { status: 400 }
      )
    }

    if (validation.data.status === 'RETURNED') {
      return NextResponse.json(
        { error: 'Only closed or active status updates are permitted by the owner.' },
        { status: 400 }
      )
    }

    const updates = validation.data
    if (item.status === 'CLOSED' && updates.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Reopen this report to ACTIVE before editing details.' },
        { status: 400 }
      )
    }

    const editableFields = [
      'itemName',
      'category',
      'description',
      'lostDate',
      'lostLocation',
      'imageUrl',
      'imagePublicId',
      'identifyingDetails',
      'status',
    ]

    for (const field of editableFields) {
      if (updates[field] !== undefined) {
        item[field] = updates[field]
      }
    }
    item.imageUrl = resolveItemImage(
      item.itemName,
      item.category,
      updates.imageUrl !== undefined ? updates.imageUrl : item.imageUrl
    )

    await item.save()

    return NextResponse.json({
      message: 'Lost item report updated successfully.',
      item: {
        ...item.toObject(),
        id: item._id.toString(),
        location: item.lostLocation,
        isOwner: true,
      },
    })
  } catch (error) {
    console.error('Update Lost Item Error:', error)
    return NextResponse.json({ error: 'Failed to update lost item report' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, errorResponse } = await requireUser(request)
    if (errorResponse) return errorResponse

    const { id } = params
    await connectDB()

    const item = await findLostItemByIdOrCode(id)
    if (!item) {
      return NextResponse.json({ error: 'Lost item report not found' }, { status: 404 })
    }

    const ownerIdStr = item.ownerId?._id ? item.ownerId._id.toString() : String(item.ownerId)
    if (ownerIdStr !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You can only delete your own lost reports.' },
        { status: 403 }
      )
    }

    if (item.finderSubmissionsCount > 0 || item.status === 'RETURNED') {
      return NextResponse.json(
        {
          error:
            'Reports with finder submissions or returned items cannot be deleted. You may close the report instead.',
        },
        { status: 400 }
      )
    }

    await LostItem.deleteOne({ _id: item._id })
    return NextResponse.json({ message: 'Lost item report deleted successfully.' })
  } catch (error) {
    console.error('Delete Lost Item Error:', error)
    return NextResponse.json({ error: 'Failed to delete lost item report' }, { status: 500 })
  }
}
