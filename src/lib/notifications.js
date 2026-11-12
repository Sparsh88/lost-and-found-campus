import { EventEmitter } from 'events'
import Notification from '@/models/Notification'
import User from '@/models/User'

function getNotificationBus() {
  if (!globalThis.__campusNotificationBus) {
    const emitter = new EventEmitter()
    emitter.setMaxListeners(200)
    globalThis.__campusNotificationBus = emitter
  }
  return globalThis.__campusNotificationBus
}

export function emitNotificationEvent(recipientId, payload) {
  try {
    const bus = getNotificationBus()
    bus.emit(`notify:${String(recipientId)}`, payload)
  } catch (err) {
    console.error('SSE emit error:', err)
  }
}

export function subscribeNotifications(recipientId, handler) {
  const bus = getNotificationBus()
  const channel = `notify:${String(recipientId)}`
  bus.on(channel, handler)
  return () => {
    bus.off(channel, handler)
  }
}

export async function createNotification({
  recipientId,
  recipientRole = 'student',
  type,
  title,
  message,
  relatedModel = 'FoundItem',
  relatedId = '',
  privatePayload = {},
  session = null,
}) {
  const doc = {
    recipientId,
    recipientRole,
    type,
    title,
    message,
    relatedModel,
    relatedId: String(relatedId || ''),
    privatePayload,
    isRead: false,
    readAt: null,
  }

  let created
  if (session) {
    const arr = await Notification.create([doc], { session })
    created = arr[0]
  } else {
    created = await Notification.create(doc)
  }

  const formatted = {
    ...created.toObject(),
    id: created._id.toString(),
  }

  // Note: If inside a transaction, callers can also emit after commit; emitting here works for non-tx and after save.
  if (!session) {
    emitNotificationEvent(recipientId, formatted)
  }

  return formatted
}

export async function notifyAllAdmins({
  type,
  title,
  message,
  relatedModel = 'FoundItem',
  relatedId = '',
  privatePayload = {},
  session = null,
}) {
  const admins = await User.find({
    role: { $in: ['admin', 'security'] },
    isBlocked: false,
  })
    .select('_id')
    .lean()

  if (!admins.length) return []

  const docs = admins.map((adm) => ({
    recipientId: adm._id,
    recipientRole: 'admin',
    type,
    title,
    message,
    relatedModel,
    relatedId: String(relatedId || ''),
    privatePayload,
    isRead: false,
    readAt: null,
  }))

  let inserted
  if (session) {
    inserted = await Notification.insertMany(docs, { session })
  } else {
    inserted = await Notification.insertMany(docs)
    for (const n of inserted) {
      emitNotificationEvent(n.recipientId, { ...n.toObject(), id: n._id.toString() })
    }
  }

  return inserted
}
