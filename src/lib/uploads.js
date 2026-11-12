import crypto from 'crypto'
import mongoose from 'mongoose'
import { Readable } from 'stream'
import { getGridFSBucket } from '@/lib/mongodb'

export const MAX_PUBLIC_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB
export const MAX_PRIVATE_FILE_BYTES = 6 * 1024 * 1024 // 6MB

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EVIDENCE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

export function detectMimeFromMagicBytes(buffer) {
  if (!buffer || buffer.length < 4) return null

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg'
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return 'image/png'
  }
  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp'
  }
  // PDF: %PDF-
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return 'application/pdf'
  }

  return null
}

export function sanitizeFileName(name = 'file') {
  return String(name)
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 120)
}

export function validateUploadedFile(file, buffer, { allowPdf = false, maxBytes = MAX_PUBLIC_IMAGE_BYTES } = {}) {
  if (!file || !buffer || buffer.length === 0) {
    return { valid: false, error: 'Empty or missing file.' }
  }

  if (buffer.length > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${Math.round(maxBytes / (1024 * 1024))} MB.`,
    }
  }

  const detectedMime = detectMimeFromMagicBytes(buffer)
  const allowed = allowPdf ? EVIDENCE_MIME_TYPES : IMAGE_MIME_TYPES
  if (!detectedMime || !allowed.has(detectedMime)) {
    return {
      valid: false,
      error: allowPdf
        ? 'Unsupported file type. Allowed formats: JPEG, PNG, WEBP, PDF.'
        : 'Unsupported image format. Allowed formats: JPEG, PNG, WEBP.',
    }
  }

  return {
    valid: true,
    mimeType: detectedMime,
    originalName: sanitizeFileName(file.name || 'upload'),
    size: buffer.length,
  }
}

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

export async function uploadToCloudinary(buffer, mimeType, originalName, folder = 'campus-lost-and-found') {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  const timestamp = Math.floor(Date.now() / 1000)
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex')

  const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`
  const form = new FormData()
  form.append('file', base64Data)
  form.append('folder', folder)
  form.append('timestamp', String(timestamp))
  form.append('api_key', apiKey)
  form.append('signature', signature)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Cloudinary upload failed: ${errText}`)
  }

  const data = await res.json()
  return {
    url: data.secure_url,
    publicId: data.public_id,
    provider: 'cloudinary',
    originalName,
  }
}

export async function saveToGridFS(bucketName, buffer, { filename, mimeType, metadata = {} }) {
  const bucket = await getGridFSBucket(bucketName)
  const uploadStream = bucket.openUploadStream(filename, {
    contentType: mimeType,
    metadata: {
      ...metadata,
      mimeType,
      size: buffer.length,
      uploadedAt: new Date(),
    },
  })

  await new Promise((resolve, reject) => {
    Readable.from(buffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', resolve)
  })

  return {
    fileId: uploadStream.id.toString(),
    originalName: filename,
    mimeType,
    size: buffer.length,
  }
}

export async function readFromGridFS(bucketName, fileId) {
  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return null
  }
  const objectId = new mongoose.Types.ObjectId(fileId)
  const bucket = await getGridFSBucket(bucketName)
  const files = await bucket.find({ _id: objectId }).toArray()
  if (!files || files.length === 0) {
    return null
  }

  const fileDoc = files[0]
  const chunks = []
  const downloadStream = bucket.openDownloadStream(objectId)

  await new Promise((resolve, reject) => {
    downloadStream.on('data', (chunk) => chunks.push(chunk))
    downloadStream.on('error', reject)
    downloadStream.on('end', resolve)
  })

  return {
    fileDoc,
    buffer: Buffer.concat(chunks),
  }
}
