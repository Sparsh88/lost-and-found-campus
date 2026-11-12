import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import AuditLog from '@/models/AuditLog'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    await connectDB()

    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).lean()

    return NextResponse.json({
      logs: logs.map((l) => ({ ...l, id: l._id.toString() })),
    })
  } catch (error) {
    console.error('Admin Audit Logs Error:', error)
    return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 })
  }
}
