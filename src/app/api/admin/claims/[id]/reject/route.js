import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Claim from '@/models/Claim'
import FoundItem from '@/models/FoundItem'
import { AdminRejectClaimSchema, formatZodError } from '@/lib/validators'
import { createNotification } from '@/lib/notifications'
import { recordAuditLog } from '@/lib/audit'

export async function POST(request, { params }) {
  try {
    const { admin, errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    const { id } = params
    const body = await request.json()
    const validation = AdminRejectClaimSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    await connectDB()

    const claim = mongoose.Types.ObjectId.isValid(id)
      ? await Claim.findById(id).select('+internalAdminNotes')
      : await Claim.findOne({ claimId: id }).select('+internalAdminNotes')

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (!['PENDING', 'ADDITIONAL_INFO_REQUESTED'].includes(claim.status)) {
      return NextResponse.json(
        { error: `Cannot reject claim in status ${claim.status}` },
        { status: 400 }
      )
    }

    const foundItem = await FoundItem.findById(claim.foundItemId).lean()

    claim.status = 'REJECTED'
    claim.rejectionReason = validation.data.rejectionReason
    if (validation.data.internalAdminNotes !== undefined) {
      claim.internalAdminNotes = validation.data.internalAdminNotes
    }
    if (validation.data.allowResubmission !== undefined) {
      claim.allowResubmission = validation.data.allowResubmission
    }
    claim.reviewedBy = admin.id
    claim.reviewedByName = admin.name
    claim.reviewedAt = new Date()
    await claim.save()

    await createNotification({
      recipientId: claim.claimantId,
      recipientRole: 'student',
      type: 'CLAIM_REJECTED',
      title: `Claim Rejected: ${foundItem?.itemName || claim.claimId}`,
      message: `Your claim (${claim.claimId}) was rejected. Reason: ${claim.rejectionReason}${
        claim.allowResubmission ? ' (Resubmission has been permitted by administration.)' : ''
      }`,
      relatedModel: 'Claim',
      relatedId: claim._id.toString(),
      privatePayload: {
        claimId: claim.claimId,
        foundId: foundItem?.foundId || '',
        rejectionReason: claim.rejectionReason,
        allowResubmission: claim.allowResubmission,
      },
    })

    await recordAuditLog({
      actor: admin,
      action: 'CLAIM_REJECTED',
      targetModel: 'Claim',
      targetId: claim._id.toString(),
      details: `Rejected claim ${claim.claimId}. Reason: ${claim.rejectionReason}. Item remains ${foundItem?.status || 'AVAILABLE'}.`,
      request,
    })

    return NextResponse.json({
      message: 'Claim rejected. Found item remains available for other valid claims.',
      claim: { ...claim.toObject(), id: claim._id.toString() },
    })
  } catch (error) {
    console.error('Reject Claim Error:', error)
    return NextResponse.json({ error: 'Failed to reject claim' }, { status: 500 })
  }
}
