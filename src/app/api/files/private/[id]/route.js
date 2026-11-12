import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import {
  ADMIN_COOKIE_NAME,
  STUDENT_COOKIE_NAME,
  getAuthenticatedUser,
  isAdminRole,
} from '@/lib/auth'
import { readFromGridFS } from '@/lib/uploads'
import Claim from '@/models/Claim'
import FinderSubmission from '@/models/FinderSubmission'
import Handover from '@/models/Handover'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const adminUser = await getAuthenticatedUser(request, { cookieName: ADMIN_COOKIE_NAME })
    const studentUser = await getAuthenticatedUser(request, { cookieName: STUDENT_COOKIE_NAME })

    if (!adminUser && !studentUser) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      )
    }

    const { id } = params
    await connectDB()

    const result = await readFromGridFS('private_evidence', id)
    if (!result) {
      return NextResponse.json({ error: 'Private file not found' }, { status: 404 })
    }

    let authorized = false

    if (adminUser && isAdminRole(adminUser.role)) {
      authorized = true
    } else if (studentUser && isAdminRole(studentUser.role)) {
      authorized = true
    }

    if (!authorized && studentUser) {
      if (result.fileDoc.metadata?.uploaderId === studentUser.id) {
        authorized = true
      }

      if (!authorized) {
        const finderDoc = await FinderSubmission.findOne({
          'photoFile.fileId': id,
          lostReportOwnerId: studentUser.id,
        })
          .select('_id')
          .lean()
        if (finderDoc) authorized = true
      }

      if (!authorized) {
        const claimDoc = await Claim.findOne({
          claimantId: studentUser.id,
          $or: [
            { 'proofFile.fileId': id },
            { 'purchaseBillFile.fileId': id },
            { 'additionalFile.fileId': id },
          ],
        })
          .select('_id')
          .lean()
        if (claimDoc) authorized = true
      }

      if (!authorized) {
        const handoverDoc = await Handover.findOne({
          claimantId: studentUser.id,
          'handoverPhotoFile.fileId': id,
        })
          .select('_id')
          .lean()
        if (handoverDoc) authorized = true
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to access this private file.' },
        { status: 403 }
      )
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
        'Content-Disposition': `inline; filename="${result.fileDoc.filename || 'evidence'}"`,
        'Cache-Control': 'private, no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Private File Access Error:', error)
    return NextResponse.json({ error: 'Failed to retrieve private file' }, { status: 500 })
  }
}
