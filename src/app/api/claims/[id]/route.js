import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Claim from '@/models/Claim'
import FoundItem from '@/models/FoundItem'
import { requireUser } from '@/lib/auth'
import { ClaimStudentResponseSchema, formatZodError } from '@/lib/validators'
import { readFromGridFS } from '@/lib/uploads'
import { resolveItemImage } from '@/lib/itemImages'
import { notifyAllAdmins } from '@/lib/notifications'

export const dynamic = 'force-dynamic'

async function verifyPrivateFileOwnership(fileRef, userId) {
  if (!fileRef) return null
  const found = await readFromGridFS('private_evidence', fileRef.fileId)
  if (!found || found.fileDoc.metadata?.uploaderId !== userId) {
    return undefined
  }
  return {
    fileId: fileRef.fileId,
    originalName: found.fileDoc.filename,
    mimeType: found.fileDoc.contentType || fileRef.mimeType,
    size: found.fileDoc.metadata?.size || found.buffer.length,
  }
}

export async function GET(request, { params }) {
  try {
    const { user, errorResponse } = await requireUser(request)
    if (errorResponse) return errorResponse

    const { id } = params
    await connectDB()

    const claim = (
      mongoose.Types.ObjectId.isValid(id)
        ? await Claim.findById(id)
            .select('-internalAdminNotes')
            .populate('foundItemId', 'foundId itemName category foundLocation foundDate imageUrl status custodyOffice handoverInfo')
        : await Claim.findOne({ claimId: id })
            .select('-internalAdminNotes')
            .populate('foundItemId', 'foundId itemName category foundLocation foundDate imageUrl status custodyOffice handoverInfo')
    )?.toObject()

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (claim.claimantId.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot view another student\'s claim details.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      claim: {
        ...claim,
        id: claim._id.toString(),
        foundItemId: claim.foundItemId
          ? {
              ...claim.foundItemId,
              imageUrl: resolveItemImage(
                claim.foundItemId.itemName,
                claim.foundItemId.category,
                claim.foundItemId.imageUrl
              ),
            }
          : null,
      },
    })
  } catch (error) {
    console.error('Get Claim Detail Error:', error)
    return NextResponse.json({ error: 'Failed to load claim' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { user, errorResponse } = await requireUser(request)
    if (errorResponse) return errorResponse

    const { id } = params
    const body = await request.json()
    const validation = ClaimStudentResponseSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    await connectDB()

    const claim = mongoose.Types.ObjectId.isValid(id)
      ? await Claim.findById(id)
      : await Claim.findOne({ claimId: id })

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (claim.claimantId.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You cannot modify another student\'s claim.' },
        { status: 403 }
      )
    }

    if (claim.status !== 'ADDITIONAL_INFO_REQUESTED') {
      return NextResponse.json(
        { error: 'Additional information can only be submitted when requested by an administrator.' },
        { status: 400 }
      )
    }

    const foundItem = await FoundItem.findById(claim.foundItemId).lean()
    if (!foundItem || foundItem.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'This found item is no longer open for claim updates.' },
        { status: 400 }
      )
    }

    const proofFile = await verifyPrivateFileOwnership(validation.data.proofFile, user.id)
    if (proofFile === undefined) {
      return NextResponse.json({ error: 'Unauthorized proof file' }, { status: 400 })
    }
    const purchaseBillFile = await verifyPrivateFileOwnership(
      validation.data.purchaseBillFile,
      user.id
    )
    if (purchaseBillFile === undefined) {
      return NextResponse.json({ error: 'Unauthorized purchase bill file' }, { status: 400 })
    }
    const additionalFile = await verifyPrivateFileOwnership(
      validation.data.additionalFile,
      user.id
    )
    if (additionalFile === undefined) {
      return NextResponse.json({ error: 'Unauthorized additional file' }, { status: 400 })
    }

    claim.claimantAdditionalResponse = validation.data.additionalResponse
    if (proofFile) claim.proofFile = proofFile
    if (purchaseBillFile) claim.purchaseBillFile = purchaseBillFile
    if (additionalFile) claim.additionalFile = additionalFile
    claim.status = 'PENDING'
    await claim.save()

    await notifyAllAdmins({
      type: 'CLAIM_INFO_SUBMITTED',
      title: `Additional Info Provided: ${claim.claimId}`,
      message: `${claim.claimantName} responded with requested evidence for ${foundItem.itemName}.`,
      relatedModel: 'Claim',
      relatedId: claim._id.toString(),
      privatePayload: {
        claimId: claim.claimId,
        foundItemId: foundItem._id.toString(),
      },
    })

    return NextResponse.json({
      message: 'Additional evidence submitted for administrator review.',
      claim: {
        id: claim._id.toString(),
        claimId: claim.claimId,
        status: claim.status,
      },
    })
  } catch (error) {
    console.error('Student Update Claim Error:', error)
    return NextResponse.json({ error: 'Failed to submit additional evidence' }, { status: 500 })
  }
}
