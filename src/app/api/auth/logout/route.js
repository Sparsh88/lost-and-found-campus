import { NextResponse } from 'next/server'
import { clearAuthCookie, STUDENT_COOKIE_NAME } from '@/lib/auth'

export async function POST(request) {
  const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })
  clearAuthCookie(response, STUDENT_COOKIE_NAME, request)
  return response
}
