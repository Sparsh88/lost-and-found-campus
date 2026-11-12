import { NextResponse } from 'next/server'
import { readFromGridFS } from '@/lib/uploads'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const result = await readFromGridFS('public_uploads', id)
    if (!result) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const mimeType =
      result.fileDoc.contentType ||
      result.fileDoc.metadata?.mimeType ||
      'application/octet-stream'

    return new NextResponse(result.buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(result.buffer.length),
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Public File Serve Error:', error)
    return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 })
  }
}
