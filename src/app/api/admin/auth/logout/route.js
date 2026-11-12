import { NextResponse } from 'next/server'
import { clearAuthCookie, ADMIN_COOKIE_NAME } from '@/lib/auth'

export async function POST(request) {
  const response = NextResponse.json({ message: 'Admin logged out successfully' }, { status: 200 })
  clearAuthCookie(response, ADMIN_COOKIE_NAME, request)
  return response
}
