import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Item from '@/models/Item'
import { getSessionFromRequest } from '@/lib/auth'
import { ItemSchema } from '@/lib/validators'
import { initialFoundItems } from '@/modules/found/data'

export const dynamic = 'force-dynamic'

// In-memory fallback cache when Atlas IP whitelist is not configured
let fallbackItems = initialFoundItems.map((item) => ({
  ...item,
  type: 'FOUND',
  shelfBin: 'BIN-01',
  custodyOffice: 'Campus Security Desk (Block 29)',
  verificationAnchors: {
    secretQuestion: 'What identifying mark is on this item?',
    secretAnswer: 'Verification mark on file',
  },
}))

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'LOST' or 'FOUND'
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const conn = await connectDB()

    if (conn) {
      const filter = {}

      if (type) filter.type = type.toUpperCase()
      if (category && category !== 'All') filter.category = category
      if (status && status !== 'All') filter.status = status

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i')
        filter.$or = [
          { itemName: regex },
          { location: regex },
          { description: regex },
          { finderName: regex },
        ]
      }

      const total = await Item.countDocuments(filter)
      const items = await Item.find(filter)
        .select('-verificationAnchors.secretAnswer')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()

      return NextResponse.json({
        items: items.map((i) => ({ ...i, id: i._id.toString() })),
        pagination: { total, page, totalPages: Math.ceil(total / limit) },
        storage: 'mongodb',
      })
    }

    // Fallback mode if MongoDB Atlas IP is not yet whitelisted
    let filtered = [...fallbackItems]
    if (type) filtered = filtered.filter((i) => i.type === type.toUpperCase())
    if (category && category !== 'All') filtered = filtered.filter((i) => i.category === category)
    if (status && status !== 'All') filtered = filtered.filter((i) => i.status === status)
    if (search && search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.itemName.toLowerCase().includes(q) ||
          i.location.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q)
      )
    }

    return NextResponse.json({
      items: filtered,
      pagination: { total: filtered.length, page: 1, totalPages: 1 },
      storage: 'fallback_resilient',
    })
  } catch (error) {
    console.error('Get Items API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const validation = ItemSchema.safeParse(body)

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || 'Invalid item data'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const session = await getSessionFromRequest(request)
    const conn = await connectDB()

    const itemData = {
      type: validation.data.type.toUpperCase(),
      itemName: validation.data.itemName.trim(),
      category: validation.data.category,
      description: validation.data.description.trim(),
      location: validation.data.location.trim(),
      foundDate: validation.data.foundDate,
      foundTime: validation.data.foundTime || '',
      imageUrl: validation.data.imageUrl || 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80',
      finderName: validation.data.finderName.trim(),
      finderContact: validation.data.finderContact.trim(),
      reporterId: session?.id || null,
      verificationAnchors: {
        secretQuestion: validation.data.secretQuestion || '',
        secretAnswer: validation.data.secretAnswer || '',
      },
      status: 'Pending',
      custodyOffice: 'Campus Security Desk (Block 29)',
      shelfBin: 'Unassigned',
    }

    if (conn) {
      const newItem = await Item.create(itemData)
      return NextResponse.json(
        {
          message: 'Item registered in MongoDB Atlas',
          item: { ...newItem.toObject(), id: newItem._id.toString() },
        },
        { status: 201 }
      )
    }

    // Resilient fallback storage
    const fallbackItem = {
      ...itemData,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
    }
    fallbackItems = [fallbackItem, ...fallbackItems]

    return NextResponse.json(
      {
        message: 'Item registered successfully',
        item: fallbackItem,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create Item API Error:', error)
    return NextResponse.json({ error: 'Failed to register item' }, { status: 500 })
  }
}
