import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'campus_lost_and_found_super_secret_jwt_key_2026'
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET)

/**
 * Hash a plain-text password using bcryptjs
 */
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(plainPassword, salt)
}

/**
 * Compare plain-text password with stored hash
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Sign a JWT token for the user session (valid for 7 days)
 */
export async function signJWT(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY)
}

/**
 * Verify and decode a JWT token
 */
export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload
  } catch {
    return null
  }
}

/**
 * Get authenticated user from request cookie
 */
export async function getSessionFromRequest(request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/campus_token=([^;]+)/)
  if (!tokenMatch) return null

  const token = tokenMatch[1]
  return verifyJWT(token)
}
