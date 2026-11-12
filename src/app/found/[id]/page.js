'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryBadge from '@/components/ui/CategoryBadge'
import { getSuggestedItemImage, resolveItemImage } from '@/lib/itemImages'

function FoundItemDetailsContent() {
  const { id } = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  // Claim Modal state
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')

  // Structured mandatory ownership verification questions
  const [uniqueIdentifiers, setUniqueIdentifiers] = useState('')
  const [marksOrStickers, setMarksOrStickers] = useState('')
  const [contentsInside, setContentsInside] = useState('')
  const [ownerOnlyDetail, setOwnerOnlyDetail] = useState('')

  // Private evidence uploads
  const [proofFile, setProofFile] = useState(null)
  const [purchaseBillFile, setPurchaseBillFile] = useState(null)
  const [additionalFile, setAdditionalFile] = useState(null)
  const [additionalEvidenceText, setAdditionalEvidenceText] = useState('')
  const [uploadingField, setUploadingField] = useState('')

  const [submittingClaim, setSubmittingClaim] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [claimSuccess, setClaimSuccess] = useState('')

  const loadItem = useCallback(async () => {
    setLoading(true)
    try {
      const [authRes, itemRes] = await Promise.all([
        fetch('/api/auth/me', { cache: 'no-store' }),
        fetch(`/api/found-items/${id}`, { cache: 'no-store' }),
      ])
      const authData = await authRes.json()
      if (authData.user) {
        setCurrentUser(authData.user)
        setFullName(authData.user.name || '')
        setRegistrationNumber(authData.user.registrationNumber || authData.user.studentId || '')
        setMobileNumber(authData.user.phone || '')
      } else {
        setCurrentUser(null)
      }

      const itemData = await itemRes.json()
      if (itemRes.ok && itemData.item) {
        setItem(itemData.item)
        if (searchParams.get('claim') === '1' && itemData.item.canSubmitClaim) {
          setShowClaimModal(true)
        }
      } else {
        setItem(null)
      }
    } catch (err) {
      console.error('Failed to load found item:', err)
      setItem(null)
    } finally {
      setLoading(false)
    }
  }, [id, searchParams])

  useEffect(() => {
    loadItem()
  }, [loadItem])

  async function handlePrivateUpload(file, purpose, setter) {
    if (!file) return
    setClaimError('')
    setUploadingField(purpose)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('purpose', purpose)

      const res = await fetch('/api/uploads/private', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        setClaimError(data.error || 'Failed to upload private document.')
      } else {
        setter(data.file)
      }
    } catch {
      setClaimError('File upload failed. Please try again.')
    } finally {
      setUploadingField('')
    }
  }

  async function handleClaimSubmit(e) {
    e.preventDefault()
    setClaimError('')
    setClaimSuccess('')

    if (
      !fullName.trim() ||
      !registrationNumber.trim() ||
      !mobileNumber.trim() ||
      !uniqueIdentifiers.trim() ||
      !marksOrStickers.trim() ||
      !contentsInside.trim() ||
      !ownerOnlyDetail.trim()
    ) {
      setClaimError('Please complete all required identity and ownership description fields.')
      return
    }

    setSubmittingClaim(true)

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foundItemId: item.id,
          fullName: fullName.trim(),
          registrationNumber: registrationNumber.trim(),
          mobileNumber: mobileNumber.trim(),
          ownershipDetails: {
            uniqueIdentifiers: uniqueIdentifiers.trim(),
            marksOrStickers: marksOrStickers.trim(),
            contentsInside: contentsInside.trim(),
            ownerOnlyDetail: ownerOnlyDetail.trim(),
          },
          proofFile,
          purchaseBillFile,
          additionalEvidenceText: additionalEvidenceText.trim(),
          additionalFile,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setClaimError(data.error || 'Failed to submit ownership claim.')
        setSubmittingClaim(false)
        return
      }

      setClaimSuccess(data.message || 'Claim submitted successfully!')
      window.dispatchEvent(new Event('notificationsUpdated'))
      setTimeout(() => {
        setShowClaimModal(false)
        router.push('/claims')
      }, 1100)
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
          src={resolveItemImage(item.itemName, item.category, item.imageUrl)}
          alt={item.itemName}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = getSuggestedItemImage(item.itemName, item.category)
          }}
          className="w-full h-64 sm:h-80 object-cover"
        />

        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={item.category} />
              <StatusBadge status={item.status} />
            </div>
            <h1 className="text-2xl font-bold text-charcoal">{item.itemName}</h1>
            <p className="text-xs text-slateGray mt-0.5">Found Item ID: {item.foundId}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-charcoal mb-1">Description</h2>
            <p className="text-slateGray text-sm whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-warmWhite border border-lightGray p-4 rounded-lg text-sm">
            <div>
              <span className="text-slateGray block text-xs">Found Location</span>
              <span className="font-semibold text-charcoal">📍 {item.foundLocation}</span>
            </div>
            <div>
              <span className="text-slateGray block text-xs">Date &amp; Time Logged</span>
              <span className="font-semibold text-charcoal">
                📅 {item.foundDate} {item.foundTime ? `at ${item.foundTime}` : ''}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-warmWhite border border-lightGray p-4 rounded-lg text-sm">
            <div>
              <span className="text-slateGray block text-xs">Current Custody Location</span>
              <span className="font-semibold text-forestGreen">🏢 {item.custodyOffice}</span>
            </div>
            <div>
              <span className="text-slateGray block text-xs">Shelf / Storage Bin</span>
              <span className="font-mono text-charcoal font-semibold">{item.shelfBin}</span>
            </div>
          </div>

          <div className="border-t border-lightGray pt-3 text-sm">
            <h2 className="text-sm font-semibold text-charcoal mb-1">Reported By</h2>
            <p className="text-slateGray">
              Turned in by: <span className="font-semibold text-charcoal">{item.finderName}</span>
            </p>
            <p className="text-xs text-slateGray mt-0.5">
              🔒 Finder contact details are kept private with campus administration.
            </p>
          </div>

          {item.handoverInfo && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm">
              <h2 className="font-semibold text-forestGreen mb-1">Handover Record</h2>
              <p className="text-forestGreen">{item.handoverInfo}</p>
            </div>
          )}

          {item.myClaim && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-charcoal">Your Claim ({item.myClaim.claimId})</span>
                <StatusBadge status={item.myClaim.status} />
              </div>
              {item.myClaim.rejectionReason && (
                <p className="text-crimsonRed">Reason: {item.myClaim.rejectionReason}</p>
              )}
              <Link href="/claims" className="text-brightAzure hover:underline font-semibold inline-block pt-1">
                Manage your claim in My Claims →
              </Link>
            </div>
          )}

          <div className="border-t border-lightGray pt-4 flex flex-wrap gap-3">
            {item.status === 'AVAILABLE' && !item.isFinderOwner && item.canSubmitClaim && (
              <button
                onClick={() => setShowClaimModal(true)}
                className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition shadow-sm"
              >
                Claim This Item →
              </button>
            )}

            {item.isFinderOwner && item.status === 'AVAILABLE' && (
              <Link
                href={`/found/edit/${item.id}`}
                className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition shadow-sm"
              >
                Edit Found Report
              </Link>
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

      {/* Dedicated Private Claim Submission Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl p-6 shadow-2xl border border-lightGray space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-lightGray pb-3">
              <div>
                <h3 className="font-bold text-charcoal text-lg">Submit Ownership Claim</h3>
                <p className="text-xs text-slateGray">
                  Item: {item.itemName} ({item.foundId})
                </p>
              </div>
              <button
                onClick={() => setShowClaimModal(false)}
                className="text-slateGray hover:text-charcoal text-xl p-1"
              >
                ✕
              </button>
            </div>

            {!currentUser ? (
              <div className="bg-softSand border border-lightGray rounded-xl p-5 text-center space-y-3">
                <p className="text-sm font-semibold text-charcoal">Student Sign-In Required</p>
                <p className="text-xs text-slateGray">
                  Please log in with your student account to submit a private ownership claim.
                </p>
                <Link
                  href="/login"
                  className="inline-block bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold px-5 py-2 rounded-lg"
                >
                  Sign In to Claim →
                </Link>
              </div>
            ) : (
              <form onSubmit={handleClaimSubmit} className="space-y-3.5">
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-[11px] text-slateGray">
                  🔒 Your claim details, mobile number, and uploaded bills/documents are strictly private and visible only to you and authorized administrators.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Registration No *</label>
                    <input
                      type="text"
                      required
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-softSand border border-lightGray rounded-xl p-3.5 space-y-3">
                  <p className="text-xs font-bold text-charcoal">
                    Ownership Verification Questions (Mandatory)
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      1. What makes this item uniquely identifiable? *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Model number, serial number, engraving, custom tag, etc."
                      value={uniqueIdentifiers}
                      onChange={(e) => setUniqueIdentifiers(e.target.value)}
                      className="w-full bg-white border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      2. Are there scratches, marks, stickers or other identifying characteristics? *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Describe specific scratches, stickers, dents, keychain, or write 'None'..."
                      value={marksOrStickers}
                      onChange={(e) => setMarksOrStickers(e.target.value)}
                      className="w-full bg-white border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      3. What was stored inside the item? *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Items inside bag/wallet/case, or 'N/A' if empty..."
                      value={contentsInside}
                      onChange={(e) => setContentsInside(e.target.value)}
                      className="w-full bg-white border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      4. What is a detail that only the actual owner would know? *
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="Wallpaper, password hint, initials inside cover, purchase store/date..."
                      value={ownerOnlyDetail}
                      onChange={(e) => setOwnerOnlyDetail(e.target.value)}
                      className="w-full bg-white border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Proof Photo / Document (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) =>
                        handlePrivateUpload(e.target.files?.[0], 'claim_proof', setProofFile)
                      }
                      className="w-full text-[11px] text-slateGray file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border file:border-lightGray file:text-[11px] file:font-semibold file:bg-warmWhite"
                    />
                    {uploadingField === 'claim_proof' && (
                      <p className="text-[11px] text-brightAzure mt-0.5">Uploading privately...</p>
                    )}
                    {proofFile && (
                      <p className="text-[11px] text-forestGreen mt-0.5">✓ {proofFile.originalName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">
                      Purchase Bill / Invoice (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) =>
                        handlePrivateUpload(e.target.files?.[0], 'purchase_bill', setPurchaseBillFile)
                      }
                      className="w-full text-[11px] text-slateGray file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border file:border-lightGray file:text-[11px] file:font-semibold file:bg-warmWhite"
                    />
                    {uploadingField === 'purchase_bill' && (
                      <p className="text-[11px] text-brightAzure mt-0.5">Uploading privately...</p>
                    )}
                    {purchaseBillFile && (
                      <p className="text-[11px] text-forestGreen mt-0.5">✓ {purchaseBillFile.originalName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Additional Evidence (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any extra context or supporting note..."
                    value={additionalEvidenceText}
                    onChange={(e) => setAdditionalEvidenceText(e.target.value)}
                    className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none mb-2"
                  />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) =>
                      handlePrivateUpload(e.target.files?.[0], 'additional_evidence', setAdditionalFile)
                    }
                    className="w-full text-[11px] text-slateGray file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border file:border-lightGray file:text-[11px] file:font-semibold file:bg-warmWhite"
                  />
                  {uploadingField === 'additional_evidence' && (
                    <p className="text-[11px] text-brightAzure mt-0.5">Uploading privately...</p>
                  )}
                  {additionalFile && (
                    <p className="text-[11px] text-forestGreen mt-0.5">✓ {additionalFile.originalName}</p>
                  )}
                </div>

                <div className="text-[11px] text-slateGray bg-softSand p-2.5 rounded-lg border border-lightGray">
                  ⚖️ <strong>Campus Policy</strong>: Filing false claims violates the University Disciplinary Code. Approved claims receive a collection OTP for Block 29 verification.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={submittingClaim || Boolean(uploadingField)}
                    className="flex-1 bg-electricBlue hover:bg-electricBlue-hover disabled:opacity-60 text-white font-medium py-2 rounded-lg text-xs transition shadow-sm"
                  >
                    {submittingClaim ? 'Submitting Claim...' : 'Confirm & Submit Private Claim'}
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function FoundItemDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slateGray">
          Loading item custody records...
        </div>
      }
    >
      <FoundItemDetailsContent />
    </Suspense>
  )
}
