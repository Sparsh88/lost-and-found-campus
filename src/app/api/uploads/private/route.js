import { NextResponse } from 'next/server'
import { requireAdmin, requireUser } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rateLimit'
import {
  MAX_PRIVATE_FILE_BYTES,
  saveToGridFS,
  validateUploadedFile,
} from '@/lib/uploads'

const ALLOWED_PURPOSES = new Set([
  'claim_proof',
  'purchase_bill',
  'additional_evidence',
  'finder_photo',
  'handover_photo',
])

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const purposeRaw = String(formData.get('purpose') || 'additional_evidence')
    const purpose = ALLOWED_PURPOSES.has(purposeRaw) ? purposeRaw : 'additional_evidence'

    let actor = null
    if (purpose === 'handover_photo' || request.headers.get('x-admin-portal') === '1') {
      const { admin, errorResponse } = await requireAdmin(request)
      if (errorResponse) return errorResponse
      actor = admin
    } else {
      const { user, errorResponse } = await requireUser(request, { allowAdminCookie: true })
      if (errorResponse) return errorResponse
      actor = user
    }

    const rl = checkRateLimit(request, `upload-private:${actor.id}`, {
      maxRequests: 30,
      windowMs: 5 * 60_000,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      )
    }

    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const allowPdf = purpose !== 'finder_photo' && purpose !== 'handover_photo'
    const validation = validateUploadedFile(file, buffer, {
      allowPdf,
      maxBytes: MAX_PRIVATE_FILE_BYTES,
    })

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const saved = await saveToGridFS('private_evidence', buffer, {
      filename: validation.originalName,
      mimeType: validation.mimeType,
      metadata: {
        uploaderId: actor.id,
        purpose,
      },
    })

    return NextResponse.json({ file: saved }, { status: 201 })
  } catch (error) {
    console.error('Private Upload Error:', error)
    return NextResponse.json({ error: 'Failed to store private document.' }, { status: 500 })
  }
}
