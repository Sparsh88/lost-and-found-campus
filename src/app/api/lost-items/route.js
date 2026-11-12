import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import { getAuthenticatedUser, requireUser, STUDENT_COOKIE_NAME } from '@/lib/auth'
import { LostItemCreateSchema, formatZodError } from '@/lib/validators'
import { generateUniqueCode } from '@/lib/idGenerator'
import { DEFAULT_ITEM_IMAGE } from '@/lib/constants'
import { notifyAllAdmins } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const mine = searchParams.get('mine') === 'true'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))

    await connectDB()

    const currentUser = await getAuthenticatedUser(request, { cookieName: STUDENT_COOKIE_NAME })

    if (mine && !currentUser) {
      return NextResponse.json(
        { error: 'Authentication required to view your lost reports.' },
        { status: 401 }
      )
    }

    const filter = {}
    if (mine) {
      filter.ownerId = currentUser.id
    }
    if (category && category !== 'All') {
      filter.category = category
    }
    if (status && status !== 'All') {
      filter.status = status
    }
    if (search && search.trim()) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      filter.$or = [
        { itemName: regex },
        { lostLocation: regex },
        { description: regex },
        { reportId: regex },
      ]
    }

    const total = await LostItem.countDocuments(filter)
    const items = await LostItem.find(filter)
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const sanitized = items.map((item) => {
      const ownerIdStr = item.ownerId?._id ? item.ownerId._id.toString() : String(item.ownerId || '')
      const isOwner = Boolean(currentUser && currentUser.id === ownerIdStr)
      return {
        id: item._id.toString(),
        reportId: item.reportId,
        itemName: item.itemName,
        category: item.category,
        description: item.description,
        lostDate: item.lostDate,
        lostLocation: item.lostLocation,
        location: item.lostLocation,
        imageUrl: item.imageUrl || DEFAULT_ITEM_IMAGE,
        identifyingDetails: item.identifyingDetails || '',
        status: item.status,
        finderSubmissionsCount: item.finderSubmissionsCount || 0,
        ownerName: item.ownerId?.name || 'Campus Student',
        isOwner,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }
    })

    return NextResponse.json({
      items: sanitized,
      pagination: { total, page, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get Lost Items Error:', error)
    return NextResponse.json({ error: 'Failed to load lost items' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { user, errorResponse } = await requireUser(request)
    if (errorResponse) return errorResponse

    const body = await request.json()
    const validation = LostItemCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    await connectDB()

    const reportId = generateUniqueCode('LST')
    const newItem = await LostItem.create({
      reportId,
      ownerId: user.id,
      itemName: validation.data.itemName,
      category: validation.data.category,
      description: validation.data.description,
      lostDate: validation.data.lostDate,
      lostLocation: validation.data.lostLocation,
      imageUrl: validation.data.imageUrl || DEFAULT_ITEM_IMAGE,
      imagePublicId: validation.data.imagePublicId || '',
      identifyingDetails: validation.data.identifyingDetails || '',
      status: 'ACTIVE',
      finderSubmissionsCount: 0,
    })

    await notifyAllAdmins({
      type: 'NEW_LOST_REPORT',
      title: `New Lost Report: ${newItem.itemName}`,
      message: `${user.name} (${user.registrationNumber}) reported a lost ${newItem.category} at ${newItem.lostLocation}.`,
      relatedModel: 'LostItem',
      relatedId: newItem._id.toString(),
      privatePayload: {
        reportId: newItem.reportId,
        ownerName: user.name,
        ownerRegistrationNumber: user.registrationNumber,
      },
    })

    return NextResponse.json(
      {
        message: 'Lost item report created successfully.',
        item: {
          ...newItem.toObject(),
          id: newItem._id.toString(),
          location: newItem.lostLocation,
          isOwner: true,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create Lost Item Error:', error)
    return NextResponse.json({ error: 'Failed to submit lost item report' }, { status: 500 })
  }
}
