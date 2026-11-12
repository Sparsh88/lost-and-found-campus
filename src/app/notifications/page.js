'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function NotificationsContent() {
  const searchParams = useSearchParams()
  const selectedParam = searchParams.get('selected')

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [selectedNotif, setSelectedNotif] = useState(null)
  const [filterUnread, setFilterUnread] = useState(false)

  const loadNotifications = useCallback(async () => {
    try {
      const authRes = await fetch('/api/auth/me', { cache: 'no-store' })
      const authData = await authRes.json()
      if (!authData.user) {
        setUser(null)
        setLoading(false)
        return
      }
      setUser(authData.user)

      const res = await fetch('/api/notifications?limit=60', { cache: 'no-store' })
      const data = await res.json()
      const list = data.notifications || []
      setNotifications(list)

      if (selectedParam) {
        const match = list.find((n) => n.id === selectedParam)
        if (match) {
          setSelectedNotif(match)
        } else {
          setSelectedNotif((prev) => prev || list[0] || null)
        }
      } else if (list.length > 0) {
        setSelectedNotif((prev) => prev || list[0])
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedParam])

  useEffect(() => {
    loadNotifications()
    const onUpdate = () => loadNotifications()
    window.addEventListener('notificationsUpdated', onUpdate)
    return () => window.removeEventListener('notificationsUpdated', onUpdate)
  }, [loadNotifications])

  async function openNotification(notif) {
    setSelectedNotif(notif)
    if (!notif.isRead) {
      try {
        await fetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' })
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        )
        window.dispatchEvent(new Event('notificationsUpdated'))
      } catch {}
    }
  }

  async function markAllRead() {
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      window.dispatchEvent(new Event('notificationsUpdated'))
    } catch {}
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slateGray">
        Loading your private messages &amp; notifications...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-softSand p-8 rounded-2xl border border-lightGray shadow-sm space-y-4">
          <h1 className="text-2xl font-bold text-charcoal">Sign In Required</h1>
          <p className="text-slateGray text-sm">
            Please log in to view private finder messages and claim notifications.
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

  const displayed = filterUnread ? notifications.filter((n) => !n.isRead) : notifications

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
            Private Messages &amp; Notifications
          </h1>
          <p className="text-slateGray text-sm mt-1">
            Secure updates from item finders and campus security administration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterUnread((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              filterUnread
                ? 'bg-electricBlue text-white border-electricBlue'
                : 'bg-softSand text-charcoal border-lightGray'
            }`}
          >
            {filterUnread ? 'Showing Unread Only' : 'Show Unread Only'}
          </button>
          <button
            type="button"
            onClick={markAllRead}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-warmWhite border border-lightGray text-brightAzure hover:bg-white transition"
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-softSand border border-lightGray rounded-xl overflow-hidden shadow-sm">
          <div className="p-3.5 border-b border-lightGray bg-warmWhite text-xs font-bold text-charcoal">
            Inbox ({displayed.length})
          </div>
          <div className="divide-y divide-lightGray max-h-[600px] overflow-y-auto">
            {displayed.length > 0 ? (
              displayed.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => openNotification(notif)}
                  className={`w-full text-left p-4 transition block ${
                    selectedNotif?.id === notif.id
                      ? 'bg-blue-50/90 border-l-4 border-l-electricBlue'
                      : notif.isRead
                        ? 'bg-warmWhite hover:bg-softSand/50'
                        : 'bg-white hover:bg-blue-50/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-charcoal">{notif.title}</span>
                    {!notif.isRead && (
                      <span className="text-[10px] bg-electricBlue text-white px-2 py-0.5 rounded-full font-semibold">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slateGray line-clamp-2 mt-1">{notif.message}</p>
                  <p className="text-[11px] text-slateGray/80 mt-1.5">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </button>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-slateGray">
                No notifications in this view.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 bg-softSand border border-lightGray rounded-xl p-6 shadow-sm">
          {selectedNotif ? (
            <div className="space-y-4">
              <div className="border-b border-lightGray pb-3">
                <span className="text-[11px] font-semibold text-brightAzure uppercase tracking-wider">
                  {selectedNotif.type.replace(/_/g, ' ')}
                </span>
                <h2 className="text-xl font-bold text-charcoal mt-1">{selectedNotif.title}</h2>
                <p className="text-xs text-slateGray mt-1">
                  Received: {new Date(selectedNotif.createdAt).toLocaleString()}
                </p>
              </div>

              <p className="text-sm text-charcoal whitespace-pre-wrap">{selectedNotif.message}</p>

              {/* Rich private finder card */}
              {selectedNotif.type === 'FINDER_SUBMISSION' && selectedNotif.privatePayload && (
                <div className="bg-warmWhite border border-lightGray rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-charcoal text-sm">
                      🔒 Private Finder Contact Details
                    </h3>
                    <span className="text-xs font-mono text-slateGray">
                      {selectedNotif.privatePayload.submissionId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slateGray block">Finder Name</span>
                      <span className="font-semibold text-charcoal">
                        {selectedNotif.privatePayload.finderName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slateGray block">Registration Number</span>
                      <span className="font-semibold text-charcoal">
                        {selectedNotif.privatePayload.registrationNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slateGray block">Contact Mobile Number</span>
                      <span className="font-semibold text-forestGreen">
                        📞 {selectedNotif.privatePayload.contactNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-slateGray block">Related Lost Item</span>
                      <span className="font-semibold text-charcoal">
                        {selectedNotif.privatePayload.relatedLostItem} (
                        {selectedNotif.privatePayload.relatedLostReportId})
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border border-lightGray rounded-lg p-3 text-xs">
                    <span className="font-semibold text-charcoal block mb-1">Finder&apos;s Message:</span>
                    <p className="text-slateGray whitespace-pre-wrap">
                      {selectedNotif.privatePayload.finderMessage}
                    </p>
                  </div>

                  {selectedNotif.privatePayload.photoFile?.fileId && (
                    <div>
                      <a
                        href={`/api/files/private/${selectedNotif.privatePayload.photoFile.fileId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg"
                      >
                        📎 View Uploaded Found-Item Photo
                      </a>
                    </div>
                  )}

                  {selectedNotif.privatePayload.lostItemObjectId && (
                    <div className="pt-1">
                      <Link
                        href={`/lost/${selectedNotif.privatePayload.lostItemObjectId}`}
                        className="text-xs text-brightAzure hover:underline font-semibold"
                      >
                        Open My Lost Item Report →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Claim Approved / OTP Box */}
              {(selectedNotif.type === 'CLAIM_APPROVED' ||
                selectedNotif.type === 'ITEM_READY_FOR_COLLECTION') &&
                selectedNotif.privatePayload?.handoverOtp && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2 text-xs">
                    <p className="font-bold text-forestGreen text-sm">
                      Collection OTP: {selectedNotif.privatePayload.handoverOtp}
                    </p>
                    <p className="text-forestGreen">
                      Location: {selectedNotif.privatePayload.custodyOffice}
                    </p>
                    <Link
                      href="/claims"
                      className="inline-block text-brightAzure hover:underline font-semibold"
                    >
                      View in My Claims →
                    </Link>
                  </div>
                )}

              {(selectedNotif.type === 'CLAIM_INFO_REQUESTED' ||
                selectedNotif.type === 'CLAIM_REJECTED' ||
                selectedNotif.type === 'CLAIM_CLOSED' ||
                selectedNotif.type === 'ITEM_RETURNED') && (
                <div>
                  <Link
                    href="/claims"
                    className="inline-block bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg"
                  >
                    Open My Claims →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-slateGray">
              Select a notification from the inbox to read full private details.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slateGray">
          Loading notifications...
        </div>
      }
    >
      <NotificationsContent />
    </Suspense>
  )
}
