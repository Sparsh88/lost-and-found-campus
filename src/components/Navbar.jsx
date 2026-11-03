'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    function checkAuth() {
      setIsAdmin(localStorage.getItem('isAdmin') === 'true')
    }

    checkAuth()
    window.addEventListener('authChange', checkAuth)
    window.addEventListener('storage', checkAuth)
    return () => {
      window.removeEventListener('authChange', checkAuth)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('userEmail')
    window.dispatchEvent(new Event('authChange'))
    setIsAdmin(false)
    router.push('/login')
  }

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Lost Items', href: '/lost' },
    { name: 'Found Items', href: '/found' },
    { name: 'Claims & Verify', href: '/claims' },
    { name: isAdmin ? 'Admin Panel' : 'Dashboard', href: '/dashboard' },
  ]

  return (
    <nav className="bg-white border-b border-lightGray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          
          <Link href="/" className="flex items-center">
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

          <div className="hidden md:flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={handleLogout}
                className="bg-warmWhite border border-lightGray hover:bg-white text-crimsonRed text-sm font-medium px-4 py-2 rounded-lg transition duration-200 shadow-sm"
              >
                Logout (Admin)
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition duration-200 shadow-sm"
              >
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-charcoal rounded-lg hover:bg-softSand"
          >
            <span className="text-xl">☰</span>
          </button>
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
          {isAdmin ? (
            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="block w-full text-center mt-3 bg-warmWhite border border-lightGray text-crimsonRed py-2 rounded-lg font-medium text-sm transition"
            >
              Logout (Admin)
            </button>
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
