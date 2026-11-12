'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryBadge from '@/components/ui/CategoryBadge'

export default function DashboardPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [claims, setClaims] = useState([])
  const [activeTab, setActiveTab] = useState('inventory') // 'inventory' | 'claims'
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    async function initDashboard() {
      setLoading(true)
      try {
        const authRes = await fetch('/api/auth/me')
        const authData = await authRes.json()

        const isUserAdmin = authData.user?.role === 'admin' || authData.user?.role === 'security'
        const localAdmin = localStorage.getItem('isAdmin') === 'true'

        if (!isUserAdmin && !localAdmin) {
          setIsAdmin(false)
          setLoading(false)
          return
        }

        setIsAdmin(true)
        await loadData()
      } catch (err) {
        console.error('Failed to init dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    initDashboard()
  }, [])

  async function loadData() {
    try {
      const itemsRes = await fetch('/api/items')
      const itemsData = await itemsRes.json()
      if (itemsData.items) setItems(itemsData.items)

      const claimsRes = await fetch('/api/claims')
      const claimsData = await claimsRes.json()
      if (claimsData.claims) setClaims(claimsData.claims)
    } catch (err) {
      console.error('Failed to reload dashboard data:', err)
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('currentUser')
    window.dispatchEvent(new Event('authChange'))
    setIsAdmin(false)
    router.push('/login')
  }

  async function handleStatusChange(id, newStatus) {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setActionMessage(`Item #${id.slice(-4)} updated to ${newStatus}`)
        setTimeout(() => setActionMessage(''), 3000)
        await loadData()
      }
    } catch {
      alert('Failed to update status')
    }
  }

  async function handleClaimReview(claimId, newStatus) {
    let reason = ''
    if (newStatus === 'Rejected') {
      reason = prompt('Enter rejection reason for student:') || 'Proof details insufficient'
    }

    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          rejectionReason: reason,
          officerRemarks: 'Reviewed at Security Block 29 desk',
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setActionMessage(data.message || 'Claim updated!')
        setTimeout(() => setActionMessage(''), 3500)
        await loadData()
      }
    } catch {
      alert('Failed to process claim review')
    }
  }

  async function handleDelete(id) {
    if (confirm('Are you sure you want to delete this custody record?')) {
      try {
        const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setActionMessage('Record deleted')
          setTimeout(() => setActionMessage(''), 3000)
          await loadData()
        }
      } catch {
        alert('Failed to delete item')
      }
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slateGray">
        Verifying administrator credentials...
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-softSand p-8 rounded-2xl border border-lightGray shadow-sm space-y-4">
          <span className="text-xs bg-red-100 text-crimsonRed border border-red-200 px-3 py-1 rounded-full font-semibold inline-block">
            Security Authorization Required
          </span>
          <h1 className="text-2xl font-bold text-charcoal">Admin Custody Restricted</h1>
          <p className="text-slateGray text-sm">
            This dashboard is reserved for campus security staff to verify ownership claims and manage physical custody.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/login"
              className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-sm"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/found"
              className="bg-warmWhite border border-lightGray text-midnightNavy hover:bg-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              Browse Found Catalog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const total = items.length
  const pending = items.filter((i) => i.status === 'Pending').length
  const claimed = items.filter((i) => i.status === 'Claimed' || i.status === 'Verified').length
  const disputed = items.filter((i) => i.status === 'Disputed').length
  const handedOver = items.filter((i) => i.status === 'Handed Over').length

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase()) ||
      item.finderName?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Campus Security Desk</h1>
            <span className="text-xs bg-emerald-50 text-forestGreen border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
              Officer Mode · Block 29
            </span>
          </div>
          <p className="text-slateGray text-sm">
            Institutional item custody, evidence review, and physical handover log.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto bg-warmWhite border border-lightGray hover:bg-white text-crimsonRed font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm"
        >
          Logout Admin
        </button>
      </div>

      {actionMessage && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-forestGreen text-xs p-3 rounded-lg flex items-center gap-2">
          <span>✓</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        <div className="bg-softSand p-4 rounded-xl border border-lightGray shadow-sm">
          <p className="text-[11px] text-slateGray font-semibold uppercase tracking-wider">Total Items</p>
          <p className="text-2xl font-bold text-charcoal mt-1">{total}</p>
        </div>

        <div className="bg-softSand p-4 rounded-xl border border-lightGray shadow-sm">
          <p className="text-[11px] text-amberOrange font-semibold uppercase tracking-wider">Pending Custody</p>
          <p className="text-2xl font-bold text-amberOrange mt-1">{pending}</p>
        </div>

        <div className="bg-softSand p-4 rounded-xl border border-lightGray shadow-sm">
          <p className="text-[11px] text-brightAzure font-semibold uppercase tracking-wider">Under Claim</p>
          <p className="text-2xl font-bold text-brightAzure mt-1">{claimed}</p>
        </div>

        <div className="bg-softSand p-4 rounded-xl border border-red-200 shadow-sm bg-red-50/50">
          <p className="text-[11px] text-crimsonRed font-semibold uppercase tracking-wider">Disputed Claims</p>
          <p className="text-2xl font-bold text-crimsonRed mt-1">{disputed}</p>
        </div>

        <div className="bg-softSand p-4 rounded-xl border border-lightGray shadow-sm">
          <p className="text-[11px] text-forestGreen font-semibold uppercase tracking-wider">Handed Over</p>
          <p className="text-2xl font-bold text-forestGreen mt-1">{handedOver}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-lightGray mb-6">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === 'inventory'
              ? 'border-electricBlue text-electricBlue'
              : 'border-transparent text-slateGray hover:text-charcoal'
          }`}
        >
          📦 Physical Inventory ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            activeTab === 'claims'
              ? 'border-electricBlue text-electricBlue'
              : 'border-transparent text-slateGray hover:text-charcoal'
          }`}
        >
          📝 Claim Verifications ({claims.length})
        </button>
      </div>

      {activeTab === 'inventory' ? (
        <div className="bg-softSand rounded-xl border border-lightGray overflow-hidden shadow-sm">
          
          <div className="p-4 border-b border-lightGray bg-softSand flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-charcoal text-base">Campus Custody Registry</h2>
              <p className="text-xs text-slateGray">Manage verification states and shelf locations</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search items or finders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal placeholder-slateGray/70 focus:outline-none focus:ring-2 focus:ring-skyBlue"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-warmWhite border border-lightGray rounded-lg px-2.5 py-1.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-skyBlue"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Claimed">Claimed</option>
                <option value="Verified">Verified</option>
                <option value="Disputed">Disputed</option>
                <option value="Handed Over">Handed Over</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-warmWhite border-b border-lightGray text-xs font-semibold text-slateGray">
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location &amp; Shelf</th>
                  <th className="p-3">Finder</th>
                  <th className="p-3">Current Status</th>
                  <th className="p-3">Change Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lightGray bg-warmWhite">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-softSand/40 transition">
                    <td className="p-3 font-semibold text-charcoal">
                      <Link href={`/found/${item.id}`} className="hover:text-brightAzure">
                        {item.itemName}
                      </Link>
                      <span className="block text-xs font-normal text-slateGray">ID: #{item.id?.slice(-6) || item.id}</span>
                    </td>
                    <td className="p-3">
                      <CategoryBadge category={item.category} />
                    </td>
                    <td className="p-3 text-xs text-slateGray">
                      <p className="font-medium text-charcoal">📍 {item.location}</p>
                      <p className="font-mono text-electricBlue">🗄️ {item.shelfBin || 'Unassigned'}</p>
                    </td>
                    <td className="p-3 text-xs text-slateGray">
                      <p className="font-medium text-charcoal">{item.finderName}</p>
                      <p>{item.finderContact}</p>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="p-3">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="bg-warmWhite border border-lightGray rounded px-2 py-1 text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-skyBlue"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Claimed">Claimed</option>
                        <option value="Verified">Verified</option>
                        <option value="Disputed">Disputed</option>
                        <option value="Handed Over">Handed Over</option>
                      </select>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        href={`/found/${item.id}`}
                        className="text-xs text-brightAzure hover:text-electricBlue font-medium hover:underline"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-xs text-crimsonRed hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        /* Claims Queue Tab */
        <div className="bg-softSand rounded-xl border border-lightGray overflow-hidden shadow-sm">
          <div className="p-4 border-b border-lightGray bg-softSand">
            <h2 className="font-bold text-charcoal text-base">Student Ownership Proof Queue</h2>
            <p className="text-xs text-slateGray">Validate student evidence against physical item custody</p>
          </div>

          <div className="divide-y divide-lightGray bg-warmWhite">
            {claims.map((claim) => (
              <div key={claim.id} className="p-4 hover:bg-softSand/30 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal text-sm">
                      Claim for: {claim.itemId?.itemName || 'Item'}
                    </span>
                    <StatusBadge status={claim.status} />
                  </div>
                  <p className="text-xs text-slateGray">
                    Claimant: <span className="font-semibold text-charcoal">{claim.claimant?.name}</span> (Roll #{claim.claimant?.studentId}) · 📞 {claim.claimant?.phone}
                  </p>
                  <p className="text-xs text-slateGray bg-softSand p-2.5 rounded-lg border border-lightGray">
                    <strong>Evidence Description:</strong> {claim.proofDescription}
                  </p>
                  {claim.answerToChallenge && (
                    <p className="text-xs text-amberOrange font-medium">
                      🛡️ Security Challenge Answer: &quot;{claim.answerToChallenge}&quot;
                    </p>
                  )}
                  {claim.handoverOtp && (
                    <p className="text-xs text-forestGreen font-bold font-mono">
                      🔑 Generated OTP Token: {claim.handoverOtp}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {claim.status === 'Submitted' && (
                    <>
                      <button
                        onClick={() => handleClaimReview(claim.id, 'Approved')}
                        className="bg-forestGreen hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                      >
                        ✓ Approve &amp; Generate OTP
                      </button>
                      <button
                        onClick={() => handleClaimReview(claim.id, 'Rejected')}
                        className="bg-crimsonRed hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                      >
                        ✗ Reject Claim
                      </button>
                    </>
                  )}

                  {claim.status === 'Approved' && (
                    <button
                      onClick={() => handleClaimReview(claim.id, 'Handed Over')}
                      className="bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
                    >
                      🤝 Complete Handover
                    </button>
                  )}

                  {claim.status === 'Disputed' && (
                    <span className="text-xs bg-amber-100 text-amberOrange border border-amber-200 px-3 py-1 rounded-full font-semibold">
                      Dual Claims: Call Both to Block 29
                    </span>
                  )}
                </div>
              </div>
            ))}

            {claims.length === 0 && (
              <div className="p-8 text-center text-slateGray text-sm">
                No claim submissions awaiting review.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
