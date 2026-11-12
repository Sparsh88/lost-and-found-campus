import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import { resolveItemImage } from '@/lib/itemImages'
import FoundItem from '@/models/FoundItem'
import Claim from '@/models/Claim'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    await connectDB()

    const [items, claimStats] = await Promise.all([
      FoundItem.find()
        .select('+hiddenIdentifyingDetails')
        .sort({ createdAt: -1 })
        .lean(),
      Claim.aggregate([
        {
          $group: {
            _id: { foundItemId: '$foundItemId', status: '$status' },
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    const statsMap = new Map()
    for (const row of claimStats) {
      const key = String(row._id.foundItemId)
      if (!statsMap.has(key)) {
        statsMap.set(key, {
          total: 0,
          pending: 0,
          infoRequested: 0,
          approved: 0,
          rejected: 0,
          closed: 0,
          completed: 0,
        })
      }
      const entry = statsMap.get(key)
      entry.total += row.count
      if (row._id.status === 'PENDING') entry.pending += row.count
      else if (row._id.status === 'ADDITIONAL_INFO_REQUESTED') entry.infoRequested += row.count
      else if (row._id.status === 'APPROVED') entry.approved += row.count
      else if (row._id.status === 'REJECTED') entry.rejected += row.count
      else if (row._id.status === 'CLOSED') entry.closed += row.count
      else if (row._id.status === 'COMPLETED') entry.completed += row.count
    }

    return NextResponse.json({
      items: items.map((item) => {
        const id = item._id.toString()
        const breakdown = statsMap.get(id) || {
          total: 0,
          pending: 0,
          infoRequested: 0,
          approved: 0,
          rejected: 0,
          closed: 0,
          completed: 0,
        }
        return {
          ...item,
          id,
          imageUrl: resolveItemImage(item.itemName, item.category, item.imageUrl),
          totalClaimants: breakdown.total,
          claimBreakdown: breakdown,
        }
      }),
    })
  } catch (error) {
    console.error('Admin Found Items Error:', error)
    return NextResponse.json({ error: 'Failed to load found inventory' }, { status: 500 })
  }
}
