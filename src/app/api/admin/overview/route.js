import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import User from '@/models/User'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import Claim from '@/models/Claim'
import AuditLog from '@/models/AuditLog'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    await connectDB()

    const [
      totalStudents,
      totalLostReports,
      totalFoundReports,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      returnedItems,
      recentActivities,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      Claim.countDocuments({ status: { $in: ['PENDING', 'ADDITIONAL_INFO_REQUESTED'] } }),
      Claim.countDocuments({ status: { $in: ['APPROVED', 'COMPLETED'] } }),
      Claim.countDocuments({ status: { $in: ['REJECTED', 'CLOSED'] } }),
      FoundItem.countDocuments({ status: 'RETURNED' }),
      AuditLog.find().sort({ createdAt: -1 }).limit(15).lean(),
    ])

    return NextResponse.json({
      metrics: {
        totalStudents,
        totalLostReports,
        totalFoundReports,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        returnedItems,
      },
      recentActivities: recentActivities.map((a) => ({
        ...a,
        id: a._id.toString(),
      })),
    })
  } catch (error) {
    console.error('Admin Overview Error:', error)
    return NextResponse.json({ error: 'Failed to load admin dashboard overview' }, { status: 500 })
  }
}
