import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import FoundItem from '@/models/FoundItem'
import { getAuthenticatedUser, requireUser, STUDENT_COOKIE_NAME } from '@/lib/auth'
import { FoundItemCreateSchema, formatZodError } from '@/lib/validators'
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
        { error: 'Authentication required to view your found reports.' },
        { status: 401 }
      )
    }

    const filter = {}
    if (mine) {
      filter.finderId = currentUser.id
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
        { foundLocation: regex },
        { description: regex },
        { foundId: regex },
      ]
    }

    const total = await FoundItem.countDocuments(filter)
    const items = await FoundItem.find(filter)
      .select('-hiddenIdentifyingDetails -finderPhone -finderRegistrationNumber -claimsCount -approvedClaimId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const sanitized = items.map((item) => ({
      id: item._id.toString(),
      foundId: item.foundId,
      itemName: item.itemName,
      category: item.category,
      description: item.description,
      foundDate: item.foundDate,
      foundTime: item.foundTime || '',
      foundLocation: item.foundLocation,
      location: item.foundLocation,
      imageUrl: item.imageUrl || DEFAULT_ITEM_IMAGE,
      custodyOffice: item.custodyOffice || 'Campus Security Desk (Block 29)',
      shelfBin: item.shelfBin || 'Unassigned',
      status: item.status,
      finderName: item.finderName,
      isFinderOwner: Boolean(currentUser && item.finderId?.toString() === currentUser.id),
      handoverInfo: item.handoverInfo || '',
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))

    return NextResponse.json({
      items: sanitized,
      pagination: { total, page, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get Found Items Error:', error)
    return NextResponse.json({ error: 'Failed to load found items' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { user, errorResponse } = await requireUser(request)
    if (errorResponse) return errorResponse

    const body = await request.json()
    const validation = FoundItemCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    await connectDB()

    const foundId = generateUniqueCode('FND')

    // Populate finder details strictly from verified server user profile
    const newItem = await FoundItem.create({
      foundId,
      finderId: user.id,
      finderName: user.name,
      finderRegistrationNumber: user.registrationNumber || 'N/A',
      finderPhone: user.phone || '',
      itemName: validation.data.itemName,
      category: validation.data.category,
      description: validation.data.description,
      foundDate: validation.data.foundDate,
      foundTime: validation.data.foundTime || '',
      foundLocation: validation.data.foundLocation,
      imageUrl: validation.data.imageUrl || DEFAULT_ITEM_IMAGE,
      imagePublicId: validation.data.imagePublicId || '',
      hiddenIdentifyingDetails: validation.data.hiddenIdentifyingDetails || '',
      custodyOffice: validation.data.custodyOffice || 'Campus Security Desk (Block 29)',
      shelfBin: 'Unassigned',
      status: 'AVAILABLE',
      claimsCount: 0,
    })

    await notifyAllAdmins({
      type: 'NEW_FOUND_REPORT',
      title: `New Found Item: ${newItem.itemName}`,
      message: `${user.name} (${user.registrationNumber}) reported finding a ${newItem.category} at ${newItem.foundLocation}.`,
      relatedModel: 'FoundItem',
      relatedId: newItem._id.toString(),
      privatePayload: {
        foundId: newItem.foundId,
        finderName: user.name,
        finderRegistrationNumber: user.registrationNumber,
      },
    })

    return NextResponse.json(
      {
        message: 'Found item registered successfully.',
        item: {
          id: newItem._id.toString(),
          foundId: newItem.foundId,
          itemName: newItem.itemName,
          category: newItem.category,
          description: newItem.description,
          foundDate: newItem.foundDate,
          foundTime: newItem.foundTime,
          foundLocation: newItem.foundLocation,
          location: newItem.foundLocation,
          imageUrl: newItem.imageUrl,
          custodyOffice: newItem.custodyOffice,
          status: newItem.status,
          finderName: newItem.finderName,
          isFinderOwner: true,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create Found Item Error:', error)
    return NextResponse.json({ error: 'Failed to register found item' }, { status: 500 })
  }
}
