'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapPin, Menu, X, Shield } from 'lucide-react'

// ─── Navigation links ────────────────────────────────────────────────────────
const navLinks = [
  { label: 'Home',               href: '/' },
  { label: 'Lost Items',         href: '/lost' },
  { label: 'Found Items',        href: '/found' },
  { label: 'Claims & Verify',   href: '/claims' },
  { label: 'Dashboard',          href: '/dashboard' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ─── Logo ─── */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center shadow-sm group-hover:bg-emerald-800 transition-colors">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900 tracking-tight">
                Campus Lost &amp; Found
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <MapPin className="w-3 h-3 text-emerald-600" />
                600-Acre Campus
              </div>
            </div>
          </Link>

          {/* ─── Desktop Nav ─── */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* ─── Desktop Actions ─── */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/found/add" className="btn-primary text-sm py-2 px-4">
              + Report Found Item
            </Link>
          </div>

          {/* ─── Mobile menu button ─── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ─── Mobile Menu ─── */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-1 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <Link
              href="/found/add"
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full justify-center text-sm"
            >
              + Report Found Item
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
