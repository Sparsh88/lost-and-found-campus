import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Handover from '@/models/Handover'
import Claim from '@/models/Claim'
import FoundItem from '@/models/FoundItem'
import Notification from '@/models/Notification'
import { HandoverCreateSchema, formatZodError } from '@/lib/validators'
import { generateUniqueCode } from '@/lib/idGenerator'
import { readFromGridFS } from '@/lib/uploads'
import { emitNotificationEvent } from '@/lib/notifications'
import { recordAuditLog } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    await connectDB()

    const handovers = await Handover.find()
      .populate('foundItemId', 'foundId itemName category foundLocation')
      .populate('claimId', 'claimId status')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      handovers: handovers.map((h) => ({ ...h, id: h._id.toString() })),
    })
  } catch (error) {
    console.error('Get Handovers Error:', error)
    return NextResponse.json({ error: 'Failed to load handover log' }, { status: 500 })
  }
}

export async function POST(request) {
  let txSession = null
  try {
    const { admin, errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    const body = await request.json()
    const validation = HandoverCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    const data = validation.data
    await connectDB()

    let handoverPhotoFile = null
    if (data.handoverPhotoFile?.fileId) {
      const uploaded = await readFromGridFS('private_evidence', data.handoverPhotoFile.fileId)
      if (!uploaded || uploaded.fileDoc.metadata?.uploaderId !== admin.id) {
        return NextResponse.json({ error: 'Invalid handover photo reference' }, { status: 400 })
      }
      handoverPhotoFile = {
        fileId: data.handoverPhotoFile.fileId,
        originalName: uploaded.fileDoc.filename,
        mimeType: uploaded.fileDoc.contentType || data.handoverPhotoFile.mimeType,
        size: uploaded.fileDoc.metadata?.size || uploaded.buffer.length,
      }
    }

    const claimLookup = mongoose.Types.ObjectId.isValid(data.claimId)
      ? await Claim.findById(data.claimId).lean()
      : await Claim.findOne({ claimId: data.claimId }).lean()

    if (!claimLookup) {
      return NextResponse.json({ error: 'Approved claim not found' }, { status: 404 })
    }

    if (data.otpCode && claimLookup.handoverOtp && data.otpCode !== claimLookup.handoverOtp) {
      return NextResponse.json(
        { error: 'Provided Handover OTP does not match the approved claim OTP.' },
        { status: 400 }
      )
    }

    const handoverId = generateUniqueCode('HND')
    const handoverDate = new Date(data.handoverDateTime)
    if (Number.isNaN(handoverDate.getTime())) {
      return NextResponse.json({ error: 'Invalid handover date/time.' }, { status: 400 })
    }

    let createdHandover = null
    let notifToEmit = null

    txSession = await mongoose.startSession()
    await txSession.withTransaction(async () => {
      const lockedClaim = await Claim.findOneAndUpdate(
        {
          _id: claimLookup._id,
          status: 'APPROVED',
        },
        {
          $set: { status: 'COMPLETED' },
        },
        { new: true, session: txSession }
      )

      if (!lockedClaim) {
        const err = new Error('Claim must be in APPROVED state to complete physical handover.')
        err.statusCode = 409
        throw err
      }

      const summary = `Handed over to ${lockedClaim.claimantName} (${lockedClaim.registrationNumber}) by ${data.staffMemberName} on ${handoverDate.toLocaleString()}`

      const lockedItem = await FoundItem.findOneAndUpdate(
        {
          _id: lockedClaim.foundItemId,
          status: 'RESERVED_FOR_HANDOVER',
          approvedClaimId: lockedClaim._id,
        },
        {
          $set: {
            status: 'RETURNED',
            handoverInfo: summary,
          },
        },
        { new: true, session: txSession }
      )

      if (!lockedItem) {
        const err = new Error('Found item is not reserved for this approved claim.')
        err.statusCode = 409
        throw err
      }

      const [handoverDoc] = await Handover.create(
        [
          {
            handoverId,
            foundItemId: lockedItem._id,
            claimId: lockedClaim._id,
            claimantId: lockedClaim.claimantId,
            claimantName: lockedClaim.claimantName,
            claimantRegistrationNumber: lockedClaim.registrationNumber,
            adminId: admin.id,
            staffMemberName: data.staffMemberName,
            handoverDateTime: handoverDate,
            studentIdentityVerified: true,
            otpVerified: Boolean(data.otpCode && data.otpCode === lockedClaim.handoverOtp),
            handoverConfirmed: true,
            acknowledgementNotes: data.acknowledgementNotes || '',
            handoverPhotoFile,
          },
        ],
        { session: txSession }
      )

      const [notif] = await Notification.insertMany(
        [
          {
            recipientId: lockedClaim.claimantId,
            recipientRole: 'student',
            type: 'ITEM_RETURNED',
            title: `Item Returned: ${lockedItem.itemName}`,
            message: `Physical handover completed (${handoverId}) by ${data.staffMemberName}. Your claim ${lockedClaim.claimId} is now COMPLETED.`,
            relatedModel: 'Handover',
            relatedId: handoverDoc._id.toString(),
            privatePayload: {
              handoverId,
              claimId: lockedClaim.claimId,
              foundId: lockedItem.foundId,
              staffMemberName: data.staffMemberName,
              handoverDateTime: handoverDate.toISOString(),
            },
            isRead: false,
          },
        ],
        { session: txSession }
      )
      notifToEmit = notif

      await recordAuditLog({
        actor: admin,
        action: 'HANDOVER_COMPLETED',
        targetModel: 'Handover',
        targetId: handoverDoc._id.toString(),
        details: `Completed physical handover ${handoverId} for ${lockedItem.foundId} to ${lockedClaim.claimantName} (${lockedClaim.registrationNumber}).`,
        request,
        session: txSession,
      })

      createdHandover = handoverDoc.toObject()
    })

    if (notifToEmit) {
      emitNotificationEvent(notifToEmit.recipientId, {
        ...notifToEmit.toObject(),
        id: notifToEmit._id.toString(),
      })
    }

    return NextResponse.json(
      {
        message: 'Physical handover recorded! Item is now RETURNED and claim is COMPLETED.',
        handover: { ...createdHandover, id: createdHandover._id.toString() },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error?.statusCode === 409) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('Complete Handover Error:', error)
    return NextResponse.json({ error: 'Failed to record physical handover' }, { status: 500 })
  } finally {
    if (txSession) {
      await txSession.endSession()
    }
  }
}
