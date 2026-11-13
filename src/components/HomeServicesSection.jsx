'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function HomeServicesSection({ initialIsLoggedIn = false }) {
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
    <section className="max-w-6xl mx-auto px-4 sm:px-6">
      <h2 className="text-2xl font-bold text-charcoal text-center mb-6">
        Campus Services
      </h2>

      <div className={`grid grid-cols-1 ${isLoggedIn ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
        <div className="bg-softSand p-6 rounded-xl border border-lightGray shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-charcoal mb-2">Lost Item Service</h3>
            <p className="text-sm text-slateGray mb-4">
              Students can report their lost belongings and search through existing lost-item reports.
            </p>
          </div>
          <Link
            href="/lost"
            className="text-brightAzure hover:text-electricBlue font-semibold text-sm hover:underline"
          >
            Go to Lost Items →
          </Link>
        </div>

        <div className="bg-softSand p-6 rounded-xl border border-lightGray shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-charcoal mb-2">Found Item Service</h3>
            <p className="text-sm text-slateGray mb-4">
              Register items found on campus, filter by category or location, and track handover custody.
            </p>
          </div>
          <Link
            href="/found"
            className="text-brightAzure hover:text-electricBlue font-semibold text-sm hover:underline"
          >
            Go to Found Items →
          </Link>
        </div>

        {isLoggedIn && (
          <div className="bg-softSand p-6 rounded-xl border border-lightGray shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-charcoal mb-2">Claim &amp; Verification</h3>
              <p className="text-sm text-slateGray mb-4">
                Submit claims with ownership proof, verified by campus authorities before handover.
              </p>
            </div>
            <Link
              href="/claims"
              className="text-brightAzure hover:text-electricBlue font-semibold text-sm hover:underline"
            >
              Go to Claims →
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
