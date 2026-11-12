import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import {
  verifyPassword,
  signJWT,
  setAuthCookie,
  STUDENT_COOKIE_NAME,
  isAdminRole,
} from '@/lib/auth'
import { LoginSchema, formatZodError } from '@/lib/validators'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request) {
  try {
    const rl = checkRateLimit(request, 'auth-login', {
      maxRequests: 20,
      windowMs: 5 * 60_000,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a few minutes and try again.' },
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
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    if (user.isBlocked) {
      return NextResponse.json(
        { error: 'This campus account has been suspended by administration.' },
        { status: 403 }
      )
    }

    const isMatch = await verifyPassword(password, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    if (isAdminRole(user.role)) {
      return NextResponse.json(
        { error: 'Administrators must sign in through the dedicated Admin Portal (/admin/login).' },
        { status: 403 }
      )
    }

    const userPayload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      registrationNumber: user.registrationNumber || user.studentId || '',
      studentId: user.registrationNumber || user.studentId || '',
      phone: user.phone || '',
    }

    const token = await signJWT({
      id: userPayload.id,
      role: userPayload.role,
      email: userPayload.email,
    })

    const response = NextResponse.json(
      { message: 'Signed in successfully', user: userPayload },
      { status: 200 }
    )
    setAuthCookie(response, STUDENT_COOKIE_NAME, token, request)
    return response
  } catch (error) {
    console.error('Login API Error:', error)
    return NextResponse.json({ error: 'Server error during login' }, { status: 500 })
  }
}
