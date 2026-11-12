import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export const STUDENT_COOKIE_NAME = 'campus_token'
export const ADMIN_COOKIE_NAME = 'campus_admin_token'

function getSecretKey() {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be configured in production.')
  }
  return new TextEncoder().encode(
    jwtSecret || 'campus_lost_and_found_dev_secret_change_in_prod'
  )
}

export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(plainPassword, salt)
}

export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword)
}

export async function signJWT(payload, expiresIn = '7d') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecretKey())
}

export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return payload
  } catch {
    return null
  }
}

export function isAdminRole(role) {
  return role === 'admin' || role === 'security'
}

export function parseCookies(request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = {}
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx > 0) {
      const key = part.slice(0, idx).trim()
      const val = part.slice(idx + 1).trim()
      try {
        cookies[key] = decodeURIComponent(val)
      } catch {
        cookies[key] = val
      }
    }
  }
  return cookies
}

export async function getSessionFromRequest(request, { cookieName = STUDENT_COOKIE_NAME } = {}) {
  const cookies = parseCookies(request)
  const token = cookies[cookieName]
  if (!token) return null
  return verifyJWT(token)
}

export async function getAuthenticatedUser(request, { cookieName = STUDENT_COOKIE_NAME } = {}) {
  const session = await getSessionFromRequest(request, { cookieName })
  if (
    !session?.id ||
    typeof session.id !== 'string' ||
    !mongoose.Types.ObjectId.isValid(session.id)
  ) {
    return null
  }

  await connectDB()
  const user = await User.findById(session.id).lean()
  if (!user || user.isBlocked) return null

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    registrationNumber: user.registrationNumber || user.studentId || '',
    studentId: user.registrationNumber || user.studentId || '',
    phone: user.phone || '',
    role: user.role,
    karmaPoints: user.karmaPoints || 0,
  }
}

/**
 * Require an authenticated user (student or admin).
 * Checks student cookie first, then admin cookie if allowAdminCookie is true.
 */
export async function requireUser(request, { allowAdminCookie = false } = {}) {
  let user = await getAuthenticatedUser(request, { cookieName: STUDENT_COOKIE_NAME })
  if (!user && allowAdminCookie) {
    user = await getAuthenticatedUser(request, { cookieName: ADMIN_COOKIE_NAME })
  }

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      ),
    }
  }

  return { user, errorResponse: null }
}

/**
 * Strictly require an authenticated administrator / security officer via the admin cookie.
 */
export async function requireAdmin(request) {
  const adminUser = await getAuthenticatedUser(request, { cookieName: ADMIN_COOKIE_NAME })

  if (adminUser) {
    if (!isAdminRole(adminUser.role)) {
      return {
        admin: null,
        errorResponse: NextResponse.json(
          { error: 'Forbidden: Administrator authorization required.' },
          { status: 403 }
        ),
      }
    }
    return { admin: adminUser, errorResponse: null }
  }

  // If a student tries to hit an admin endpoint with their student session, return 403 Forbidden explicitly
  const studentUser = await getAuthenticatedUser(request, { cookieName: STUDENT_COOKIE_NAME })
  if (studentUser) {
    if (isAdminRole(studentUser.role)) {
      return { admin: studentUser, errorResponse: null }
    }
    return {
      admin: null,
      errorResponse: NextResponse.json(
        { error: 'Forbidden: Student accounts cannot access admin resources.' },
        { status: 403 }
      ),
    }
  }

  return {
    admin: null,
    errorResponse: NextResponse.json(
      { error: 'Administrator authentication required.' },
      { status: 401 }
    ),
  }
}

function isHttpsRequest(request) {
  if (process.env.COOKIE_SECURE === 'true') return true
  if (!request) {
    return (
      process.env.NODE_ENV === 'production' &&
      (process.env.NEXT_PUBLIC_APP_URL || '').startsWith('https://')
    )
  }
  const forwarded = request.headers?.get?.('x-forwarded-proto') || ''
  if (forwarded.split(',')[0].trim() === 'https') return true
  return String(request.url || '').startsWith('https://')
}

export function setAuthCookie(response, cookieName, token, request = null) {
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    secure: isHttpsRequest(request),
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
}

export function clearAuthCookie(response, cookieName, request = null) {
  response.cookies.set(cookieName, '', {
    httpOnly: true,
    secure: isHttpsRequest(request),
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}
