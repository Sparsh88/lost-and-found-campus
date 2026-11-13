'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'

export default function ClaimsPage() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [responseMap, setResponseMap] = useState({})
  const [responseFileMap, setResponseFileMap] = useState({})
  const [uploadingForClaimId, setUploadingForClaimId] = useState('')
  const [submittingId, setSubmittingId] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const authRes = await fetch('/api/auth/me', { cache: 'no-store' })
      const authData = await authRes.json()
      setCurrentUser(authData.user || null)

      if (authData.user) {
        const claimsRes = await fetch('/api/claims', { cache: 'no-store' })
        const claimsData = await claimsRes.json()
        if (claimsRes.ok && claimsData.claims) {
          setClaims(claimsData.claims)
        }
      } else {
        setClaims([])
      }
    } catch (err) {
      console.error('Failed to load claims:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
    const handleUpdate = () => loadData()
    window.addEventListener('campusDataUpdated', handleUpdate)
    window.addEventListener('focus', handleUpdate)
    return () => {
      window.removeEventListener('campusDataUpdated', handleUpdate)
      window.removeEventListener('focus', handleUpdate)
    }
  }, [loadData])

  async function handleResponseFileUpload(claimId, file) {
    if (!file) return
    setError('')
    setUploadingForClaimId(claimId)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('purpose', 'additional_evidence')
      const res = await fetch('/api/uploads/private', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to upload supporting document.')
      } else {
        setResponseFileMap((prev) => ({ ...prev, [claimId]: data.file }))
      }
    } catch {
      setError('File upload failed.')
    } finally {
      setUploadingForClaimId('')
    }
  }

  async function handleSubmitAdditionalInfo(e, claimId) {
    e.preventDefault()
    const text = (responseMap[claimId] || '').trim()
    if (!text) {
      setError('Please enter your response before submitting.')
      return
    }
    setError('')
    setFeedback('')
    setSubmittingId(claimId)

    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additionalResponse: text,
          additionalFile: responseFileMap[claimId] || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit additional information.')
      } else {
        setFeedback('Additional evidence sent to campus administration.')
        setResponseMap((prev) => ({ ...prev, [claimId]: '' }))
        setResponseFileMap((prev) => ({ ...prev, [claimId]: null }))
        window.dispatchEvent(new Event('campusDataUpdated'))
        await loadData()
      }
    } catch {
      setError('Unable to reach server.')
    } finally {
      setSubmittingId('')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-emerald-100 text-forestGreen border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
              Private Claim Tracking
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
            Claim &amp; Verification Service
          </h1>
          <p className="text-slateGray text-sm mt-1">
            Track your private ownership claims, respond to verification requests, and view approved handover tokens.
          </p>
        </div>

        <Link
          href="/found"
          className="bg-electricBlue hover:bg-electricBlue-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm self-start sm:self-auto"
        >
          Browse Items to Claim →
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏢</span>
          <div>
            <h3 className="font-bold text-charcoal text-sm">Physical Custody Handover Point</h3>
            <p className="text-xs text-slateGray mt-0.5">
              Campus Security Office: <span className="font-semibold text-charcoal">Block 29 (Ground Floor)</span>. Open daily 09:00 AM – 06:00 PM.
            </p>
          </div>
        </div>
        <div className="text-xs text-slateGray bg-white/80 border border-blue-200/80 px-3 py-1.5 rounded-lg">
          Bring: 🪪 Campus Student ID + 🔢 Handover OTP
        </div>
      </div>

      {feedback && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-forestGreen text-xs p-3 rounded-lg">
          ✓ {feedback}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-charcoal">My Claims</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-softSand border border-lightGray rounded-xl p-6 animate-pulse space-y-2">
                <div className="h-4 bg-lightGray rounded w-1/4"></div>
                <div className="h-3 bg-lightGray/70 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : !currentUser ? (
          <div className="bg-softSand border border-lightGray rounded-xl p-8 text-center space-y-3">
            <h3 className="font-bold text-charcoal">Sign In to View Your Claims</h3>
            <p className="text-slateGray text-xs max-w-md mx-auto">
              Claim evidence and verification status are strictly private to your authenticated student account.
            </p>
            <Link
              href="/login"
              className="inline-block bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold px-5 py-2 rounded-lg transition shadow-sm"
            >
              Sign In
            </Link>
          </div>
        ) : claims.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-softSand border border-lightGray rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-slateGray font-medium">
                      Claim ID: {claim.claimId}
                    </span>
                    <h3 className="font-bold text-charcoal text-base mt-0.5">
                      {claim.foundItem?.itemName || 'Found Campus Item'}
                    </h3>
                    {claim.foundItem && (
                      <p className="text-xs text-slateGray">
                        Item ID: {claim.foundItem.foundId} · 📍 {claim.foundItem.foundLocation}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={claim.status} />
                </div>

                <div className="bg-warmWhite border border-lightGray p-3 rounded-lg text-xs space-y-1.5">
                  <p className="text-slateGray">
                    <span className="font-semibold text-charcoal">Unique Identifiers:</span>{' '}
                    {claim.ownershipDetails?.uniqueIdentifiers}
                  </p>
                  <p className="text-slateGray">
                    <span className="font-semibold text-charcoal">Marks / Stickers:</span>{' '}
                    {claim.ownershipDetails?.marksOrStickers}
                  </p>
                  <p className="text-slateGray">
                    <span className="font-semibold text-charcoal">Contents Inside:</span>{' '}
                    {claim.ownershipDetails?.contentsInside}
                  </p>
                  <p className="text-slateGray">
                    <span className="font-semibold text-charcoal">Owner-Only Detail:</span>{' '}
                    {claim.ownershipDetails?.ownerOnlyDetail}
                  </p>

                  {(claim.proofFile || claim.purchaseBillFile || claim.additionalFile) && (
                    <div className="pt-2 border-t border-lightGray flex flex-wrap gap-2">
                      {claim.proofFile && (
                        <a
                          href={`/api/files/private/${claim.proofFile.fileId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brightAzure hover:underline font-semibold"
                        >
                          📎 Proof File
                        </a>
                      )}
                      {claim.purchaseBillFile && (
                        <a
                          href={`/api/files/private/${claim.purchaseBillFile.fileId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brightAzure hover:underline font-semibold"
                        >
                          🧾 Purchase Bill
                        </a>
                      )}
                      {claim.additionalFile && (
                        <a
                          href={`/api/files/private/${claim.additionalFile.fileId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brightAzure hover:underline font-semibold"
                        >
                          📄 Additional File
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {claim.status === 'APPROVED' && claim.handoverOtp && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs flex items-center justify-between gap-2">
                    <div>
                      <p className="font-bold text-forestGreen">✓ Claim Approved! Ready for Collection</p>
                      <p className="text-forestGreen/80">
                        Present this OTP &amp; Campus ID at {claim.foundItem?.custodyOffice || 'Block 29'}:
                      </p>
                    </div>
                    <div className="bg-white border-2 border-forestGreen px-3 py-1 rounded-md font-mono text-base font-bold text-forestGreen tracking-wider">
                      {claim.handoverOtp}
                    </div>
                  </div>
                )}

                {claim.status === 'COMPLETED' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-forestGreen">
                    ✓ <strong>Physical Handover Completed</strong>
                    {claim.foundItem?.handoverInfo && <p className="mt-0.5">{claim.foundItem.handoverInfo}</p>}
                  </div>
                )}

                {claim.status === 'ADDITIONAL_INFO_REQUESTED' && (
                  <form
                    onSubmit={(e) => handleSubmitAdditionalInfo(e, claim.id)}
                    className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs space-y-2"
                  >
                    <p className="font-bold text-amberOrange">
                      Admin Requested Additional Information:
                    </p>
                    <p className="text-charcoal">{claim.adminInfoRequestMessage}</p>
                    <textarea
                      rows={2}
                      required
                      placeholder="Provide the requested verification details..."
                      value={responseMap[claim.id] || ''}
                      onChange={(e) =>
                        setResponseMap((prev) => ({ ...prev, [claim.id]: e.target.value }))
                      }
                      className="w-full bg-white border border-amber-300 rounded-lg px-2.5 py-1.5 text-xs text-charcoal focus:outline-none"
                    />
                    <div>
                      <label className="block text-[11px] font-semibold text-charcoal mb-1">
                        Attach Supporting Proof / Bill (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                        onChange={(e) => handleResponseFileUpload(claim.id, e.target.files?.[0])}
                        className="w-full text-[11px] text-slateGray"
                      />
                      {uploadingForClaimId === claim.id && (
                        <p className="text-[11px] text-brightAzure mt-0.5">Uploading privately...</p>
                      )}
                      {responseFileMap[claim.id] && (
                        <p className="text-[11px] text-forestGreen mt-0.5">
                          ✓ {responseFileMap[claim.id].originalName}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={submittingId === claim.id || uploadingForClaimId === claim.id}
                      className="bg-electricBlue hover:bg-electricBlue-hover text-white font-semibold px-3 py-1.5 rounded-lg text-xs"
                    >
                      {submittingId === claim.id ? 'Submitting...' : 'Submit Additional Evidence'}
                    </button>
                  </form>
                )}

                {(claim.status === 'REJECTED' || claim.status === 'CLOSED') && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-crimsonRed space-y-1">
                    <p className="font-bold">
                      {claim.status === 'CLOSED' ? 'Claim Closed' : 'Claim Rejected'}
                    </p>
                    <p>{claim.rejectionReason || 'Claim was not approved.'}</p>
                    {claim.allowResubmission && claim.foundItem?.status === 'AVAILABLE' && (
                      <Link
                        href={`/found/${claim.foundItem.id}?claim=1`}
                        className="inline-block text-brightAzure hover:underline font-semibold pt-1"
                      >
                        Resubmit Claim →
                      </Link>
                    )}
                  </div>
                )}

                {claim.status === 'PENDING' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-slateGray">
                    ⏳ Pending campus administration verification.
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-softSand border border-lightGray rounded-xl p-8 text-center space-y-3">
            <span className="text-3xl block">📋</span>
            <h3 className="font-bold text-charcoal">No Claims Filed Yet</h3>
            <p className="text-slateGray text-xs max-w-md mx-auto">
              If you lost an item and found a matching record in Found Items, click &quot;Claim&quot; to file your private ownership proof.
            </p>
            <div className="pt-2">
              <Link
                href="/found"
                className="inline-block bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
              >
                Browse Found Items Catalog
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
