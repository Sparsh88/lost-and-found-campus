import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Notification from '@/models/Notification'
import { requireAdmin, requireUser } from '@/lib/auth'

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url)
    const scope = searchParams.get('scope') === 'admin' ? 'admin' : 'student'

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

    await Notification.updateMany(
      { recipientId: actor.id, recipientRole: scope, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    )

    return NextResponse.json({ message: 'All notifications marked as read.' })
  } catch (error) {
    console.error('Mark All Read Error:', error)
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
  }
}
