import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Claim from '@/models/Claim'
import FoundItem from '@/models/FoundItem'
import Notification from '@/models/Notification'
import { AdminApproveClaimSchema, formatZodError } from '@/lib/validators'
import { emitNotificationEvent } from '@/lib/notifications'
import { recordAuditLog } from '@/lib/audit'
import { revalidateCampusData } from '@/lib/revalidate'

export async function POST(request, { params }) {
  let txSession = null
  try {
    const { admin, errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    const { id } = params
    let body = {}
    try {
      body = await request.json()
    } catch {}

    const validation = AdminApproveClaimSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    await connectDB()

    const claimLookup = mongoose.Types.ObjectId.isValid(id)
      ? await Claim.findById(id).select('_id').lean()
      : await Claim.findOne({ claimId: id }).select('_id').lean()

    if (!claimLookup) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    const handoverOtp = Math.floor(100000 + Math.random() * 900000).toString()
    const now = new Date()
    const notificationsToEmit = []
    let approvedClaimResult = null
    let updatedItemResult = null

    txSession = await mongoose.startSession()
    await txSession.withTransaction(async () => {
      // Step 1: Atomically lock the target claim if it is in a reviewable state
      const claimQuery = {
        _id: claimLookup._id,
        status: { $in: ['PENDING', 'ADDITIONAL_INFO_REQUESTED'] },
      }

      const updateFields = {
        status: 'APPROVED',
        handoverOtp,
        reviewedBy: admin.id,
        reviewedByName: admin.name,
        reviewedAt: now,
        approvedBy: admin.id,
        approvedByName: admin.name,
        approvedAt: now,
      }
      if (validation.data.internalAdminNotes) {
        updateFields.internalAdminNotes = validation.data.internalAdminNotes
      }

      const lockedClaim = await Claim.findOneAndUpdate(
        claimQuery,
        { $set: updateFields },
        { new: true, session: txSession }
      )

      if (!lockedClaim) {
        const err = new Error('Claim is no longer pending approval.')
        err.statusCode = 409
        throw err
      }

      // Step 2: Atomically transition the FoundItem ONLY if it is still AVAILABLE
      const lockedItem = await FoundItem.findOneAndUpdate(
        {
          _id: lockedClaim.foundItemId,
          status: 'AVAILABLE',
        },
        {
          $set: {
            status: 'RESERVED_FOR_HANDOVER',
            approvedClaimId: lockedClaim._id,
          },
        },
        { new: true, session: txSession }
      )

      if (!lockedItem) {
        const err = new Error(
          'Another claim for this found item has already been approved or the item is not available.'
        )
        err.statusCode = 409
        throw err
      }

      // Step 3: Close all other pending/info-requested claims on the same found item
      const competingClaims = await Claim.find({
        foundItemId: lockedItem._id,
        _id: { $ne: lockedClaim._id },
        status: { $in: ['PENDING', 'ADDITIONAL_INFO_REQUESTED'] },
      })
        .select('_id claimId claimantId')
        .session(txSession)
        .lean()

      const closeReason = `Claim closed automatically because another claimant (${lockedClaim.claimId}) was approved for this item.`

      if (competingClaims.length > 0) {
        await Claim.updateMany(
          {
            _id: { $in: competingClaims.map((c) => c._id) },
          },
          {
            $set: {
              status: 'CLOSED',
              rejectionReason: closeReason,
              reviewedBy: admin.id,
              reviewedByName: admin.name,
              reviewedAt: now,
            },
          },
          { session: txSession }
        )
      }

      // Step 4: Queue Notifications (inserted inside transaction)
      const winnerDocs = await Notification.insertMany(
        [
          {
            recipientId: lockedClaim.claimantId,
            recipientRole: 'student',
            type: 'CLAIM_APPROVED',
            title: `Claim Approved: ${lockedItem.itemName}`,
            message: `Your claim (${lockedClaim.claimId}) has been approved! Your collection OTP is ${handoverOtp}. Please collect the item from ${lockedItem.custodyOffice} with your Campus ID.`,
            relatedModel: 'Claim',
            relatedId: lockedClaim._id.toString(),
            privatePayload: {
              claimId: lockedClaim.claimId,
              foundId: lockedItem.foundId,
              handoverOtp,
              custodyOffice: lockedItem.custodyOffice,
              shelfBin: lockedItem.shelfBin,
            },
            isRead: false,
          },
          {
            recipientId: lockedClaim.claimantId,
            recipientRole: 'student',
            type: 'ITEM_READY_FOR_COLLECTION',
            title: `Ready for Collection: ${lockedItem.itemName}`,
            message: `${lockedItem.itemName} (${lockedItem.foundId}) is reserved for handover at ${lockedItem.custodyOffice}. Present OTP ${handoverOtp} and your student ID.`,
            relatedModel: 'FoundItem',
            relatedId: lockedItem._id.toString(),
            privatePayload: {
              claimId: lockedClaim.claimId,
              foundId: lockedItem.foundId,
              handoverOtp,
              custodyOffice: lockedItem.custodyOffice,
            },
            isRead: false,
          },
        ],
        { session: txSession }
      )
      for (const n of winnerDocs) {
        notificationsToEmit.push(n)
      }

      if (competingClaims.length > 0) {
        const closedDocs = await Notification.insertMany(
          competingClaims.map((comp) => ({
            recipientId: comp.claimantId,
            recipientRole: 'student',
            type: 'CLAIM_CLOSED',
            title: `Claim Closed: ${lockedItem.itemName}`,
            message: `Your claim (${comp.claimId}) for ${lockedItem.itemName} has been closed because ownership was verified for another claimant.`,
            relatedModel: 'Claim',
            relatedId: comp._id.toString(),
            privatePayload: {
              claimId: comp.claimId,
              foundId: lockedItem.foundId,
              reason: closeReason,
            },
            isRead: false,
          })),
          { session: txSession }
        )
        for (const n of closedDocs) {
          notificationsToEmit.push(n)
        }
      }

      // Step 5: Record Audit Log inside transaction
      await recordAuditLog({
        actor: admin,
        action: 'CLAIM_APPROVED',
        targetModel: 'Claim',
        targetId: lockedClaim._id.toString(),
        details: `Approved claim ${lockedClaim.claimId} for ${lockedItem.foundId}. Closed ${competingClaims.length} competing claim(s). Item reserved for handover.`,
        request,
        session: txSession,
      })

      approvedClaimResult = lockedClaim.toObject()
      updatedItemResult = lockedItem.toObject()
    })

    for (const notif of notificationsToEmit) {
      emitNotificationEvent(notif.recipientId, {
        ...notif.toObject(),
        id: notif._id.toString(),
      })
    }

    revalidateCampusData()

    return NextResponse.json({
      message: 'Claim approved! Competing claims closed and item reserved for handover.',
      claim: { ...approvedClaimResult, id: approvedClaimResult._id.toString() },
      foundItem: { ...updatedItemResult, id: updatedItemResult._id.toString() },
    })
  } catch (error) {
    if (error?.statusCode === 409) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    console.error('Approve Claim Error:', error)
    return NextResponse.json({ error: 'Failed to approve claim' }, { status: 500 })
  } finally {
    if (txSession) {
      await txSession.endSession()
    }
  }
}
