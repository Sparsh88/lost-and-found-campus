import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { requireAdmin } from '@/lib/auth'
import Claim from '@/models/Claim'
import { AdminNotesSchema, formatZodError } from '@/lib/validators'
import { recordAuditLog } from '@/lib/audit'

export async function PATCH(request, { params }) {
  try {
    const { admin, errorResponse } = await requireAdmin(request)
    if (errorResponse) return errorResponse

    const { id } = params
    const body = await request.json()
    const validation = AdminNotesSchema.safeParse(body)
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

    claim.internalAdminNotes = validation.data.internalAdminNotes
    if (validation.data.allowResubmission !== undefined) {
      claim.allowResubmission = validation.data.allowResubmission
    }
    await claim.save()

    await recordAuditLog({
      actor: admin,
      action: 'ADMIN_NOTES_UPDATED',
      targetModel: 'Claim',
      targetId: claim._id.toString(),
      details: `Updated internal notes on claim ${claim.claimId} (allowResubmission=${claim.allowResubmission})`,
      request,
    })

    return NextResponse.json({
      message: 'Internal admin notes saved.',
      claim: { ...claim.toObject(), id: claim._id.toString() },
    })
  } catch (error) {
    console.error('Admin Notes Error:', error)
    return NextResponse.json({ error: 'Failed to save internal notes' }, { status: 500 })
  }
}
