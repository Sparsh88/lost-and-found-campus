import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import {
  verifyPassword,
  signJWT,
  setAuthCookie,
  ADMIN_COOKIE_NAME,
  isAdminRole,
} from '@/lib/auth'
import { LoginSchema, formatZodError } from '@/lib/validators'
import { checkRateLimit } from '@/lib/rateLimit'
import { recordAuditLog } from '@/lib/audit'

export async function POST(request) {
  try {
    const rl = checkRateLimit(request, 'admin-login', {
      maxRequests: 15,
      windowMs: 5 * 60_000,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many admin login attempts. Please wait a few minutes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      )
    }

    const body = await request.json()
    const validation = LoginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    const { email, password } = validation.data
    const cleanEmail = email.toLowerCase().trim()

    await connectDB()

    const user = await User.findOne({ email: cleanEmail }).select('+passwordHash')
    if (!user) {
      return NextResponse.json({ error: 'Invalid administrator credentials.' }, { status: 401 })
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'This staff account has been suspended.' },
        { status: 403 }
      )
    }

    const isMatch = await verifyPassword(password, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid administrator credentials.' }, { status: 401 })
    }

    if (!isAdminRole(user.role)) {
      await recordAuditLog({
        actor: { id: user._id.toString(), name: user.name, role: user.role },
        action: 'ADMIN_LOGIN_DENIED',
        targetModel: 'User',
        targetId: user._id.toString(),
        details: `Student account ${user.email} attempted admin portal login.`,
        request,
      })
      return NextResponse.json(
        { error: 'Access denied. Administrator or Security Officer privileges required.' },
        { status: 403 }
      )
    }

    const adminPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      registrationNumber: user.registrationNumber || user.studentId || '',
      phone: user.phone || '',
    }

    const token = await signJWT({
      id: adminPayload.id,
      role: adminPayload.role,
      email: adminPayload.email,
    })

    await recordAuditLog({
      actor: adminPayload,
      action: 'ADMIN_LOGIN',
      targetModel: 'User',
      targetId: adminPayload.id,
      details: `Administrator ${adminPayload.email} signed in.`,
      request,
    })

    const response = NextResponse.json(
      { message: 'Admin authenticated successfully', admin: adminPayload },
      { status: 200 }
    )
    setAuthCookie(response, ADMIN_COOKIE_NAME, token, request)
    return response
  } catch (error) {
    console.error('Admin Login Error:', error)
    return NextResponse.json({ error: 'Server error during admin authentication' }, { status: 500 })
  }
}
