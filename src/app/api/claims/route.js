import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Claim from '@/models/Claim'
import FoundItem from '@/models/FoundItem'
import { requireUser } from '@/lib/auth'
import { ClaimCreateSchema, formatZodError } from '@/lib/validators'
import { generateUniqueCode } from '@/lib/idGenerator'
import { checkRateLimit } from '@/lib/rateLimit'
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

export async function GET(request) {
  try {
    const { user, errorResponse } = await requireUser(request)
    if (errorResponse) return errorResponse

    await connectDB()

    // Students strictly see ONLY their own claims, never internalAdminNotes or other claimants' data
    const claims = await Claim.find({ claimantId: user.id })
      .select('-internalAdminNotes')
      .populate(
        'foundItemId',
        'foundId itemName category foundLocation foundDate imageUrl custodyOffice status handoverInfo'
      )
      .sort({ createdAt: -1 })
      .lean()

    const formatted = claims.map((c) => ({
      ...c,
      id: c._id.toString(),
      foundItem: c.foundItemId
        ? {
            id: c.foundItemId._id?.toString(),
            foundId: c.foundItemId.foundId,
            itemName: c.foundItemId.itemName,
            category: c.foundItemId.category,
            foundLocation: c.foundItemId.foundLocation,
            foundDate: c.foundItemId.foundDate,
            imageUrl: resolveItemImage(
              c.foundItemId.itemName,
              c.foundItemId.category,
              c.foundItemId.imageUrl
            ),
            custodyOffice: c.foundItemId.custodyOffice,
            status: c.foundItemId.status,
            handoverInfo: c.foundItemId.handoverInfo,
          }
        : null,
    }))

    return NextResponse.json({ claims: formatted })
  } catch (error) {
    console.error('Get Student Claims Error:', error)
    return NextResponse.json({ error: 'Failed to load your claims' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { user, errorResponse } = await requireUser(request)
    if (errorResponse) return errorResponse

    const rl = checkRateLimit(request, `claim-submit:${user.id}`, {
      maxRequests: 15,
      windowMs: 5 * 60_000,
    })
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many claim attempts. Please wait a few minutes.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSeconds) } }
      )
    }

    const body = await request.json()
    const validation = ClaimCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    const data = validation.data

    // Enforce server-verified registration number matching the authenticated campus user
    const submittedRegNo = data.registrationNumber.toUpperCase().trim()
    if (
      user.registrationNumber &&
      user.registrationNumber !== 'N/A' &&
      submittedRegNo !== user.registrationNumber.toUpperCase().trim()
    ) {
      return NextResponse.json(
        {
          error: `Registration number must match your verified campus profile (${user.registrationNumber}).`,
        },
        { status: 400 }
      )
    }

    await connectDB()

    const foundItem = mongoose.Types.ObjectId.isValid(data.foundItemId)
      ? await FoundItem.findById(data.foundItemId)
      : await FoundItem.findOne({ foundId: data.foundItemId })

    if (!foundItem) {
      return NextResponse.json({ error: 'Found item record does not exist.' }, { status: 404 })
    }

    if (foundItem.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'This item is no longer available for claiming.' },
        { status: 400 }
      )
    }

    if (foundItem.finderId.toString() === user.id) {
      return NextResponse.json(
        { error: 'You cannot submit an ownership claim on an item you reported finding.' },
        { status: 400 }
      )
    }

    const existingClaims = await Claim.find({
      foundItemId: foundItem._id,
      claimantId: user.id,
    }).sort({ createdAt: -1 })

    const activeClaim = existingClaims.find((c) =>
      ['PENDING', 'ADDITIONAL_INFO_REQUESTED', 'APPROVED'].includes(c.status)
    )
    if (activeClaim) {
      return NextResponse.json(
        { error: 'You already have an active claim for this found item.' },
        { status: 409 }
      )
    }

    let permittedOldClaim = null
    if (existingClaims.length > 0) {
      permittedOldClaim = existingClaims.find((c) => Boolean(c.allowResubmission))
      if (!permittedOldClaim) {
        return NextResponse.json(
          {
            error:
              'You have already submitted a claim for this item. Resubmission requires administrator approval.',
          },
          { status: 403 }
        )
      }
    }

    // Verify private file ownership
    const proofFile = await verifyPrivateFileOwnership(data.proofFile, user.id)
    if (proofFile === undefined) {
      return NextResponse.json({ error: 'Unauthorized proof document reference.' }, { status: 400 })
    }

    const purchaseBillFile = await verifyPrivateFileOwnership(data.purchaseBillFile, user.id)
    if (purchaseBillFile === undefined) {
      return NextResponse.json({ error: 'Unauthorized purchase bill reference.' }, { status: 400 })
    }

    const additionalFile = await verifyPrivateFileOwnership(data.additionalFile, user.id)
    if (additionalFile === undefined) {
      return NextResponse.json({ error: 'Unauthorized additional evidence reference.' }, { status: 400 })
    }

    const newClaim = await Claim.create({
      claimId: generateUniqueCode('CLM'),
      foundItemId: foundItem._id,
      claimantId: user.id,
      claimantName: data.fullName,
      registrationNumber: user.registrationNumber || submittedRegNo,
      mobileNumber: data.mobileNumber,
      ownershipDetails: data.ownershipDetails,
      proofFile,
      purchaseBillFile,
      additionalEvidenceText: data.additionalEvidenceText || '',
      additionalFile,
      status: 'PENDING',
    })

    if (permittedOldClaim) {
      permittedOldClaim.allowResubmission = false
      await permittedOldClaim.save()
    }

    await FoundItem.updateOne({ _id: foundItem._id }, { $inc: { claimsCount: 1 } })

    await notifyAllAdmins({
      type: 'NEW_CLAIM',
      title: `New Ownership Claim: ${foundItem.itemName}`,
      message: `${newClaim.claimantName} (${newClaim.registrationNumber}) submitted claim ${newClaim.claimId} for ${foundItem.foundId}.`,
      relatedModel: 'Claim',
      relatedId: newClaim._id.toString(),
      privatePayload: {
        claimId: newClaim.claimId,
        foundItemId: foundItem._id.toString(),
        foundId: foundItem.foundId,
        claimantName: newClaim.claimantName,
        registrationNumber: newClaim.registrationNumber,
      },
    })

    return NextResponse.json(
      {
        message: 'Ownership claim submitted privately. Campus administration will review your evidence.',
        claim: {
          id: newClaim._id.toString(),
          claimId: newClaim.claimId,
          status: newClaim.status,
          createdAt: newClaim.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { error: 'You already have an active claim for this found item.' },
        { status: 409 }
      )
    }
    console.error('Submit Claim Error:', error)
    return NextResponse.json({ error: 'Failed to submit ownership claim' }, { status: 500 })
  }
}
