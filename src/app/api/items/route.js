import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'

export const dynamic = 'force-dynamic'

// Compatibility read-only endpoint backed strictly by MongoDB
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')?.toUpperCase()
    await connectDB()

    if (type === 'LOST') {
      const items = await LostItem.find()
        .select('-identifyingDetails')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
      return NextResponse.json({
        items: items.map((i) => ({ ...i, id: i._id.toString(), location: i.lostLocation })),
      })
    }

    const items = await FoundItem.find()
      .select('-hiddenIdentifyingDetails -finderPhone -finderRegistrationNumber -claimsCount')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    return NextResponse.json({
      items: items.map((i) => ({ ...i, id: i._id.toString(), location: i.foundLocation })),
    })
  } catch (error) {
    console.error('Legacy Items GET Error:', error)
    return NextResponse.json({ error: 'Failed to load items' }, { status: 500 })
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Please use /api/lost-items or /api/found-items.' },
    { status: 410 }
  )
}
