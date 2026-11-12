import { NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const session = await getSessionFromRequest(request)

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user: session }, { status: 200 })
  } catch (error) {
    console.error('Session API Error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
