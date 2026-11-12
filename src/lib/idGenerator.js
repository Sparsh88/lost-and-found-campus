import crypto from 'crypto'

export function generateUniqueCode(prefix) {
  const year = new Date().getFullYear()
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}-${year}-${randomPart}`
}
