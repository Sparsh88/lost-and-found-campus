import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import {
  hashPassword,
  signJWT,
  setAuthCookie,
  STUDENT_COOKIE_NAME,
} from '@/lib/auth'
import { RegisterSchema, formatZodError } from '@/lib/validators'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(request) {
  try {
    const rl = checkRateLimit(request, 'auth-register', {
      maxRequests: 15,
      windowMs: 10 * 60_000,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      )
    }

    const body = await request.json()
    const validation = RegisterSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    const { name, email, registrationNumber, password, phone } = validation.data
    const cleanEmail = email.toLowerCase().trim()
    const cleanRegNo = registrationNumber.toUpperCase().trim()

    await connectDB()

    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { registrationNumber: cleanRegNo }],
    }).lean()

    if (existingUser) {
      const msg =
        existingUser.email === cleanEmail
          ? 'An account with this campus email already exists.'
          : 'An account with this registration number already exists.'
      return NextResponse.json({ error: msg }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    // Always force 'student' role on public registration — never trust client role or email heuristics
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      registrationNumber: cleanRegNo,
      studentId: cleanRegNo,
      passwordHash,
      role: 'student',
      phone: phone.trim(),
    })

    const userPayload = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      registrationNumber: newUser.registrationNumber,
      studentId: newUser.registrationNumber,
      phone: newUser.phone,
    }

    const token = await signJWT({
      id: userPayload.id,
      role: userPayload.role,
      email: userPayload.email,
    })

    const response = NextResponse.json(
      { message: 'Account created successfully', user: userPayload },
      { status: 201 }
    )
    setAuthCookie(response, STUDENT_COOKIE_NAME, token, request)
    return response
  } catch (error) {
    console.error('Registration API Error:', error)
    return NextResponse.json(
      { error: 'Unable to complete registration right now. Please try again.' },
      { status: 500 }
    )
  }
}
