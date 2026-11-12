import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import FinderSubmission from '@/models/FinderSubmission'
import {
  ADMIN_COOKIE_NAME,
  STUDENT_COOKIE_NAME,
  getAuthenticatedUser,
  isAdminRole,
  requireUser,
} from '@/lib/auth'
import { FinderSubmissionSchema, formatZodError } from '@/lib/validators'
import { generateUniqueCode } from '@/lib/idGenerator'
import { checkRateLimit } from '@/lib/rateLimit'
import { readFromGridFS } from '@/lib/uploads'
import { createNotification, notifyAllAdmins } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const adminUser = await getAuthenticatedUser(request, { cookieName: ADMIN_COOKIE_NAME })
    const studentUser = await getAuthenticatedUser(request, { cookieName: STUDENT_COOKIE_NAME })

    if (!adminUser && !studentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = params
    await connectDB()

    const lostItem = mongoose.Types.ObjectId.isValid(id)
      ? await LostItem.findById(id).lean()
      : await LostItem.findOne({ reportId: id }).lean()

    if (!lostItem) {
      return NextResponse.json({ error: 'Lost item report not found' }, { status: 404 })
    }

    const isAdmin = Boolean(
      (adminUser && isAdminRole(adminUser.role)) || (studentUser && isAdminRole(studentUser.role))
    )
    const isOwner = Boolean(studentUser && lostItem.ownerId.toString() === studentUser.id)

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Forbidden: Only the report owner and administrators can view finder details.' },
        { status: 403 }
      )
    }

    const submissions = await FinderSubmission.find({ lostItemId: lostItem._id })
      .sort({ createdAt: -1 })
      .lean()

    if (isOwner) {
      await FinderSubmission.updateMany(
        { lostItemId: lostItem._id, status: 'NEW' },
        { $set: { status: 'VIEWED' } }
      )
    }

    return NextResponse.json({
      submissions: submissions.map((s) => ({
        ...s,
        id: s._id.toString(),
      })),
    })
  } catch (error) {
    console.error('Get Finder Submissions Error:', error)
    return NextResponse.json({ error: 'Failed to load finder submissions' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { user, errorResponse } = await requireUser(request)
    if (errorResponse) return errorResponse

    const rl = checkRateLimit(request, `finder-submit:${user.id}`, {
      maxRequests: 15,
      windowMs: 5 * 60_000,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait a moment and try again.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      )
    }

    const { id } = params
    const body = await request.json()
    const validation = FinderSubmissionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    await connectDB()

    const lostItem = mongoose.Types.ObjectId.isValid(id)
      ? await LostItem.findById(id)
      : await LostItem.findOne({ reportId: id })

    if (!lostItem) {
      return NextResponse.json({ error: 'Lost item report not found' }, { status: 404 })
    }

    if (lostItem.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This lost item report is closed or already returned.' },
        { status: 400 }
      )
    }

    if (lostItem.ownerId.toString() === user.id) {
      return NextResponse.json(
        { error: 'You cannot submit a Finder report for your own lost item.' },
        { status: 400 }
      )
    }

    let photoFile = null
    if (validation.data.photoFileId) {
      const uploaded = await readFromGridFS('private_evidence', validation.data.photoFileId)
      if (!uploaded || uploaded.fileDoc.metadata?.uploaderId !== user.id) {
        return NextResponse.json(
          { error: 'Invalid or unauthorized uploaded photograph.' },
          { status: 400 }
        )
      }
      photoFile = {
        fileId: validation.data.photoFileId,
        originalName: uploaded.fileDoc.filename,
        mimeType: uploaded.fileDoc.contentType || 'image/jpeg',
        size: uploaded.fileDoc.metadata?.size || uploaded.buffer.length,
      }
    }

    const submission = await FinderSubmission.create({
      submissionId: generateUniqueCode('FNDR'),
      lostItemId: lostItem._id,
      lostReportOwnerId: lostItem.ownerId,
      finderUserId: user.id,
      finderName: validation.data.finderName,
      registrationNumber: validation.data.registrationNumber.toUpperCase(),
      mobileNumber: validation.data.mobileNumber,
      message: validation.data.message,
      photoFile,
      status: 'NEW',
    })

    await LostItem.updateOne(
      { _id: lostItem._id },
      { $inc: { finderSubmissionsCount: 1 } }
    )

    const submittedAt = submission.createdAt.toISOString()

    // Private notification to the original lost-report owner
    await createNotification({
      recipientId: lostItem.ownerId,
      recipientRole: 'student',
      type: 'FINDER_SUBMISSION',
      title: `Someone found your "${lostItem.itemName}"!`,
      message: `${submission.finderName} submitted finder details regarding your lost report (${lostItem.reportId}).`,
      relatedModel: 'FinderSubmission',
      relatedId: submission._id.toString(),
      privatePayload: {
        submissionId: submission.submissionId,
        finderName: submission.finderName,
        registrationNumber: submission.registrationNumber,
        contactNumber: submission.mobileNumber,
        relatedLostItem: lostItem.itemName,
        relatedLostReportId: lostItem.reportId,
        lostItemObjectId: lostItem._id.toString(),
        finderMessage: submission.message,
        submittedAt,
        photoFile: submission.photoFile,
      },
    })

    // Notify administrators
    await notifyAllAdmins({
      type: 'FINDER_SUBMISSION',
      title: `Finder Response: ${lostItem.itemName}`,
      message: `${submission.finderName} (${submission.registrationNumber}) responded to lost report ${lostItem.reportId}.`,
      relatedModel: 'FinderSubmission',
      relatedId: submission._id.toString(),
      privatePayload: {
        submissionId: submission.submissionId,
        lostReportId: lostItem.reportId,
        finderName: submission.finderName,
        registrationNumber: submission.registrationNumber,
      },
    })

    return NextResponse.json(
      {
        message: 'Finder report submitted! The owner has been privately notified.',
        submissionId: submission.submissionId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create Finder Submission Error:', error)
    return NextResponse.json({ error: 'Failed to submit finder details' }, { status: 500 })
  }
}
