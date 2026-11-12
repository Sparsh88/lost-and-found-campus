import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Notification from '@/models/Notification'
import {
  ADMIN_COOKIE_NAME,
  STUDENT_COOKIE_NAME,
  getAuthenticatedUser,
  isAdminRole,
} from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    const adminUser = await getAuthenticatedUser(request, { cookieName: ADMIN_COOKIE_NAME })
    const studentUser = await getAuthenticatedUser(request, { cookieName: STUDENT_COOKIE_NAME })

    if (!adminUser && !studentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 })
    }

    await connectDB()

    const notification = await Notification.findById(id)
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    const recipientIdStr = String(notification.recipientId || '')
    const matchesStudent = studentUser && recipientIdStr === studentUser.id
    const matchesAdmin = adminUser && isAdminRole(adminUser.role) && recipientIdStr === adminUser.id

    if (!matchesStudent && !matchesAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot access or modify another user\'s notification.' },
        { status: 403 }
      )
    }

    if (!notification.isRead) {
      notification.isRead = true
      notification.readAt = new Date()
      await notification.save()
    }

    return NextResponse.json({
      notification: { ...notification.toObject(), id: notification._id.toString() },
    })
  } catch (error) {
    console.error('Mark Notification Read Error:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
