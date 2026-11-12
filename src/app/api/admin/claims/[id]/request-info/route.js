import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Claim from '@/models/Claim'
import FoundItem from '@/models/FoundItem'
import { AdminRequestInfoSchema, formatZodError } from '@/lib/validators'
import { createNotification } from '@/lib/notifications'
import { recordAuditLog } from '@/lib/audit'

export async function POST(request, { params }) {
  try {
    const { admin, errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    const { id } = params
    const body = await request.json()
    const validation = AdminRequestInfoSchema.safeParse(body)
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
        { error: `Cannot request additional info when claim is ${claim.status}` },
        { status: 400 }
      )
    }

    const foundItem = await FoundItem.findById(claim.foundItemId).lean()

    claim.status = 'ADDITIONAL_INFO_REQUESTED'
    claim.adminInfoRequestMessage = validation.data.requestMessage
    if (validation.data.internalAdminNotes !== undefined) {
      claim.internalAdminNotes = validation.data.internalAdminNotes
    }
    claim.reviewedBy = admin.id
    claim.reviewedByName = admin.name
    claim.reviewedAt = new Date()
    await claim.save()

    await createNotification({
      recipientId: claim.claimantId,
      recipientRole: 'student',
      type: 'CLAIM_INFO_REQUESTED',
      title: `Additional Evidence Requested: ${foundItem?.itemName || claim.claimId}`,
      message: `Administration requested more details for claim ${claim.claimId}: "${claim.adminInfoRequestMessage}"`,
      relatedModel: 'Claim',
      relatedId: claim._id.toString(),
      privatePayload: {
        claimId: claim.claimId,
        foundId: foundItem?.foundId || '',
        requestMessage: claim.adminInfoRequestMessage,
      },
    })

    await recordAuditLog({
      actor: admin,
      action: 'CLAIM_INFO_REQUESTED',
      targetModel: 'Claim',
      targetId: claim._id.toString(),
      details: `Requested additional info for claim ${claim.claimId}`,
      request,
    })

    return NextResponse.json({
      message: 'Information request sent to claimant.',
      claim: { ...claim.toObject(), id: claim._id.toString() },
    })
  } catch (error) {
    console.error('Request Info Error:', error)
    return NextResponse.json({ error: 'Failed to request additional information' }, { status: 500 })
  }
}
