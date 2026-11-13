'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HomeHeroActions({ initialIsLoggedIn = false }) {
  const [isLoggedIn, setIsLoggedIn] = useState(initialIsLoggedIn)

  useEffect(() => {
    async function syncAuth() {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' })
        const data = await res.json()
        setIsLoggedIn(Boolean(data.user))
      } catch {
        setIsLoggedIn(false)
      }
    }
    syncAuth()

    const onAuthChange = () => syncAuth()
    window.addEventListener('authChange', onAuthChange)
    window.addEventListener('campusDataUpdated', onAuthChange)
    return () => {
      window.removeEventListener('authChange', onAuthChange)
      window.removeEventListener('campusDataUpdated', onAuthChange)
    }
  }, [])

  return (
    <div className="flex flex-wrap gap-3 justify-center pt-3">
      <Link
        href="/lost"
        className="bg-crimsonRed hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-lg ring-1 ring-white/25"
      >
        Lost Items
      </Link>
      <Link
        href="/found"
        className="bg-electricBlue hover:bg-electricBlue-hover text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-lg ring-1 ring-white/25"
      >
        Found Items
      </Link>
      {isLoggedIn && (
        <Link
          href="/claims"
          className="bg-forestGreen hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-lg ring-1 ring-white/25"
        >
          Claim &amp; Verify
        </Link>
      )}
    </div>
  )
}
