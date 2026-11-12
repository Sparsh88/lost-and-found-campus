import { requireAdmin, requireUser } from '@/lib/auth'
import { subscribeNotifications } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET(request) {
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

  const encoder = new TextEncoder()
  let cleanup = null

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event, data) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          )
        } catch {}
      }

      sendEvent('connected', { userId: actor.id, scope })

      const unsubscribe = subscribeNotifications(actor.id, (notification) => {
        sendEvent('notification', notification)
      })

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'))
        } catch {}
      }, 20000)

      cleanup = () => {
        clearInterval(heartbeat)
        unsubscribe()
      }

      request.signal.addEventListener('abort', () => {
        if (cleanup) cleanup()
        try {
          controller.close()
        } catch {}
      })
    },
    cancel() {
      if (cleanup) cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
