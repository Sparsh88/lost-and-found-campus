import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Item from '@/models/Item'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const { id } = params
    await connectDB()

    const item = await Item.findById(id).lean()

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({
      item: { ...item, id: item._id.toString() },
    })
  } catch (error) {
    console.error('Get Item Details Error:', error)
    return NextResponse.json({ error: 'Invalid item ID or server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const session = await getSessionFromRequest(request)

    await connectDB()

    const existingItem = await Item.findById(id)
    if (!existingItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Only allow updating allowed fields
    const allowedUpdates = [
      'status',
      'handoverInfo',
      'itemName',
      'category',
      'description',
      'location',
      'foundDate',
      'foundTime',
      'imageUrl',
      'shelfBin',
    ]

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        existingItem[key] = body[key]
      }
    }

    await existingItem.save()

    return NextResponse.json({
      message: 'Item updated successfully',
      item: { ...existingItem.toObject(), id: existingItem._id.toString() },
    })
  } catch (error) {
    console.error('Update Item Error:', error)
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await connectDB()

    const deleted = await Item.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Delete Item Error:', error)
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
  }
}
