import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Claim from '@/models/Claim'
import Item from '@/models/Item'
import { getSessionFromRequest } from '@/lib/auth'
import { ClaimSchema } from '@/lib/validators'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const session = await getSessionFromRequest(request)

    await connectDB()

    const filter = {}
    if (itemId) {
      filter.itemId = itemId
    }

    // Non-admins can only see their own claims unless filtering by item
    if (session && session.role !== 'admin' && session.role !== 'security' && !itemId) {
      filter['claimant.email'] = session.email
    }

    const claims = await Claim.find(filter)
      .populate('itemId', 'itemName category location status imageUrl')
      .sort({ createdAt: -1 })
      .lean()

    const formattedClaims = claims.map((c) => ({
      ...c,
      id: c._id.toString(),
    }))

    return NextResponse.json({ claims: formattedClaims })
  } catch (error) {
    console.error('Get Claims Error:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const validation = ClaimSchema.safeParse(body)

    if (!validation.success) {
      const firstError = validation.error.errors[0]?.message || 'Invalid claim details'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const session = await getSessionFromRequest(request)
    await connectDB()

    const { itemId, name, email, studentId, phone, proofDescription, answerToChallenge } = validation.data

    const targetItem = await Item.findById(itemId)
    if (!targetItem) {
      return NextResponse.json({ error: 'Referenced found item does not exist' }, { status: 404 })
    }

    // Check existing claims on this item
    const existingClaimsCount = await Claim.countDocuments({
      itemId,
      status: { $in: ['Submitted', 'Under Review', 'Approved'] },
    })

    // If there is already another active claim, trigger DISPUTED state!
    if (existingClaimsCount > 0) {
      targetItem.status = 'Disputed'
      await targetItem.save()
    } else {
      targetItem.status = 'Claimed'
      await targetItem.save()
    }

    const newClaim = await Claim.create({
      itemId,
      claimant: {
        userId: session?.id || null,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        studentId: studentId.trim(),
        phone: phone.trim(),
      },
      proofDescription: proofDescription.trim(),
      answerToChallenge: answerToChallenge?.trim() || '',
      status: existingClaimsCount > 0 ? 'Disputed' : 'Submitted',
    })

    return NextResponse.json(
      {
        message: existingClaimsCount > 0
          ? 'Claim registered. Multiple claims detected: item routed to Security Dispute Review.'
          : 'Claim submitted successfully. Security will review your ownership proof.',
        claim: { ...newClaim.toObject(), id: newClaim._id.toString() },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Submit Claim Error:', error)
    return NextResponse.json({ error: 'Failed to submit claim' }, { status: 500 })
  }
}
