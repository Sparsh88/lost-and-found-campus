import mongoose from 'mongoose'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import FoundItem from '@/models/FoundItem'
import Claim from '@/models/Claim'
import { getAuthenticatedUser, requireUser, STUDENT_COOKIE_NAME } from '@/lib/auth'
import { FoundItemUpdateSchema, formatZodError } from '@/lib/validators'
import { DEFAULT_ITEM_IMAGE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

async function findFoundItemByIdOrCode(id) {
  const projection = '-hiddenIdentifyingDetails -finderPhone -finderRegistrationNumber -claimsCount -approvedClaimId'
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byId = await FoundItem.findById(id).select(projection).lean()
    if (byId) return byId
  }
  return FoundItem.findOne({ foundId: id }).select(projection).lean()
}

export async function GET(request, { params }) {
  try {
    const { id } = params
    await connectDB()

    const item = await findFoundItemByIdOrCode(id)
    if (!item) {
      return NextResponse.json({ error: 'Found item not found' }, { status: 404 })
    }

    const currentUser = await getAuthenticatedUser(request, { cookieName: STUDENT_COOKIE_NAME })
    const isFinderOwner = Boolean(currentUser && item.finderId?.toString() === currentUser.id)

    let myClaim = null
    let canSubmitClaim = item.status === 'AVAILABLE' && !isFinderOwner

    if (currentUser && item.status === 'AVAILABLE') {
      const existingClaims = await Claim.find({
        foundItemId: item._id,
        claimantId: currentUser.id,
      })
        .sort({ createdAt: -1 })
        .select('claimId status allowResubmission rejectionReason adminInfoRequestMessage createdAt')
        .lean()

      if (existingClaims.length > 0) {
        const latest = existingClaims[0]
        myClaim = {
          id: latest._id.toString(),
          claimId: latest.claimId,
          status: latest.status,
          allowResubmission: Boolean(latest.allowResubmission),
          rejectionReason: latest.rejectionReason || '',
          adminInfoRequestMessage: latest.adminInfoRequestMessage || '',
        }

        const hasActive = existingClaims.some((c) =>
          ['PENDING', 'ADDITIONAL_INFO_REQUESTED', 'APPROVED'].includes(c.status)
        )
        const hasResubmissionPermit = existingClaims.some((c) => Boolean(c.allowResubmission))

        if (hasActive || (!hasResubmissionPermit && existingClaims.length > 0)) {
          canSubmitClaim = false
        }
      }
    }

    return NextResponse.json({
      item: {
        id: item._id.toString(),
        foundId: item.foundId,
        itemName: item.itemName,
        category: item.category,
        description: item.description,
        foundDate: item.foundDate,
        foundTime: item.foundTime || '',
        foundLocation: item.foundLocation,
        location: item.foundLocation,
        imageUrl: item.imageUrl || DEFAULT_ITEM_IMAGE,
        custodyOffice: item.custodyOffice || 'Campus Security Desk (Block 29)',
        shelfBin: item.shelfBin || 'Unassigned',
        status: item.status,
        finderName: item.finderName,
        handoverInfo: item.handoverInfo || '',
        isFinderOwner,
        canSubmitClaim,
        myClaim,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    })
  } catch (error) {
    console.error('Get Found Item Details Error:', error)
    return NextResponse.json({ error: 'Failed to load found item' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { user, errorResponse } = await requireUser(request)
    if (errorResponse) return errorResponse

    const { id } = params
    const body = await request.json()
    const validation = FoundItemUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: formatZodError(validation) }, { status: 400 })
    }

    await connectDB()

    const item = mongoose.Types.ObjectId.isValid(id)
      ? await FoundItem.findById(id)
      : await FoundItem.findOne({ foundId: id })

    if (!item) {
      return NextResponse.json({ error: 'Found item not found' }, { status: 404 })
    }

    if (item.finderId.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Only the finder who submitted this report can edit it.' },
        { status: 403 }
      )
    }

    if (item.status !== 'AVAILABLE' || item.claimsCount > 0) {
      return NextResponse.json(
        { error: 'Items with active claims or non-available status can only be modified by an administrator.' },
        { status: 400 }
      )
    }

    const studentEditable = [
      'itemName',
      'category',
      'description',
      'foundDate',
      'foundTime',
      'foundLocation',
      'imageUrl',
      'imagePublicId',
      'hiddenIdentifyingDetails',
    ]

    for (const key of studentEditable) {
      if (validation.data[key] !== undefined) {
        item[key] =
          validation.data[key] || (key === 'imageUrl' ? DEFAULT_ITEM_IMAGE : validation.data[key])
      }
    }

    await item.save()

    return NextResponse.json({
      message: 'Found item updated successfully.',
      item: {
        id: item._id.toString(),
        foundId: item.foundId,
        itemName: item.itemName,
        category: item.category,
        description: item.description,
        foundDate: item.foundDate,
        foundTime: item.foundTime,
        foundLocation: item.foundLocation,
        location: item.foundLocation,
        imageUrl: item.imageUrl,
        status: item.status,
      },
    })
  } catch (error) {
    console.error('Update Found Item Error:', error)
    return NextResponse.json({ error: 'Failed to update found item' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, errorResponse } = await requireUser(request)
    if (errorResponse) return errorResponse

    const { id } = params
    await connectDB()

    const item = mongoose.Types.ObjectId.isValid(id)
      ? await FoundItem.findById(id)
      : await FoundItem.findOne({ foundId: id })

    if (!item) {
      return NextResponse.json({ error: 'Found item not found' }, { status: 404 })
    }

    if (item.finderId.toString() !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Only the finder can delete their unclaimed report.' },
        { status: 403 }
      )
    }

    if (item.status !== 'AVAILABLE' || item.claimsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete an item that has claims or handover activity.' },
        { status: 400 }
      )
    }

    await FoundItem.deleteOne({ _id: item._id })
    return NextResponse.json({ message: 'Found item report deleted.' })
  } catch (error) {
    console.error('Delete Found Item Error:', error)
    return NextResponse.json({ error: 'Failed to delete found item' }, { status: 500 })
  }
}
