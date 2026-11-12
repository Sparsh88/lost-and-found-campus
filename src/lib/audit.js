import AuditLog from '@/models/AuditLog'
import { getClientIp } from './rateLimit'

export async function recordAuditLog({
  actor,
  action,
  targetModel,
  targetId,
  details = '',
  request = null,
  session = null,
}) {
  try {
    const doc = {
      actorId: actor?.id || null,
      actorName: actor?.name || 'System',
      actorRole: actor?.role || 'system',
      action,
      targetModel,
      targetId: String(targetId || ''),
      details,
      ipAddress: request ? getClientIp(request) : '',
    }

    if (session) {
      await AuditLog.create([doc], { session })
    } else {
      await AuditLog.create(doc)
    }
  } catch (err) {
    console.error('AuditLog write error:', err)
  }
}
