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
    <nav className="bg-midnightNavy border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">
          
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-electricBlue text-white flex items-center justify-center font-bold text-sm shadow-sm">
              LF
            </div>
            <span className="font-bold text-lg text-white tracking-tight">
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
                      ? 'bg-white/15 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
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
            className="md:hidden p-2 text-slate-300 rounded-lg hover:bg-white/10"
          >
            <span className="text-xl">☰</span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-white/10 px-4 pt-2 pb-4 space-y-1 bg-midnightNavy">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-white/10"
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
