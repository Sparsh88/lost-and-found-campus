import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import {
  hashPassword,
  signJWT,
  setAuthCookie,
  ADMIN_COOKIE_NAME,
} from '@/lib/auth'
import { AdminRegisterSchema, formatZodError } from '@/lib/validators'
import { checkRateLimit } from '@/lib/rateLimit'
import { recordAuditLog } from '@/lib/audit'

export async function POST(request) {
  try {
    const rl = checkRateLimit(request, 'admin-register', {
      maxRequests: 12,
      windowMs: 10 * 60_000,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many admin registration attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      )
    }

    const body = await request.json()
    const normalizedBody = {
      ...body,
      registrationNumber: body.registrationNumber || body.adminId || '',
    }
    const validation = AdminRegisterSchema.safeParse(normalizedBody)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    if (
      process.env.ADMIN_REGISTRATION_KEY &&
      validation.data.enrollmentKey !== process.env.ADMIN_REGISTRATION_KEY
    ) {
      return NextResponse.json(
        { error: 'Invalid staff enrollment key.' },
        { status: 403 }
      )
    }

    const { name, email, registrationNumber, phone, role, password } = validation.data
    const cleanEmail = email.toLowerCase().trim()
    const cleanAdminId = registrationNumber.toUpperCase().trim()

    await connectDB()

    const existingUser = await User.findOne({
      $or: [
        { email: cleanEmail },
        { registrationNumber: cleanAdminId },
        { studentId: cleanAdminId },
      ],
    }).lean()

    if (existingUser) {
      const msg =
        existingUser.email === cleanEmail
          ? 'An account with this campus email already exists.'
          : 'An account with this Admin / Staff ID already exists.'
      return NextResponse.json({ error: msg }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const newAdmin = await User.create({
      name: name.trim(),
      email: cleanEmail,
      registrationNumber: cleanAdminId,
      studentId: cleanAdminId,
      passwordHash,
      role,
      phone: phone.trim(),
    })

    const adminPayload = {
      id: newAdmin._id.toString(),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      registrationNumber: newAdmin.registrationNumber,
      phone: newAdmin.phone,
    }

    const token = await signJWT({
      id: adminPayload.id,
      role: adminPayload.role,
      email: adminPayload.email,
    })

    await recordAuditLog({
      actor: adminPayload,
      action: 'ADMIN_REGISTERED',
      targetModel: 'User',
      targetId: adminPayload.id,
      details: `Staff account ${adminPayload.registrationNumber} (${adminPayload.role}) enrolled.`,
      request,
    })

    const response = NextResponse.json(
      { message: 'Admin account created successfully', admin: adminPayload },
      { status: 201 }
    )
    setAuthCookie(response, ADMIN_COOKIE_NAME, token, request)
    return response
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'An account with this Admin ID or campus email already exists.' },
        { status: 409 }
      )
    }
    console.error('Admin Registration Error:', error)
    return NextResponse.json(
      { error: 'Unable to complete admin registration right now. Please try again.' },
      { status: 500 }
    )
  }
}
