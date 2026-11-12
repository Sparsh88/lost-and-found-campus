import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rateLimit'
import {
  isCloudinaryConfigured,
  MAX_PUBLIC_IMAGE_BYTES,
  saveToGridFS,
  uploadToCloudinary,
  validateUploadedFile,
} from '@/lib/uploads'

export async function POST(request) {
  try {
    const { user, errorResponse } = await requireUser(request, { allowAdminCookie: true })
    if (errorResponse) return errorResponse

    const rl = checkRateLimit(request, `upload-public:${user.id}`, {
      maxRequests: 25,
      windowMs: 5 * 60_000,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || typeof file.arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const validation = validateUploadedFile(file, buffer, {
      allowPdf: false,
      maxBytes: MAX_PUBLIC_IMAGE_BYTES,
    })

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    if (isCloudinaryConfigured()) {
      const uploaded = await uploadToCloudinary(
        buffer,
        validation.mimeType,
        validation.originalName
      )
      return NextResponse.json(uploaded, { status: 201 })
    }

    const saved = await saveToGridFS('public_uploads', buffer, {
      filename: validation.originalName,
      mimeType: validation.mimeType,
      metadata: { uploaderId: user.id },
    })

    return NextResponse.json(
      {
        url: `/api/files/public/${saved.fileId}`,
        publicId: saved.fileId,
        provider: 'gridfs',
        originalName: saved.originalName,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Public Upload Error:', error)
    return NextResponse.json({ error: 'Failed to upload image.' }, { status: 500 })
  }
}
