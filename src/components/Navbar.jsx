'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Lost Items', href: '/lost' },
    { name: 'Found Items', href: '/found' },
    { name: 'Claims & Verify', href: '/claims' },
    { name: 'Dashboard', href: '/dashboard' },
  ]

  return (
    <nav className="bg-white border-b border-lightGray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-electricBlue text-white flex items-center justify-center font-bold text-sm shadow-sm">
              LF
            </div>
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

          <div className="hidden md:flex items-center">
            <Link
              href="/login"
              className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition duration-200 shadow-sm"
            >
              Login
            </Link>
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
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="block text-center mt-3 bg-electricBlue hover:bg-electricBlue-hover text-white py-2 rounded-lg font-medium text-sm transition"
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  )
}
