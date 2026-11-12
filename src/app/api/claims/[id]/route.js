import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Claim from '@/models/Claim'
import Item from '@/models/Item'
import { getSessionFromRequest } from '@/lib/auth'

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, rejectionReason, officerRemarks } = body

    const session = await getSessionFromRequest(request)
    await connectDB()

    const claim = await Claim.findById(id).populate('itemId')
    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (status) {
      claim.status = status
    }

    if (status === 'Approved') {
      // Generate secure 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      claim.handoverOtp = otp

      // Update item status to Verified
      if (claim.itemId) {
        await Item.findByIdAndUpdate(claim.itemId._id, { status: 'Verified' })
      }
    }

    if (status === 'Handed Over') {
      if (claim.itemId) {
        await Item.findByIdAndUpdate(claim.itemId._id, {
          status: 'Handed Over',
          handoverInfo: `Handed over to ${claim.claimant.name} (${claim.claimant.studentId}) on ${new Date().toLocaleDateString()}`,
        })
      }
    }

    if (status === 'Rejected' && rejectionReason) {
      claim.rejectionReason = rejectionReason
      // Revert item back to Pending if no other approved claims
      if (claim.itemId) {
        await Item.findByIdAndUpdate(claim.itemId._id, { status: 'Pending' })
      }
    }

    claim.reviewedBy = {
      officerName: session?.name || 'Security Officer',
      reviewedAt: new Date(),
      notes: officerRemarks || '',
    }

    await claim.save()

    return NextResponse.json({
      message: `Claim status updated to ${status}`,
      claim: { ...claim.toObject(), id: claim._id.toString() },
    })
  } catch (error) {
    console.error('Review Claim Error:', error)
    return NextResponse.json({ error: 'Failed to process claim review' }, { status: 500 })
  }
}
