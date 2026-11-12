'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'

export default function ClaimsPage() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const authRes = await fetch('/api/auth/me')
        const authData = await authRes.json()
        setCurrentUser(authData.user)

        const claimsRes = await fetch('/api/claims')
        const claimsData = await claimsRes.json()
        if (claimsData.claims) {
          setClaims(claimsData.claims)
        }
      } catch (err) {
        console.error('Failed to load claims:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-emerald-100 text-forestGreen border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
              Module 3 · Official Service
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
            Claim &amp; Verification Service
          </h1>
          <p className="text-slateGray text-sm mt-1">
            Track your filed ownership claims, view approved handover tokens, and manage custody verification.
          </p>
        </div>

        <Link
          href="/found"
          className="bg-electricBlue hover:bg-electricBlue-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm self-start sm:self-auto"
        >
          Browse Items to Claim →
        </Link>
      </div>

      {/* Handover Notice Banner */}
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

      {/* Claims List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-charcoal">Your Active Claims</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-softSand border border-lightGray rounded-xl p-6 animate-pulse space-y-2">
                <div className="h-4 bg-lightGray rounded w-1/4"></div>
                <div className="h-3 bg-lightGray/70 rounded w-1/2"></div>
              </div>
            ))}
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
                    <span className="text-xs text-slateGray font-medium">Claim ID: #{claim.id.slice(-6)}</span>
                    <h3 className="font-bold text-charcoal text-base mt-0.5">
                      {claim.itemId?.itemName || 'Campus Property Item'}
                    </h3>
                  </div>
                  <StatusBadge status={claim.status} />
                </div>

                <div className="bg-warmWhite border border-lightGray p-3 rounded-lg text-xs space-y-1.5">
                  <p className="text-slateGray">
                    <span className="font-semibold text-charcoal">Claimant:</span> {claim.claimant?.name} ({claim.claimant?.studentId})
                  </p>
                  <p className="text-slateGray">
                    <span className="font-semibold text-charcoal">Proof Summary:</span> {claim.proofDescription}
                  </p>
                  {claim.answerToChallenge && (
                    <p className="text-slateGray">
                      <span className="font-semibold text-charcoal">Challenge Response:</span> {claim.answerToChallenge}
                    </p>
                  )}
                </div>

                {/* Status Specific Banners */}
                {claim.status === 'Approved' && claim.handoverOtp && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs flex items-center justify-between">
                    <div>
                      <p className="font-bold text-forestGreen">✓ Claim Approved by Security!</p>
                      <p className="text-forestGreen/80">Present this OTP at Block 29 desk:</p>
                    </div>
                    <div className="bg-white border-2 border-forestGreen px-3 py-1 rounded-md font-mono text-base font-bold text-forestGreen tracking-wider">
                      {claim.handoverOtp}
                    </div>
                  </div>
                )}

                {claim.status === 'Disputed' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amberOrange space-y-1">
                    <p className="font-bold">⚠️ Dual Claim Detected</p>
                    <p>Another student has claimed this item. Please report to Security Office (Block 29) for in-person proof validation.</p>
                  </div>
                )}

                {claim.status === 'Submitted' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-slateGray">
                    ⏳ Waiting for Duty Security Officer review.
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
              If you lost an item and found a matching record in the catalog, click &quot;Claim Item&quot; to file your proof of ownership.
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
