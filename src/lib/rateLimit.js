const globalStore = globalThis.__campusRateLimitStore || new Map()
if (!globalThis.__campusRateLimitStore) {
  globalThis.__campusRateLimitStore = globalStore
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return '127.0.0.1'
}

/**
 * Sliding-window in-memory rate limiter for Next.js Route Handlers.
 */
export function checkRateLimit(request, bucket, { maxRequests = 20, windowMs = 60_000 } = {}) {
  const ip = getClientIp(request)
  const key = `${bucket}:${ip}`
  const now = Date.now()

  // Opportunistic cleanup to keep memory bounded
  if (globalStore.size > 2000) {
    for (const [entryKey, entry] of globalStore.entries()) {
      if (entry.resetAt <= now) {
        globalStore.delete(entryKey)
      }
    }
  }

  const existing = globalStore.get(key)
  if (!existing || existing.resetAt <= now) {
    globalStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 }
  }

  if (existing.count >= maxRequests) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    return { allowed: false, remaining: 0, retryAfterSeconds }
  }

  existing.count += 1
  return { allowed: true, remaining: maxRequests - existing.count, retryAfterSeconds: 0 }
}
