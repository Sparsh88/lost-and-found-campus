import { NextResponse } from 'next/server'
import {
  clearAuthCookie,
  getAuthenticatedUser,
  parseCookies,
  STUDENT_COOKIE_NAME,
} from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const cookies = parseCookies(request)
    const hasCookie = Boolean(cookies[STUDENT_COOKIE_NAME])
    const user = await getAuthenticatedUser(request, { cookieName: STUDENT_COOKIE_NAME })
    const res = NextResponse.json({ user: user || null }, { status: 200 })
    if (!user && hasCookie) {
      clearAuthCookie(res, STUDENT_COOKIE_NAME, request)
    }
    return res
  } catch (error) {
    console.error('Session API Error:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
