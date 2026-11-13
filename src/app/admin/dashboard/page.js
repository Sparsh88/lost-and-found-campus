'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryBadge from '@/components/ui/CategoryBadge'
import { resolveItemImage } from '@/lib/itemImages'

export default function AdminDashboardPage() {
  const router = useRouter()

  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'lost' | 'found' | 'claims' | 'handovers' | 'audit'

  const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalLostReports: 0,
    totalFoundReports: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    returnedItems: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [handovers, setHandovers] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [adminNotifications, setAdminNotifications] = useState([])
  const [adminUnreadCount, setAdminUnreadCount] = useState(0)
  const [notifOpen, setNotifOpen] = useState(false)

  // Search / filters
  const [lostSearch, setLostSearch] = useState('')
  const [foundSearch, setFoundSearch] = useState('')
  const [foundStatusFilter, setFoundStatusFilter] = useState('All')

  // Selected Found Item for Claim Arbitration
  const [selectedFoundItemId, setSelectedFoundItemId] = useState('')
  const [claimWorkspace, setClaimWorkspace] = useState({ foundItem: null, claims: [], handover: null })
  const [loadingClaims, setLoadingClaims] = useState(false)

  // Modals & Drawers
  const [finderDrawerItem, setFinderDrawerItem] = useState(null)
  const [finderSubmissions, setFinderSubmissions] = useState([])
  const [viewClaimModal, setViewClaimModal] = useState(null)
  const [rejectModalClaim, setRejectModalClaim] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectNotes, setRejectNotes] = useState('')
  const [rejectAllowResubmit, setRejectAllowResubmit] = useState(false)

  const [infoModalClaim, setInfoModalClaim] = useState(null)
  const [infoMessage, setInfoMessage] = useState('')
  const [infoNotes, setInfoNotes] = useState('')

  const [notesDraftMap, setNotesDraftMap] = useState({})
  const [handoverModalData, setHandoverModalData] = useState(null)
  const [handoverForm, setHandoverForm] = useState({
    staffMemberName: '',
    handoverDateTime: '',
    otpCode: '',
    studentIdentityVerified: false,
    handoverConfirmed: false,
    acknowledgementNotes: '',
    handoverPhotoFile: null,
  })
  const [uploadingHandoverPhoto, setUploadingHandoverPhoto] = useState(false)

  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyAction, setBusyAction] = useState(false)

  const showToast = (msg, isError = false) => {
    if (isError) {
      setActionError(msg)
      setActionMessage('')
    } else {
      setActionMessage(msg)
      setActionError('')
      setTimeout(() => setActionMessage(''), 4500)
    }
  }

  const loadAdminNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?scope=admin&limit=20', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setAdminNotifications(data.notifications || [])
      setAdminUnreadCount(data.unreadCount || 0)
    } catch {}
  }, [])

  const loadAllData = useCallback(async () => {
    try {
      const [ovRes, lostRes, foundRes, handRes, auditRes] = await Promise.all([
        fetch('/api/admin/overview', { cache: 'no-store' }),
        fetch('/api/admin/lost-items', { cache: 'no-store' }),
        fetch('/api/admin/found-items', { cache: 'no-store' }),
        fetch('/api/admin/handovers', { cache: 'no-store' }),
        fetch('/api/admin/audit-logs', { cache: 'no-store' }),
      ])

      const [ovData, lostData, foundData, handData, auditData] = await Promise.all([
        ovRes.json(),
        lostRes.json(),
        foundRes.json(),
        handRes.json(),
        auditRes.json(),
      ])

      if (ovRes.ok) {
        setMetrics(ovData.metrics || {})
        setRecentActivities(ovData.recentActivities || [])
      }
      if (lostRes.ok) setLostItems(lostData.items || [])
      if (foundRes.ok) setFoundItems(foundData.items || [])
      if (handRes.ok) setHandovers(handData.handovers || [])
      if (auditRes.ok) setAuditLogs(auditData.logs || [])
      await loadAdminNotifications()
    } catch (err) {
      console.error('Admin loadAllData error:', err)
    }
  }, [loadAdminNotifications])

  const loadClaimsForFoundItem = useCallback(async (foundItemId) => {
    if (!foundItemId) return
    setLoadingClaims(true)
    try {
      const res = await fetch(`/api/admin/found-items/${foundItemId}/claims`, {
        cache: 'no-store',
      })
      const data = await res.json()
      if (res.ok) {
        setClaimWorkspace({
          foundItem: data.foundItem,
          claims: data.claims || [],
          handover: data.handover || null,
        })
        const initialDrafts = {}
        for (const c of data.claims || []) {
          initialDrafts[c.id] = c.internalAdminNotes || ''
        }
        setNotesDraftMap(initialDrafts)
      }
    } catch (err) {
      console.error('Failed to load item claims:', err)
    } finally {
      setLoadingClaims(false)
    }
  }, [])

  useEffect(() => {
    async function init() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/auth/me', { cache: 'no-store' })
        const data = await res.json()
        if (!data.admin) {
          setAdmin(null)
          setLoading(false)
          return
        }
        setAdmin(data.admin)
        setHandoverForm((prev) => ({ ...prev, staffMemberName: data.admin.name }))
        await loadAllData()
      } catch {
        setAdmin(null)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [loadAllData])

  useEffect(() => {
    if (!admin) return
    let es = null
    try {
      es = new EventSource('/api/notifications/stream?scope=admin')
      es.addEventListener('notification', () => {
        loadAdminNotifications()
        loadAllData()
      })
    } catch {}
    const timer = setInterval(loadAdminNotifications, 6000)
    const onCampusUpdate = () => loadAllData()
    window.addEventListener('campusDataUpdated', onCampusUpdate)
    window.addEventListener('focus', onCampusUpdate)
    return () => {
      if (es) es.close()
      clearInterval(timer)
      window.removeEventListener('campusDataUpdated', onCampusUpdate)
      window.removeEventListener('focus', onCampusUpdate)
    }
  }, [admin, loadAdminNotifications, loadAllData])

  useEffect(() => {
    if (selectedFoundItemId) {
      loadClaimsForFoundItem(selectedFoundItemId)
    }
  }, [selectedFoundItemId, loadClaimsForFoundItem])

  async function handleAdminLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    setAdmin(null)
    router.push('/admin/login')
  }

  async function openFinderDrawer(lostItem) {
    setFinderDrawerItem(lostItem)
    setFinderSubmissions([])
    try {
      const res = await fetch(`/api/lost-items/${lostItem.id}/finder`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) setFinderSubmissions(data.submissions || [])
    } catch {}
  }

  async function handleLostStatusChange(id, status) {
    try {
      const res = await fetch(`/api/admin/lost-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Failed to update status', true)
      } else {
        showToast(data.message)
        await loadAllData()
      }
    } catch {
      showToast('Server error updating lost item', true)
    }
  }

  async function handleFoundItemUpdate(id, updates) {
    try {
      const res = await fetch(`/api/admin/found-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Failed to update found item', true)
      } else {
        showToast(data.message)
        await loadAllData()
        if (selectedFoundItemId === id) {
          await loadClaimsForFoundItem(id)
        }
      }
    } catch {
      showToast('Server error updating found item', true)
    }
  }

  async function handleApproveClaim(claim) {
    if (
      !confirm(
        `Approve claim ${claim.claimId} for ${claim.claimantName}? All other pending claims on this item will be automatically closed and the item reserved for handover.`
      )
    ) {
      return
    }
    setBusyAction(true)
    try {
      const res = await fetch(`/api/admin/claims/${claim.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internalAdminNotes: notesDraftMap[claim.id] || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Approval failed', true)
      } else {
        showToast(data.message)
        setViewClaimModal(null)
        await loadAllData()
        if (selectedFoundItemId) await loadClaimsForFoundItem(selectedFoundItemId)
      }
    } catch {
      showToast('Network error approving claim', true)
    } finally {
      setBusyAction(false)
    }
  }

  async function handleRejectSubmit(e) {
    e.preventDefault()
    if (!rejectModalClaim) return
    setBusyAction(true)
    try {
      const res = await fetch(`/api/admin/claims/${rejectModalClaim.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectionReason: rejectReason.trim(),
          internalAdminNotes: rejectNotes.trim(),
          allowResubmission: rejectAllowResubmit,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Failed to reject claim', true)
      } else {
        showToast(data.message)
        setRejectModalClaim(null)
        setRejectReason('')
        setRejectNotes('')
        setRejectAllowResubmit(false)
        await loadAllData()
        if (selectedFoundItemId) await loadClaimsForFoundItem(selectedFoundItemId)
      }
    } catch {
      showToast('Network error rejecting claim', true)
    } finally {
      setBusyAction(false)
    }
  }

  async function handleRequestInfoSubmit(e) {
    e.preventDefault()
    if (!infoModalClaim) return
    setBusyAction(true)
    try {
      const res = await fetch(`/api/admin/claims/${infoModalClaim.id}/request-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestMessage: infoMessage.trim(),
          internalAdminNotes: infoNotes.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Failed to request info', true)
      } else {
        showToast(data.message)
        setInfoModalClaim(null)
        setInfoMessage('')
        setInfoNotes('')
        await loadAllData()
        if (selectedFoundItemId) await loadClaimsForFoundItem(selectedFoundItemId)
      }
    } catch {
      showToast('Network error requesting info', true)
    } finally {
      setBusyAction(false)
    }
  }

  async function handleSaveNotes(claimId, allowResubmission) {
    try {
      const res = await fetch(`/api/admin/claims/${claimId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          internalAdminNotes: notesDraftMap[claimId] || '',
          ...(allowResubmission !== undefined ? { allowResubmission } : {}),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Failed to save notes', true)
      } else {
        showToast(data.message)
        if (selectedFoundItemId) await loadClaimsForFoundItem(selectedFoundItemId)
      }
    } catch {
      showToast('Failed to save internal notes', true)
    }
  }

  function openHandoverModal(foundItem, approvedClaim) {
    const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setHandoverModalData({ foundItem, approvedClaim })
    setHandoverForm({
      staffMemberName: admin?.name || '',
      handoverDateTime: nowLocal,
      otpCode: '',
      studentIdentityVerified: false,
      handoverConfirmed: false,
      acknowledgementNotes: '',
      handoverPhotoFile: null,
    })
  }

  async function handleHandoverPhotoUpload(file) {
    if (!file) return
    setUploadingHandoverPhoto(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('purpose', 'handover_photo')
      const res = await fetch('/api/uploads/private', {
        method: 'POST',
        headers: { 'x-admin-portal': '1' },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Photo upload failed', true)
      } else {
        setHandoverForm((prev) => ({ ...prev, handoverPhotoFile: data.file }))
      }
    } catch {
      showToast('Photo upload failed', true)
    } finally {
      setUploadingHandoverPhoto(false)
    }
  }

  async function handleCompleteHandover(e) {
    e.preventDefault()
    if (!handoverModalData) return
    setBusyAction(true)
    try {
      const res = await fetch('/api/admin/handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId: handoverModalData.approvedClaim.id,
          foundItemId: handoverModalData.foundItem.id,
          staffMemberName: handoverForm.staffMemberName.trim(),
          handoverDateTime: handoverForm.handoverDateTime,
          studentIdentityVerified: handoverForm.studentIdentityVerified,
          handoverConfirmed: handoverForm.handoverConfirmed,
          otpCode: handoverForm.otpCode.trim(),
          acknowledgementNotes: handoverForm.acknowledgementNotes.trim(),
          handoverPhotoFile: handoverForm.handoverPhotoFile,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Failed to record handover', true)
      } else {
        showToast(data.message)
        setHandoverModalData(null)
        await loadAllData()
        if (selectedFoundItemId) await loadClaimsForFoundItem(selectedFoundItemId)
      }
    } catch {
      showToast('Network error recording handover', true)
    } finally {
      setBusyAction(false)
    }
  }

  async function markAllAdminNotifsRead() {
    try {
      await fetch('/api/notifications/read-all?scope=admin', { method: 'PATCH' })
      await loadAdminNotifications()
    } catch {}
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slateGray">
        Verifying administrator authorization...
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-softSand p-8 rounded-2xl border border-lightGray shadow-sm space-y-4">
          <span className="text-xs bg-red-100 text-crimsonRed border border-red-200 px-3 py-1 rounded-full font-semibold inline-block">
            Access Denied · Administrator Authorization Required
          </span>
          <h1 className="text-2xl font-bold text-charcoal">Admin Custody Restricted</h1>
          <p className="text-slateGray text-sm">
            Student accounts and unauthenticated visitors cannot access the Admin Portal.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/admin/login"
              className="bg-midnightNavy hover:bg-midnightNavy-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-sm"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/"
              className="bg-warmWhite border border-lightGray text-midnightNavy hover:bg-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              Return to Student Site
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const filteredLost = lostItems.filter(
    (item) =>
      item.itemName?.toLowerCase().includes(lostSearch.toLowerCase()) ||
      item.reportId?.toLowerCase().includes(lostSearch.toLowerCase()) ||
      item.reporterName?.toLowerCase().includes(lostSearch.toLowerCase()) ||
      item.reporterRegistrationNumber?.toLowerCase().includes(lostSearch.toLowerCase())
  )

  const filteredFound = foundItems.filter((item) => {
    const matchSearch =
      item.itemName?.toLowerCase().includes(foundSearch.toLowerCase()) ||
      item.foundId?.toLowerCase().includes(foundSearch.toLowerCase()) ||
      item.finderName?.toLowerCase().includes(foundSearch.toLowerCase()) ||
      item.finderRegistrationNumber?.toLowerCase().includes(foundSearch.toLowerCase())
    const matchStatus = foundStatusFilter === 'All' || item.status === foundStatusFilter
    return matchSearch && matchStatus
  })

  const itemsWithClaims = foundItems.filter((i) => i.totalClaimants > 0)
  const reservedItems = foundItems.filter((i) => i.status === 'RESERVED_FOR_HANDOVER')

  return (
    <div className="min-h-screen bg-warmWhite">
      {/* Dedicated Admin Header matching existing UI styling */}
      <header className="bg-white border-b border-lightGray sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">🛡️</span>
            <div>
              <span className="font-bold text-charcoal text-base sm:text-lg tracking-tight block leading-tight">
                Campus Lost &amp; Found — Admin Desk
              </span>
              <span className="text-[11px] text-slateGray hidden sm:block">
                {admin.name} ({admin.role.toUpperCase()} · {admin.registrationNumber})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-lg bg-warmWhite border border-lightGray hover:bg-softSand text-charcoal transition"
                aria-label="Admin notifications"
              >
                <Bell className="w-4 h-4" />
                {adminUnreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-crimsonRed text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                    {adminUnreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-lightGray rounded-xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 bg-softSand border-b border-lightGray flex items-center justify-between">
                    <span className="text-xs font-bold text-charcoal">
                      Admin Alerts ({adminUnreadCount} unread)
                    </span>
                    {adminUnreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAdminNotifsRead}
                        className="text-[11px] text-brightAzure hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-lightGray">
                    {adminNotifications.length > 0 ? (
                      adminNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs ${n.isRead ? 'bg-white' : 'bg-blue-50/50'}`}
                        >
                          <p className="font-semibold text-charcoal">{n.title}</p>
                          <p className="text-slateGray mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-slateGray/80 mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slateGray">No admin alerts.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/"
              className="hidden sm:inline-block bg-warmWhite border border-lightGray hover:bg-softSand text-charcoal text-xs font-medium px-3 py-1.5 rounded-lg transition"
            >
              Student Portal
            </Link>

            <button
              onClick={handleAdminLogout}
              className="bg-warmWhite border border-lightGray hover:bg-white text-crimsonRed text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-sm"
            >
              Logout Admin
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {actionMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-forestGreen text-xs p-3 rounded-lg">
            ✓ {actionMessage}
          </div>
        )}
        {actionError && (
          <div className="bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg">
            ⚠️ {actionError}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-lightGray">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'lost', label: `🔍 Lost Items (${lostItems.length})` },
            { id: 'found', label: `📦 Found Items (${foundItems.length})` },
            { id: 'claims', label: `⚖️ Claim Management (${metrics.pendingClaims || 0} pending)` },
            { id: 'handovers', label: `🤝 Physical Handovers (${reservedItems.length} ready)` },
            { id: 'audit', label: `📜 Activity & Audit Logs` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-3 px-3.5 text-sm font-semibold transition border-b-2 ${
                activeTab === t.id
                  ? 'border-electricBlue text-electricBlue'
                  : 'border-transparent text-slateGray hover:text-charcoal'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* A. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="bg-softSand p-4 rounded-xl border border-lightGray shadow-sm">
                <p className="text-[11px] text-slateGray font-semibold uppercase">Students</p>
                <p className="text-2xl font-bold text-charcoal mt-1">{metrics.totalStudents}</p>
              </div>
              <div className="bg-softSand p-4 rounded-xl border border-lightGray shadow-sm">
                <p className="text-[11px] text-crimsonRed font-semibold uppercase">Lost Reports</p>
                <p className="text-2xl font-bold text-crimsonRed mt-1">{metrics.totalLostReports}</p>
              </div>
              <div className="bg-softSand p-4 rounded-xl border border-lightGray shadow-sm">
                <p className="text-[11px] text-brightAzure font-semibold uppercase">Found Reports</p>
                <p className="text-2xl font-bold text-brightAzure mt-1">{metrics.totalFoundReports}</p>
              </div>
              <div className="bg-softSand p-4 rounded-xl border border-amber-200 shadow-sm">
                <p className="text-[11px] text-amberOrange font-semibold uppercase">Pending Claims</p>
                <p className="text-2xl font-bold text-amberOrange mt-1">{metrics.pendingClaims}</p>
              </div>
              <div className="bg-softSand p-4 rounded-xl border border-lightGray shadow-sm">
                <p className="text-[11px] text-electricBlue font-semibold uppercase">Approved Claims</p>
                <p className="text-2xl font-bold text-electricBlue mt-1">{metrics.approvedClaims}</p>
              </div>
              <div className="bg-softSand p-4 rounded-xl border border-lightGray shadow-sm">
                <p className="text-[11px] text-slateGray font-semibold uppercase">Rejected/Closed</p>
                <p className="text-2xl font-bold text-charcoal mt-1">{metrics.rejectedClaims}</p>
              </div>
              <div className="bg-softSand p-4 rounded-xl border border-emerald-200 shadow-sm">
                <p className="text-[11px] text-forestGreen font-semibold uppercase">Returned Items</p>
                <p className="text-2xl font-bold text-forestGreen mt-1">{metrics.returnedItems}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-softSand border border-lightGray rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-charcoal text-base">Items Requiring Claim Review</h2>
                  <button
                    onClick={() => setActiveTab('claims')}
                    className="text-xs text-brightAzure hover:underline font-semibold"
                  >
                    Open Claims Desk →
                  </button>
                </div>
                {itemsWithClaims.length > 0 ? (
                  <div className="space-y-2">
                    {itemsWithClaims.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="bg-warmWhite border border-lightGray rounded-lg p-3 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <p className="font-bold text-charcoal">
                            {item.itemName} ({item.foundId})
                          </p>
                          <p className="text-slateGray">
                            Total Claimants: {item.totalClaimants} · Pending:{' '}
                            {item.claimBreakdown?.pending || 0}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFoundItemId(item.id)
                            setActiveTab('claims')
                          }}
                          className="bg-electricBlue hover:bg-electricBlue-hover text-white px-3 py-1.5 rounded-lg font-semibold"
                        >
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slateGray">No found items currently have claims.</p>
                )}
              </div>

              <div className="bg-softSand border border-lightGray rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-charcoal text-base">Recent Administrative Activities</h2>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className="text-xs text-brightAzure hover:underline font-semibold"
                  >
                    Full Log →
                  </button>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((act) => (
                      <div
                        key={act.id}
                        className="bg-warmWhite border border-lightGray rounded-lg p-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-charcoal">{act.action}</span>
                          <span className="text-[11px] text-slateGray">
                            {new Date(act.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slateGray mt-0.5">{act.details}</p>
                        <p className="text-[11px] text-slateGray/80">By: {act.actorName}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slateGray">No recent activity logged.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* B. LOST ITEMS MANAGEMENT */}
        {activeTab === 'lost' && (
          <div className="bg-softSand rounded-xl border border-lightGray overflow-hidden shadow-sm">
            <div className="p-4 border-b border-lightGray flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-charcoal text-base">Lost Items Management</h2>
                <p className="text-xs text-slateGray">
                  View all student lost reports, update status, and inspect private finder submissions
                </p>
              </div>
              <input
                type="text"
                placeholder="Search by report ID, item, reporter..."
                value={lostSearch}
                onChange={(e) => setLostSearch(e.target.value)}
                className="bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-skyBlue"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-warmWhite border-b border-lightGray text-slateGray font-semibold">
                    <th className="p-3">Report ID</th>
                    <th className="p-3">Item &amp; Category</th>
                    <th className="p-3">Reporter &amp; Reg No</th>
                    <th className="p-3">Location &amp; Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Finder Submissions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightGray bg-warmWhite">
                  {filteredLost.map((item) => (
                    <tr key={item.id} className="hover:bg-softSand/40">
                      <td className="p-3 font-mono font-semibold text-charcoal">{item.reportId}</td>
                      <td className="p-3">
                        <p className="font-bold text-charcoal text-sm">{item.itemName}</p>
                        <div className="mt-1">
                          <CategoryBadge category={item.category} />
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-charcoal">{item.reporterName}</p>
                        <p className="text-slateGray">Reg: {item.reporterRegistrationNumber}</p>
                        {item.reporterPhone && (
                          <p className="text-slateGray">📞 {item.reporterPhone}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <p className="text-charcoal">📍 {item.lostLocation}</p>
                        <p className="text-slateGray">📅 {item.lostDate}</p>
                      </td>
                      <td className="p-3 space-y-1">
                        <StatusBadge status={item.status} />
                        <select
                          value={item.status}
                          onChange={(e) => handleLostStatusChange(item.id, e.target.value)}
                          className="block mt-1 bg-white border border-lightGray rounded px-2 py-1 text-xs"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="CLOSED">CLOSED</option>
                          <option value="RETURNED">RETURNED</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => openFinderDrawer(item)}
                          className="bg-electricBlue hover:bg-electricBlue-hover text-white font-semibold px-3 py-1.5 rounded-lg"
                        >
                          View Finders ({item.finderSubmissionsCount || 0})
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLost.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slateGray">
                        No lost item reports found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* C. FOUND ITEMS MANAGEMENT */}
        {activeTab === 'found' && (
          <div className="bg-softSand rounded-xl border border-lightGray overflow-hidden shadow-sm">
            <div className="p-4 border-b border-lightGray flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-charcoal text-base">Found Items Inventory</h2>
                <p className="text-xs text-slateGray">
                  Inspect finder identity, custody shelf/bin, claimant counts, and open claim verification
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search found ID, item, finder..."
                  value={foundSearch}
                  onChange={(e) => setFoundSearch(e.target.value)}
                  className="bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal"
                />
                <select
                  value={foundStatusFilter}
                  onChange={(e) => setFoundStatusFilter(e.target.value)}
                  className="bg-warmWhite border border-lightGray rounded-lg px-2.5 py-1.5 text-xs text-charcoal"
                >
                  <option value="All">All Statuses</option>
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="RESERVED_FOR_HANDOVER">RESERVED_FOR_HANDOVER</option>
                  <option value="RETURNED">RETURNED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-warmWhite border-b border-lightGray text-slateGray font-semibold">
                    <th className="p-3">Found ID &amp; Photo</th>
                    <th className="p-3">Item &amp; Category</th>
                    <th className="p-3">Finder Identity</th>
                    <th className="p-3">Date &amp; Location</th>
                    <th className="p-3">Claimants</th>
                    <th className="p-3">Status &amp; Shelf</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightGray bg-warmWhite">
                  {filteredFound.map((item) => (
                    <tr key={item.id} className="hover:bg-softSand/40">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={resolveItemImage(item.itemName, item.category, item.imageUrl)}
                            alt={item.itemName}
                            className="w-12 h-12 rounded-lg object-cover border border-lightGray shrink-0"
                          />
                          <span className="font-mono font-semibold text-charcoal">
                            {item.foundId}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-charcoal text-sm">{item.itemName}</p>
                        <div className="mt-1">
                          <CategoryBadge category={item.category} />
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-charcoal">{item.finderName}</p>
                        <p className="text-slateGray">Reg: {item.finderRegistrationNumber}</p>
                        <p className="text-slateGray">📞 {item.finderPhone || 'N/A'}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-charcoal">📍 {item.foundLocation}</p>
                        <p className="text-slateGray">
                          📅 {item.foundDate} {item.foundTime}
                        </p>
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-charcoal text-sm">
                          {item.totalClaimants}
                        </span>{' '}
                        <span className="text-slateGray">total</span>
                        {item.claimBreakdown?.pending > 0 && (
                          <span className="block text-amberOrange font-semibold">
                            {item.claimBreakdown.pending} pending
                          </span>
                        )}
                      </td>
                      <td className="p-3 space-y-1">
                        <StatusBadge status={item.status} />
                        <p className="font-mono text-[11px] text-electricBlue">
                          Bin: {item.shelfBin || 'Unassigned'}
                        </p>
                      </td>
                      <td className="p-3 text-right space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFoundItemId(item.id)
                            setActiveTab('claims')
                          }}
                          className="bg-electricBlue hover:bg-electricBlue-hover text-white font-semibold px-3 py-1.5 rounded-lg"
                        >
                          Manage Claims ({item.totalClaimants})
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredFound.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slateGray">
                        No found items match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* D & E. CLAIM MANAGEMENT & ARBITRATION */}
        {activeTab === 'claims' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Sidebar: Found Items list */}
            <div className="lg:col-span-4 bg-softSand border border-lightGray rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-lightGray bg-warmWhite">
                <h2 className="font-bold text-charcoal text-sm">Select Found Item</h2>
                <p className="text-[11px] text-slateGray">
                  Click any found item to inspect &amp; compare all claimants separately
                </p>
              </div>
              <div className="divide-y divide-lightGray max-h-[680px] overflow-y-auto">
                {foundItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedFoundItemId(item.id)}
                    className={`w-full text-left p-3.5 transition block ${
                      selectedFoundItemId === item.id
                        ? 'bg-blue-50 border-l-4 border-l-electricBlue'
                        : 'bg-warmWhite hover:bg-softSand/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-mono text-slateGray">{item.foundId}</p>
                        <p className="text-sm font-bold text-charcoal">{item.itemName}</p>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slateGray mt-1.5">
                      <span>📍 {item.foundLocation}</span>
                      <span className="font-semibold text-charcoal">
                        {item.totalClaimants} claimant(s)
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Main Panel: Individual Claimants Comparison */}
            <div className="lg:col-span-8 space-y-4">
              {!selectedFoundItemId ? (
                <div className="bg-softSand border border-lightGray rounded-xl p-12 text-center text-sm text-slateGray">
                  Select a Found Item from the left panel to review its claimants, compare ownership evidence, and approve or reject claims.
                </div>
              ) : loadingClaims ? (
                <div className="bg-softSand border border-lightGray rounded-xl p-12 text-center text-sm text-slateGray">
                  Loading claimant evidence...
                </div>
              ) : claimWorkspace.foundItem ? (
                <>
                  {/* Found Item Custody & Hidden Details Card */}
                  <div className="bg-softSand border border-lightGray rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={resolveItemImage(
                            claimWorkspace.foundItem.itemName,
                            claimWorkspace.foundItem.category,
                            claimWorkspace.foundItem.imageUrl
                          )}
                          alt={claimWorkspace.foundItem.itemName}
                          className="w-16 h-16 rounded-lg object-cover border border-lightGray"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slateGray">
                              {claimWorkspace.foundItem.foundId}
                            </span>
                            <StatusBadge status={claimWorkspace.foundItem.status} />
                          </div>
                          <h2 className="text-lg font-bold text-charcoal">
                            {claimWorkspace.foundItem.itemName}
                          </h2>
                          <p className="text-xs text-slateGray">
                            Finder: {claimWorkspace.foundItem.finderName} (Reg:{' '}
                            {claimWorkspace.foundItem.finderRegistrationNumber} · 📞{' '}
                            {claimWorkspace.foundItem.finderPhone})
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const bin = prompt(
                              'Assign Shelf / Storage Bin:',
                              claimWorkspace.foundItem.shelfBin || 'BIN-01'
                            )
                            if (bin !== null) {
                              handleFoundItemUpdate(claimWorkspace.foundItem.id, { shelfBin: bin })
                            }
                          }}
                          className="bg-warmWhite border border-lightGray hover:bg-white text-charcoal text-xs font-semibold px-3 py-1.5 rounded-lg"
                        >
                          🗄️ Bin: {claimWorkspace.foundItem.shelfBin || 'Unassigned'}
                        </button>

                        {claimWorkspace.foundItem.status === 'AVAILABLE' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleFoundItemUpdate(claimWorkspace.foundItem.id, {
                                status: 'CLOSED',
                              })
                            }
                            className="bg-warmWhite border border-lightGray hover:bg-white text-crimsonRed text-xs font-semibold px-3 py-1.5 rounded-lg"
                          >
                            Close Item
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs">
                      <span className="font-bold text-amberOrange block mb-0.5">
                        🛡️ Hidden Identifying Details (Admin Verification Reference Only):
                      </span>
                      <p className="text-charcoal">
                        {claimWorkspace.foundItem.hiddenIdentifyingDetails ||
                          'No hidden identifying notes recorded by finder.'}
                      </p>
                    </div>
                  </div>

                  {/* Individual Claimant Cards */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-charcoal text-base">
                      Individual Claimants ({claimWorkspace.claims.length})
                    </h3>

                    {claimWorkspace.claims.length > 0 ? (
                      claimWorkspace.claims.map((claim, idx) => (
                        <div
                          key={claim.id}
                          className="bg-softSand border border-lightGray rounded-xl p-5 shadow-sm space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-lightGray pb-3">
                            <div>
                              <span className="text-xs font-mono text-slateGray">
                                Claimant #{idx + 1} · {claim.claimId}
                              </span>
                              <h4 className="font-bold text-charcoal text-base">
                                {claim.claimantName} — Reg No. {claim.registrationNumber}
                              </h4>
                              <p className="text-xs text-slateGray">
                                📞 {claim.mobileNumber} · Submitted:{' '}
                                {new Date(claim.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <StatusBadge status={claim.status} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-warmWhite border border-lightGray rounded-lg p-3 text-xs">
                            <div>
                              <span className="font-semibold text-charcoal block">
                                Uniquely Identifiable:
                              </span>
                              <p className="text-slateGray">{claim.ownershipDetails?.uniqueIdentifiers}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-charcoal block">
                                Scratches / Stickers / Marks:
                              </span>
                              <p className="text-slateGray">{claim.ownershipDetails?.marksOrStickers}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-charcoal block">
                                Contents Stored Inside:
                              </span>
                              <p className="text-slateGray">{claim.ownershipDetails?.contentsInside}</p>
                            </div>
                            <div>
                              <span className="font-semibold text-charcoal block">
                                Owner-Only Secret Detail:
                              </span>
                              <p className="text-slateGray">{claim.ownershipDetails?.ownerOnlyDetail}</p>
                            </div>
                          </div>

                          {claim.additionalEvidenceText && (
                            <p className="text-xs text-slateGray bg-warmWhite border border-lightGray p-2.5 rounded-lg">
                              <strong>Additional Evidence:</strong> {claim.additionalEvidenceText}
                            </p>
                          )}

                          {claim.claimantAdditionalResponse && (
                            <p className="text-xs text-charcoal bg-blue-50 border border-blue-200 p-2.5 rounded-lg">
                              <strong>Student Follow-up Response:</strong>{' '}
                              {claim.claimantAdditionalResponse}
                            </p>
                          )}

                          {/* Private Uploaded Documents */}
                          <div className="flex flex-wrap gap-2 text-xs">
                            {claim.proofFile && (
                              <a
                                href={`/api/files/private/${claim.proofFile.fileId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-warmWhite border border-lightGray hover:bg-white text-brightAzure font-semibold px-3 py-1.5 rounded-lg"
                              >
                                📎 Proof: {claim.proofFile.originalName}
                              </a>
                            )}
                            {claim.purchaseBillFile && (
                              <a
                                href={`/api/files/private/${claim.purchaseBillFile.fileId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-warmWhite border border-lightGray hover:bg-white text-brightAzure font-semibold px-3 py-1.5 rounded-lg"
                              >
                                🧾 Purchase Bill: {claim.purchaseBillFile.originalName}
                              </a>
                            )}
                            {claim.additionalFile && (
                              <a
                                href={`/api/files/private/${claim.additionalFile.fileId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-warmWhite border border-lightGray hover:bg-white text-brightAzure font-semibold px-3 py-1.5 rounded-lg"
                              >
                                📄 Extra File: {claim.additionalFile.originalName}
                              </a>
                            )}
                          </div>

                          {claim.handoverOtp && (
                            <div className="text-xs font-mono font-bold text-forestGreen bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
                              🔑 Approved Handover OTP: {claim.handoverOtp} (Approved by{' '}
                              {claim.approvedByName})
                            </div>
                          )}

                          {claim.rejectionReason && (
                            <p className="text-xs text-crimsonRed">
                              <strong>Reason:</strong> {claim.rejectionReason}
                            </p>
                          )}

                          {/* Private Internal Admin Notes */}
                          <div className="bg-warmWhite border border-lightGray rounded-lg p-3 space-y-2">
                            <label className="block text-[11px] font-bold text-charcoal">
                              🔒 Internal Admin Notes (Never visible to students)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Add verification observations or internal notes..."
                                value={notesDraftMap[claim.id] || ''}
                                onChange={(e) =>
                                  setNotesDraftMap((prev) => ({
                                    ...prev,
                                    [claim.id]: e.target.value,
                                  }))
                                }
                                className="flex-1 bg-white border border-lightGray rounded-lg px-2.5 py-1.5 text-xs text-charcoal"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveNotes(claim.id)}
                                className="bg-midnightNavy hover:bg-midnightNavy-hover text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                              >
                                Save Note
                              </button>
                            </div>
                          </div>

                          {/* Claim Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setViewClaimModal(claim)}
                              className="bg-warmWhite border border-lightGray hover:bg-white text-charcoal text-xs font-semibold px-3 py-1.5 rounded-lg"
                            >
                              👁️ View Full Comparison
                            </button>

                            {['PENDING', 'ADDITIONAL_INFO_REQUESTED'].includes(claim.status) &&
                              claimWorkspace.foundItem.status === 'AVAILABLE' && (
                                <>
                                  <button
                                    type="button"
                                    disabled={busyAction}
                                    onClick={() => handleApproveClaim(claim)}
                                    className="bg-forestGreen hover:bg-green-700 disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm"
                                  >
                                    ✓ Approve Claim
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyAction}
                                    onClick={() => {
                                      setRejectModalClaim(claim)
                                      setRejectReason('')
                                      setRejectNotes(notesDraftMap[claim.id] || '')
                                      setRejectAllowResubmit(false)
                                    }}
                                    className="bg-crimsonRed hover:bg-red-700 disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm"
                                  >
                                    ✗ Reject Claim
                                  </button>
                                  <button
                                    type="button"
                                    disabled={busyAction}
                                    onClick={() => {
                                      setInfoModalClaim(claim)
                                      setInfoMessage('')
                                      setInfoNotes(notesDraftMap[claim.id] || '')
                                    }}
                                    className="bg-amberOrange hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg shadow-sm"
                                  >
                                    ❓ Request Info
                                  </button>
                                </>
                              )}

                            {(claim.status === 'REJECTED' || claim.status === 'CLOSED') &&
                              claimWorkspace.foundItem.status === 'AVAILABLE' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSaveNotes(claim.id, !claim.allowResubmission)
                                  }
                                  className="bg-warmWhite border border-lightGray hover:bg-white text-brightAzure text-xs font-semibold px-3 py-1.5 rounded-lg"
                                >
                                  {claim.allowResubmission
                                    ? '✓ Resubmission Permitted (Revoke)'
                                    : 'Allow Resubmission'}
                                </button>
                              )}

                            {claim.status === 'APPROVED' &&
                              claimWorkspace.foundItem.status === 'RESERVED_FOR_HANDOVER' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openHandoverModal(claimWorkspace.foundItem, claim)
                                  }
                                  className="bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-sm"
                                >
                                  🤝 Record Physical Handover
                                </button>
                              )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-softSand border border-lightGray rounded-xl p-8 text-center text-sm text-slateGray">
                        No students have claimed this item yet.
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* F. PHYSICAL HANDOVERS TAB */}
        {activeTab === 'handovers' && (
          <div className="space-y-6">
            <div className="bg-softSand border border-lightGray rounded-xl p-5 shadow-sm space-y-3">
              <h2 className="font-bold text-charcoal text-base">
                Items Ready for Physical Handover ({reservedItems.length})
              </h2>
              {reservedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reservedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-warmWhite border border-lightGray rounded-xl p-4 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-mono text-slateGray">{item.foundId}</p>
                        <p className="font-bold text-charcoal text-sm">{item.itemName}</p>
                        <p className="text-xs text-slateGray">
                          📍 {item.custodyOffice} · Shelf: {item.shelfBin}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFoundItemId(item.id)
                          setActiveTab('claims')
                        }}
                        className="bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg"
                      >
                        Open Approved Claim →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slateGray">
                  No items currently awaiting physical handover. Approve a claim first to reserve an item.
                </p>
              )}
            </div>

            <div className="bg-softSand border border-lightGray rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-lightGray">
                <h2 className="font-bold text-charcoal text-base">
                  Completed Handovers Ledger ({handovers.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-warmWhite border-b border-lightGray text-slateGray font-semibold">
                      <th className="p-3">Handover ID</th>
                      <th className="p-3">Item</th>
                      <th className="p-3">Claimant</th>
                      <th className="p-3">Staff Officer</th>
                      <th className="p-3">Date &amp; Time</th>
                      <th className="p-3">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-lightGray bg-warmWhite">
                    {handovers.map((h) => (
                      <tr key={h.id}>
                        <td className="p-3 font-mono font-semibold text-forestGreen">
                          {h.handoverId}
                        </td>
                        <td className="p-3 font-semibold text-charcoal">
                          {h.foundItemId?.itemName || 'Item'} ({h.foundItemId?.foundId})
                        </td>
                        <td className="p-3">
                          {h.claimantName} ({h.claimantRegistrationNumber})
                        </td>
                        <td className="p-3">{h.staffMemberName}</td>
                        <td className="p-3">{new Date(h.handoverDateTime).toLocaleString()}</td>
                        <td className="p-3 space-y-1">
                          <span className="text-forestGreen font-semibold block">
                            ✓ ID Verified &amp; Confirmed
                          </span>
                          {h.handoverPhotoFile?.fileId && (
                            <a
                              href={`/api/files/private/${h.handoverPhotoFile.fileId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brightAzure hover:underline font-semibold"
                            >
                              📷 View Handover Photo
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                    {handovers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slateGray">
                          No completed handovers recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* G. AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="bg-softSand border border-lightGray rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-lightGray">
              <h2 className="font-bold text-charcoal text-base">
                System Security &amp; Administrative Audit Log
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-warmWhite border-b border-lightGray text-slateGray font-semibold">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lightGray bg-warmWhite">
                  {auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-3 whitespace-nowrap text-slateGray">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-charcoal">
                        {log.actorName} ({log.actorRole})
                      </td>
                      <td className="p-3 font-mono text-brightAzure">{log.action}</td>
                      <td className="p-3 font-mono text-slateGray">
                        {log.targetModel} #{log.targetId?.slice(-6)}
                      </td>
                      <td className="p-3 text-charcoal">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* FINDER SUBMISSIONS DRAWER MODAL */}
      {finderDrawerItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl border border-lightGray space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-lightGray pb-3">
              <div>
                <h3 className="font-bold text-charcoal text-lg">
                  Finder Submissions for {finderDrawerItem.itemName}
                </h3>
                <p className="text-xs text-slateGray">{finderDrawerItem.reportId}</p>
              </div>
              <button
                onClick={() => setFinderDrawerItem(null)}
                className="text-slateGray hover:text-charcoal text-xl"
              >
                ✕
              </button>
            </div>
            {finderSubmissions.length > 0 ? (
              <div className="space-y-3">
                {finderSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-softSand border border-lightGray rounded-xl p-4 text-xs space-y-2"
                  >
                    <div className="flex justify-between font-bold text-charcoal">
                      <span>
                        {sub.finderName} (Reg: {sub.registrationNumber})
                      </span>
                      <span>{new Date(sub.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-charcoal">📞 Mobile: {sub.mobileNumber}</p>
                    <p className="bg-warmWhite border border-lightGray p-2.5 rounded-lg text-slateGray">
                      {sub.message}
                    </p>
                    {sub.photoFile?.fileId && (
                      <a
                        href={`/api/files/private/${sub.photoFile.fileId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block text-brightAzure hover:underline font-semibold"
                      >
                        📎 Open Finder Photo ({sub.photoFile.originalName})
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slateGray py-6 text-center">
                No finder submissions recorded for this lost report yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* VIEW FULL CLAIM COMPARISON MODAL */}
      {viewClaimModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl p-6 shadow-2xl border border-lightGray space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-lightGray pb-3">
              <div>
                <h3 className="font-bold text-charcoal text-lg">
                  Claim Verification Comparison ({viewClaimModal.claimId})
                </h3>
                <p className="text-xs text-slateGray">
                  Claimant: {viewClaimModal.claimantName} · Reg: {viewClaimModal.registrationNumber} ·
                  📞 {viewClaimModal.mobileNumber}
                </p>
              </div>
              <button
                onClick={() => setViewClaimModal(null)}
                className="text-slateGray hover:text-charcoal text-xl"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
              <p className="font-bold text-amberOrange">Found Item Hidden Identifying Details:</p>
              <p className="text-charcoal">
                {claimWorkspace.foundItem?.hiddenIdentifyingDetails || 'None recorded.'}
              </p>
            </div>

            <div className="bg-softSand border border-lightGray rounded-xl p-4 text-xs space-y-2">
              <p>
                <strong>1. Uniquely Identifiable:</strong>{' '}
                {viewClaimModal.ownershipDetails?.uniqueIdentifiers}
              </p>
              <p>
                <strong>2. Scratches / Stickers:</strong>{' '}
                {viewClaimModal.ownershipDetails?.marksOrStickers}
              </p>
              <p>
                <strong>3. Contents Stored Inside:</strong>{' '}
                {viewClaimModal.ownershipDetails?.contentsInside}
              </p>
              <p>
                <strong>4. Owner-Only Detail:</strong>{' '}
                {viewClaimModal.ownershipDetails?.ownerOnlyDetail}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setViewClaimModal(null)}
                className="px-4 py-2 border border-lightGray rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT CLAIM MODAL */}
      {rejectModalClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-lightGray space-y-4"
          >
            <h3 className="font-bold text-charcoal text-lg">
              Reject Claim ({rejectModalClaim.claimId})
            </h3>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Rejection Reason (Shown to Claimant) *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain clearly why the claim was rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Internal Admin Notes (Private)
              </label>
              <textarea
                rows={2}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-charcoal">
              <input
                type="checkbox"
                checked={rejectAllowResubmit}
                onChange={(e) => setRejectAllowResubmit(e.target.checked)}
              />
              Permit claimant to submit a revised claim later
            </label>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setRejectModalClaim(null)}
                className="px-4 py-2 border border-lightGray rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyAction}
                className="bg-crimsonRed hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* REQUEST ADDITIONAL INFO MODAL */}
      {infoModalClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleRequestInfoSubmit}
            className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-lightGray space-y-4"
          >
            <h3 className="font-bold text-charcoal text-lg">
              Request Additional Information ({infoModalClaim.claimId})
            </h3>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Message to Claimant *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ask for serial number, invoice copy, or specific detail..."
                value={infoMessage}
                onChange={(e) => setInfoMessage(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Internal Admin Notes (Private)
              </label>
              <textarea
                rows={2}
                value={infoNotes}
                onChange={(e) => setInfoNotes(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setInfoModalClaim(null)}
                className="px-4 py-2 border border-lightGray rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyAction}
                className="bg-amberOrange hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg text-xs"
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PHYSICAL HANDOVER MODAL */}
      {handoverModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCompleteHandover}
            className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-lightGray space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-lightGray pb-3">
              <div>
                <h3 className="font-bold text-charcoal text-lg">Complete Physical Handover</h3>
                <p className="text-xs text-slateGray">
                  Item: {handoverModalData.foundItem.itemName} (
                  {handoverModalData.foundItem.foundId})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHandoverModalData(null)}
                className="text-slateGray hover:text-charcoal text-xl"
              >
                ✕
              </button>
            </div>

            <div className="bg-softSand border border-lightGray rounded-xl p-3 text-xs space-y-1">
              <p>
                <strong>Approved Claimant:</strong> {handoverModalData.approvedClaim.claimantName} (
                {handoverModalData.approvedClaim.registrationNumber})
              </p>
              <p>
                <strong>Claim ID:</strong> {handoverModalData.approvedClaim.claimId}
              </p>
              {handoverModalData.approvedClaim.handoverOtp && (
                <p className="font-mono font-bold text-forestGreen">
                  Expected Collection OTP: {handoverModalData.approvedClaim.handoverOtp}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Admin / Security Staff Member *
                </label>
                <input
                  type="text"
                  required
                  value={handoverForm.staffMemberName}
                  onChange={(e) =>
                    setHandoverForm((prev) => ({ ...prev, staffMemberName: e.target.value }))
                  }
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Handover Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={handoverForm.handoverDateTime}
                  onChange={(e) =>
                    setHandoverForm((prev) => ({ ...prev, handoverDateTime: e.target.value }))
                  }
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Verify Student OTP (Optional if verified via physical ID)
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP presented by student"
                value={handoverForm.otpCode}
                onChange={(e) =>
                  setHandoverForm((prev) => ({ ...prev, otpCode: e.target.value }))
                }
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Acknowledgement Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Checked original university ID card, student signed register..."
                value={handoverForm.acknowledgementNotes}
                onChange={(e) =>
                  setHandoverForm((prev) => ({ ...prev, acknowledgementNotes: e.target.value }))
                }
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Handover Photograph / Signed Receipt (Optional)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleHandoverPhotoUpload(e.target.files?.[0])}
                className="w-full text-xs text-slateGray"
              />
              {uploadingHandoverPhoto && (
                <p className="text-[11px] text-brightAzure mt-0.5">Uploading handover photo...</p>
              )}
              {handoverForm.handoverPhotoFile && (
                <p className="text-[11px] text-forestGreen mt-0.5">
                  ✓ {handoverForm.handoverPhotoFile.originalName}
                </p>
              )}
            </div>

            <div className="space-y-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs">
              <label className="flex items-center gap-2 font-semibold text-charcoal">
                <input
                  type="checkbox"
                  required
                  checked={handoverForm.studentIdentityVerified}
                  onChange={(e) =>
                    setHandoverForm((prev) => ({
                      ...prev,
                      studentIdentityVerified: e.target.checked,
                    }))
                  }
                />
                Student Identity Verified (Physical University ID Checked) *
              </label>
              <label className="flex items-center gap-2 font-semibold text-charcoal">
                <input
                  type="checkbox"
                  required
                  checked={handoverForm.handoverConfirmed}
                  onChange={(e) =>
                    setHandoverForm((prev) => ({
                      ...prev,
                      handoverConfirmed: e.target.checked,
                    }))
                  }
                />
                Confirm Physical Handover Completed *
              </label>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setHandoverModalData(null)}
                className="px-4 py-2 border border-lightGray rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busyAction || uploadingHandoverPhoto}
                className="bg-forestGreen hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg text-xs shadow-sm"
              >
                {busyAction ? 'Recording...' : 'Confirm Handover & Mark RETURNED'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
