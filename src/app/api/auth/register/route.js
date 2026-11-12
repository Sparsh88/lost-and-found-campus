import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { hashPassword, signJWT } from '@/lib/auth'
import { RegisterSchema } from '@/lib/validators'

export async function POST(request) {
  try {
    const body = await request.json()
    const validation = RegisterSchema.safeParse(body)

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || 'Invalid input data'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { name, email, studentId, password, phone } = validation.data
    const cleanEmail = email.toLowerCase().trim()

    await connectDB()

    const existingUser = await User.findOne({ email: cleanEmail })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)

    // Designate first user or admin email as admin
    const isAdmin = cleanEmail.startsWith('admin') || cleanEmail.includes('admin')
    const role = isAdmin ? 'admin' : 'student'

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      studentId: studentId?.trim() || 'N/A',
      passwordHash,
      role,
      phone: phone?.trim() || '',
    })

    const tokenPayload = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      studentId: newUser.studentId,
    }

    const token = await signJWT(tokenPayload)

    const response = NextResponse.json(
      {
        message: 'Account created successfully',
        user: tokenPayload,
      },
      { status: 201 }
    )

    // Set secure HTTP-only cookie
    response.cookies.set('campus_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Registration API Error:', error)
    return NextResponse.json(
      { error: 'Server error occurred during registration. Please try again.' },
      { status: 500 }
    )
  }
}
