'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryBadge from '@/components/ui/CategoryBadge'

export default function MyReportsPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('lost') // 'lost' | 'found' | 'claims'
  const [lostReports, setLostReports] = useState([])
  const [foundReports, setFoundReports] = useState([])
  const [claims, setClaims] = useState([])

  const loadMyActivity = useCallback(async () => {
    setLoading(true)
    try {
      const authRes = await fetch('/api/auth/me', { cache: 'no-store' })
      const authData = await authRes.json()
      if (!authData.user) {
        setUser(null)
        return
      }
      setUser(authData.user)

      const [lostRes, foundRes, claimsRes] = await Promise.all([
        fetch('/api/lost-items?mine=true', { cache: 'no-store' }),
        fetch('/api/found-items?mine=true', { cache: 'no-store' }),
        fetch('/api/claims', { cache: 'no-store' }),
      ])

      const [lostData, foundData, claimsData] = await Promise.all([
        lostRes.json(),
        foundRes.json(),
        claimsRes.json(),
      ])

      setLostReports(lostData.items || [])
      setFoundReports(foundData.items || [])
      setClaims(claimsData.claims || [])
    } catch (err) {
      console.error('Failed to load activity:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMyActivity()
  }, [loadMyActivity])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slateGray">
        Loading your campus reports and claim history...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-softSand p-8 rounded-2xl border border-lightGray shadow-sm space-y-4">
          <h1 className="text-2xl font-bold text-charcoal">Sign In Required</h1>
          <p className="text-slateGray text-sm">
            Sign in with your campus account to view your personal Lost Reports, Found Reports, and Claim History.
          </p>
          <Link
            href="/login"
            className="inline-block bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-6 py-2.5 rounded-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">My Reports &amp; Activity</h1>
          <p className="text-slateGray text-sm mt-1">
            {user.name} · Registration No: <span className="font-semibold text-charcoal">{user.registrationNumber}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/lost/add"
            className="bg-crimsonRed hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
          >
            + Report Lost Item
          </Link>
          <Link
            href="/found/add"
            className="bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
          >
            + Report Found Item
          </Link>
        </div>
      </div>

      <div className="flex gap-2 border-b border-lightGray">
        <button
          onClick={() => setTab('lost')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            tab === 'lost'
              ? 'border-electricBlue text-electricBlue'
              : 'border-transparent text-slateGray hover:text-charcoal'
          }`}
        >
          My Lost Reports ({lostReports.length})
        </button>
        <button
          onClick={() => setTab('found')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            tab === 'found'
              ? 'border-electricBlue text-electricBlue'
              : 'border-transparent text-slateGray hover:text-charcoal'
          }`}
        >
          My Found Reports ({foundReports.length})
        </button>
        <button
          onClick={() => setTab('claims')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            tab === 'claims'
              ? 'border-electricBlue text-electricBlue'
              : 'border-transparent text-slateGray hover:text-charcoal'
          }`}
        >
          My Claims ({claims.length})
        </button>
      </div>

      {tab === 'lost' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lostReports.length > 0 ? (
            lostReports.map((item) => (
              <div
                key={item.id}
                className="bg-softSand border border-lightGray rounded-xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge category={item.category} />
                  <StatusBadge status={item.status} />
                </div>
                <div>
                  <h3 className="font-bold text-charcoal text-base truncate">{item.itemName}</h3>
                  <p className="text-xs text-slateGray">Report ID: {item.reportId}</p>
                </div>
                <p className="text-xs text-slateGray line-clamp-2">{item.description}</p>
                <div className="text-xs text-slateGray space-y-1">
                  <p>📍 {item.lostLocation} · 📅 {item.lostDate}</p>
                  <p className="font-semibold text-forestGreen">
                    💬 Finder Responses: {item.finderSubmissionsCount || 0}
                  </p>
                </div>
                <Link
                  href={`/lost/${item.id}`}
                  className="block text-center bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold py-2 rounded-lg transition"
                >
                  Manage &amp; View Finders →
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-softSand border border-lightGray rounded-xl p-8 text-center text-sm text-slateGray">
              You have not filed any lost item reports yet.
            </div>
          )}
        </div>
      )}

      {tab === 'found' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foundReports.length > 0 ? (
            foundReports.map((item) => (
              <div
                key={item.id}
                className="bg-softSand border border-lightGray rounded-xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <CategoryBadge category={item.category} />
                  <StatusBadge status={item.status} />
                </div>
                <div>
                  <h3 className="font-bold text-charcoal text-base truncate">{item.itemName}</h3>
                  <p className="text-xs text-slateGray">Found ID: {item.foundId}</p>
                </div>
                <p className="text-xs text-slateGray line-clamp-2">{item.description}</p>
                <p className="text-xs text-slateGray">
                  📍 {item.foundLocation} · 📅 {item.foundDate}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/found/${item.id}`}
                    className="flex-1 text-center bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    View Details
                  </Link>
                  {item.status === 'AVAILABLE' && (
                    <Link
                      href={`/found/edit/${item.id}`}
                      className="px-3 bg-warmWhite border border-lightGray text-charcoal text-xs font-semibold py-2 rounded-lg hover:bg-white transition"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-softSand border border-lightGray rounded-xl p-8 text-center text-sm text-slateGray">
              You have not reported any found items yet.
            </div>
          )}
        </div>
      )}

      {tab === 'claims' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {claims.length > 0 ? (
            claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-softSand border border-lightGray rounded-xl p-4 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slateGray">{claim.claimId}</span>
                  <StatusBadge status={claim.status} />
                </div>
                <h3 className="font-bold text-charcoal text-base">
                  {claim.foundItem?.itemName || 'Found Item'}
                </h3>
                <p className="text-xs text-slateGray">
                  Submitted: {new Date(claim.createdAt).toLocaleString()}
                </p>
                {claim.status === 'APPROVED' && claim.handoverOtp && (
                  <p className="text-xs font-bold text-forestGreen font-mono">
                    🔑 Collection OTP: {claim.handoverOtp}
                  </p>
                )}
                <Link
                  href="/claims"
                  className="inline-block text-xs text-brightAzure hover:underline font-semibold pt-1"
                >
                  Open Claim Details →
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-softSand border border-lightGray rounded-xl p-8 text-center text-sm text-slateGray">
              You have not submitted any ownership claims yet.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
