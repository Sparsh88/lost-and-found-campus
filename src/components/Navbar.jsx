'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef(null)

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      const data = await res.json()
      setCurrentUser(data.user || null)
    } catch {
      setCurrentUser(null)
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=12', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {}
  }, [])

  useEffect(() => {
    checkAuth()
    const onAuthChange = () => checkAuth()
    window.addEventListener('authChange', onAuthChange)
    return () => {
      window.removeEventListener('authChange', onAuthChange)
    }
  }, [checkAuth, pathname])

  useEffect(() => {
    if (!currentUser) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    fetchNotifications()

    // Real-time SSE stream with polling fallback
    let eventSource = null
    try {
      eventSource = new EventSource('/api/notifications/stream')
      eventSource.addEventListener('notification', () => {
        fetchNotifications()
      })
    } catch {}

    const pollTimer = setInterval(fetchNotifications, 5000)
    const onNotifEvent = () => fetchNotifications()
    window.addEventListener('notificationsUpdated', onNotifEvent)

    return () => {
      if (eventSource) eventSource.close()
      clearInterval(pollTimer)
      window.removeEventListener('notificationsUpdated', onNotifEvent)
    }
  }, [currentUser, fetchNotifications])

  useEffect(() => {
    function handleOutsideClick(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false)
      }
    }
    if (drawerOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [drawerOpen])

  // Admin portal renders its own dedicated Admin header
  if (pathname?.startsWith('/admin')) {
    return null
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    setCurrentUser(null)
    setNotifications([])
    setUnreadCount(0)
    setDrawerOpen(false)
    window.dispatchEvent(new Event('authChange'))
    router.push('/login')
  }

  async function handleNotificationClick(notif) {
    if (!notif.isRead) {
      try {
        await fetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' })
        fetchNotifications()
      } catch {}
    }
    setDrawerOpen(false)
    router.push(`/notifications?selected=${notif.id}`)
  }

  async function handleMarkAllRead() {
    try {
      await fetch('/api/notifications/read-all', { method: 'PATCH' })
      fetchNotifications()
    } catch {}
  }

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Lost Items', href: '/lost' },
    { name: 'Found Items', href: '/found' },
    { name: 'Claims & Verify', href: '/claims' },
  ]

  if (currentUser) {
    links.push({ name: 'My Reports', href: '/my-reports' })
  }

  return (
    <nav className="bg-white border-b border-lightGray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <span className="font-bold text-lg text-charcoal tracking-tight">
              Campus Lost &amp; Found
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-blue-50 text-electricBlue font-semibold'
                      : 'text-slateGray hover:text-charcoal hover:bg-softSand'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            {currentUser ? (
              <div className="flex items-center gap-2.5" ref={drawerRef}>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDrawerOpen((prev) => !prev)}
                    aria-label="Notifications"
                    className="relative p-2 rounded-lg bg-warmWhite border border-lightGray hover:bg-softSand text-charcoal transition"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-crimsonRed text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {drawerOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-lightGray rounded-xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 bg-softSand border-b border-lightGray flex items-center justify-between">
                        <span className="text-xs font-bold text-charcoal">
                          Private Notifications ({unreadCount} unread)
                        </span>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllRead}
                            className="text-[11px] text-brightAzure hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-lightGray">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <button
                              key={notif.id}
                              type="button"
                              onClick={() => handleNotificationClick(notif)}
                              className={`w-full text-left px-4 py-3 hover:bg-softSand/60 transition block ${
                                notif.isRead ? 'bg-white' : 'bg-blue-50/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-charcoal">
                                  {notif.title}
                                </p>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-electricBlue shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[11px] text-slateGray line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-slateGray/80 mt-1">
                                {new Date(notif.createdAt).toLocaleString()}
                              </p>
                            </button>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-slateGray">
                            No notifications yet.
                          </div>
                        )}
                      </div>

                      <div className="px-4 py-2.5 bg-warmWhite border-t border-lightGray text-center">
                        <Link
                          href="/notifications"
                          onClick={() => setDrawerOpen(false)}
                          className="text-xs font-semibold text-brightAzure hover:text-electricBlue hover:underline"
                        >
                          Open All Messages &amp; Notifications →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href="/my-reports"
                  className="text-xs font-semibold text-charcoal bg-softSand hover:bg-warmWhite px-3 py-1.5 rounded-lg border border-lightGray transition"
                >
                  👤 {currentUser.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-warmWhite border border-lightGray hover:bg-white text-crimsonRed text-xs font-medium px-3 py-1.5 rounded-lg transition shadow-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition duration-200 shadow-sm"
              >
                Login
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {currentUser && (
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative p-2 rounded-lg bg-warmWhite border border-lightGray text-charcoal"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-crimsonRed text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-charcoal rounded-lg hover:bg-softSand"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-lightGray px-4 pt-2 pb-4 space-y-1 bg-white">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal hover:bg-softSand"
            >
              {link.name}
            </Link>
          ))}
          {currentUser && (
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-charcoal hover:bg-softSand"
            >
              Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
            </Link>
          )}
          {currentUser ? (
            <div className="pt-2 border-t border-lightGray space-y-2">
              <span className="block text-xs font-semibold text-charcoal bg-softSand px-3 py-1.5 rounded-lg border border-lightGray text-center">
                👤 {currentUser.name} ({currentUser.registrationNumber})
              </span>
              <button
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className="block w-full text-center bg-warmWhite border border-lightGray text-crimsonRed py-2 rounded-lg font-medium text-sm transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="block text-center mt-3 bg-electricBlue hover:bg-electricBlue-hover text-white py-2 rounded-lg font-medium text-sm transition"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
