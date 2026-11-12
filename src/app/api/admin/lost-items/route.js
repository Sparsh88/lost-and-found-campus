import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import LostItem from '@/models/LostItem'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    await connectDB()

    const items = await LostItem.find()
      .populate('ownerId', 'name email registrationNumber phone')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      items: items.map((item) => ({
        id: item._id.toString(),
        reportId: item.reportId,
        itemName: item.itemName,
        category: item.category,
        description: item.description,
        lostDate: item.lostDate,
        lostLocation: item.lostLocation,
        imageUrl: item.imageUrl,
        identifyingDetails: item.identifyingDetails || '',
        status: item.status,
        finderSubmissionsCount: item.finderSubmissionsCount || 0,
        reporterName: item.ownerId?.name || 'Unknown',
        reporterRegistrationNumber: item.ownerId?.registrationNumber || 'N/A',
        reporterEmail: item.ownerId?.email || '',
        reporterPhone: item.ownerId?.phone || '',
        createdAt: item.createdAt,
      })),
    })
  } catch (error) {
    console.error('Admin Lost Items Error:', error)
    return NextResponse.json({ error: 'Failed to load lost reports' }, { status: 500 })
  }
}
