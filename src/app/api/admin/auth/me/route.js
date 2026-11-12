import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  clearAuthCookie,
  getAuthenticatedUser,
  isAdminRole,
  parseCookies,
} from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const cookies = parseCookies(request)
    const hasCookie = Boolean(cookies[ADMIN_COOKIE_NAME])
    const admin = await getAuthenticatedUser(request, { cookieName: ADMIN_COOKIE_NAME })
    if (!admin || !isAdminRole(admin.role)) {
      const res = NextResponse.json({ admin: null }, { status: 200 })
      if (hasCookie) {
        clearAuthCookie(res, ADMIN_COOKIE_NAME, request)
      }
      return res
    }
    return NextResponse.json({ admin }, { status: 200 })
  } catch (error) {
    console.error('Admin Session API Error:', error)
    return NextResponse.json({ admin: null }, { status: 200 })
  }
}
