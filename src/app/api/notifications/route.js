import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Notification from '@/models/Notification'
import { requireAdmin, requireUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') === 'admin' ? 'admin' : 'student'
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '40', 10)))

    let actor = null
    if (scope === 'admin') {
      const { admin, errorResponse } = await requireAdmin(request)
      if (errorResponse) return errorResponse
      actor = admin
    } else {
      const { user, errorResponse } = await requireUser(request)
      if (errorResponse) return errorResponse
      actor = user
    }

    await connectDB()

    const filter = { recipientId: actor.id, recipientRole: scope }
    if (unreadOnly) {
      filter.isRead = false
    }

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({
        recipientId: actor.id,
        recipientRole: scope,
        isRead: false,
      }),
    ])

    return NextResponse.json({
      notifications: notifications.map((n) => ({
        ...n,
        id: n._id.toString(),
      })),
      unreadCount,
    })
  } catch (error) {
    console.error('Get Notifications Error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
