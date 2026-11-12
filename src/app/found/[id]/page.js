'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryBadge from '@/components/ui/CategoryBadge'

export default function ItemDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  // Claim Modal state
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [claimProof, setClaimProof] = useState('')
  const [claimAnswer, setClaimAnswer] = useState('')
  const [claimStudentId, setClaimStudentId] = useState('')
  const [claimPhone, setClaimPhone] = useState('')
  const [claimName, setClaimName] = useState('')
  const [claimEmail, setClaimEmail] = useState('')
  const [submittingClaim, setSubmittingClaim] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [claimSuccess, setClaimSuccess] = useState('')

  useEffect(() => {
    async function loadItem() {
      setLoading(true)
      try {
        const authRes = await fetch('/api/auth/me')
        const authData = await authRes.json()
        if (authData.user) {
          setCurrentUser(authData.user)
          setClaimName(authData.user.name || '')
          setClaimEmail(authData.user.email || '')
          setClaimStudentId(authData.user.studentId || '')
        }

        const res = await fetch(`/api/items/${id}`)
        const data = await res.json()
        if (data.item) {
          setItem(data.item)
        }
      } catch (err) {
        console.error('Failed to load item:', err)
      } finally {
        setLoading(false)
      }
    }
    loadItem()
  }, [id])

  async function handleClaimSubmit(e) {
    e.preventDefault()
    setClaimError('')
    setClaimSuccess('')

    if (!claimProof.trim() || !claimName.trim() || !claimEmail.trim() || !claimStudentId.trim() || !claimPhone.trim()) {
      setClaimError('Please fill in all required fields.')
      return
    }

    setSubmittingClaim(true)

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: id,
          name: claimName.trim(),
          email: claimEmail.trim(),
          studentId: claimStudentId.trim(),
          phone: claimPhone.trim(),
          proofDescription: claimProof.trim(),
          answerToChallenge: claimAnswer.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setClaimError(data.error || 'Failed to submit claim.')
        setSubmittingClaim(false)
        return
      }

      setClaimSuccess(data.message || 'Claim submitted successfully!')
      setTimeout(() => {
        setShowClaimModal(false)
        router.push('/claims')
      }, 1200)
    } catch {
      setClaimError('Network error. Please try again.')
      setSubmittingClaim(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slateGray">
        Loading item custody records...
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-charcoal mb-2">Item Not Found</h2>
        <p className="text-slateGray text-sm mb-4">
          This item does not exist or may have been archived.
        </p>
        <Link href="/found" className="text-brightAzure hover:text-electricBlue hover:underline text-sm font-medium">
          ← Back to Found Items
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      <Link href="/found" className="text-brightAzure hover:text-electricBlue text-sm hover:underline mb-4 inline-block font-medium">
        ← Back to Found Items
      </Link>

      <div className="bg-softSand rounded-xl border border-lightGray overflow-hidden shadow-sm">
        
        <img
          src={item.imageUrl || 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80'}
          alt={item.itemName}
          className="w-full h-64 sm:h-80 object-cover"
        />

        <div className="p-6 space-y-5">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={item.category} />
              <StatusBadge status={item.status} />
              {item.status === 'Disputed' && (
                <span className="text-xs bg-red-100 text-crimsonRed border border-red-200 px-2 py-0.5 rounded-full font-semibold">
                  ⚠️ Dual Claim Under Arbitration
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-charcoal">{item.itemName}</h1>
            <p className="text-xs text-slateGray mt-0.5">Custody ID: #{item.id}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-charcoal mb-1">Description</h2>
            <p className="text-slateGray text-sm whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-warmWhite border border-lightGray p-4 rounded-lg text-sm">
            <div>
              <span className="text-slateGray block text-xs">Found Location</span>
              <span className="font-semibold text-charcoal">📍 {item.location}</span>
            </div>
            <div>
              <span className="text-slateGray block text-xs">Date &amp; Time Logged</span>
              <span className="font-semibold text-charcoal">📅 {item.foundDate} {item.foundTime ? `at ${item.foundTime}` : ''}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-warmWhite border border-lightGray p-4 rounded-lg text-sm">
            <div>
              <span className="text-slateGray block text-xs">Current Custody Location</span>
              <span className="font-semibold text-forestGreen">🏢 {item.custodyOffice || 'Security Block 29'}</span>
            </div>
            <div>
              <span className="text-slateGray block text-xs">Shelf / Storage Bin</span>
              <span className="font-mono text-charcoal font-semibold">{item.shelfBin || 'Unassigned'}</span>
            </div>
          </div>

          <div className="border-t border-lightGray pt-3 text-sm">
            <h2 className="text-sm font-semibold text-charcoal mb-1">Finder Information</h2>
            <p className="text-slateGray">Turned in by: <span className="font-semibold text-charcoal">{item.finderName}</span></p>
            <p className="text-slateGray">Campus Contact: <span className="font-semibold text-charcoal">{item.finderContact}</span></p>
          </div>

          {item.handoverInfo && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm">
              <h2 className="font-semibold text-forestGreen mb-1">Handover Archive Record</h2>
              <p className="text-forestGreen">{item.handoverInfo}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-lightGray pt-4 flex flex-wrap gap-3">
            {item.status !== 'Handed Over' && (
              <button
                onClick={() => setShowClaimModal(true)}
                className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition shadow-sm"
              >
                Claim This Item →
              </button>
            )}

            <Link
              href="/found"
              className="bg-warmWhite border border-lightGray hover:bg-white text-charcoal text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              Browse Other Items
            </Link>
          </div>

        </div>
      </div>

      {/* Claim Submission Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-lightGray space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-lightGray pb-3">
              <div>
                <h3 className="font-bold text-charcoal text-lg">Submit Ownership Claim</h3>
                <p className="text-xs text-slateGray">Item: {item.itemName}</p>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-slateGray hover:text-charcoal text-xl p-1"
              >
                ✕
              </button>
            </div>

            {claimError && (
              <div className="bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg">
                ⚠️ {claimError}
              </div>
            )}

            {claimSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-forestGreen text-xs p-3 rounded-lg">
                ✓ {claimSuccess}
              </div>
            )}

            <form onSubmit={handleClaimSubmit} className="space-y-3">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={claimName}
                    onChange={(e) => setClaimName(e.target.value)}
                    className="w-full border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Student / Roll No *</label>
                  <input
                    type="text"
                    required
                    value={claimStudentId}
                    onChange={(e) => setClaimStudentId(e.target.value)}
                    className="w-full border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Campus Email *</label>
                  <input
                    type="email"
                    required
                    value={claimEmail}
                    onChange={(e) => setClaimEmail(e.target.value)}
                    className="w-full border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="9876543210"
                    value={claimPhone}
                    onChange={(e) => setClaimPhone(e.target.value)}
                    className="w-full border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Proof of Ownership *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe secret marks, contents, purchase invoice date, screen lock pattern, serial number, etc."
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  className="w-full border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                />
              </div>

              {/* Blind Verification Challenge Response if available */}
              {item.verificationAnchors?.secretQuestion && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                  <label className="block text-xs font-bold text-amberOrange">
                    🛡️ Security Challenge: {item.verificationAnchors.secretQuestion}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Type your answer to verify identity..."
                    value={claimAnswer}
                    onChange={(e) => setClaimAnswer(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded px-3 py-1.5 text-xs text-charcoal focus:outline-none"
                  />
                </div>
              )}

              <div className="text-[11px] text-slateGray bg-softSand p-2.5 rounded-lg border border-lightGray">
                ⚖️ <strong>Campus Policy</strong>: Filing false claims violates the University Disciplinary Code. Verified ownership triggers a 6-digit OTP for Block 29 collection.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="flex-1 bg-electricBlue hover:bg-electricBlue-hover disabled:opacity-60 text-white font-medium py-2 rounded-lg text-xs transition shadow-sm"
                >
                  {submittingClaim ? 'Submitting...' : 'Confirm & Submit Claim'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 border border-lightGray rounded-lg text-xs text-charcoal hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
