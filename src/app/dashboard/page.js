'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LegacyDashboardRedirectPage() {
  const router = useRouter()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/admin/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.admin) {
          router.replace('/admin/dashboard')
        } else {
          setChecked(true)
        }
      })
      .catch(() => setChecked(true))
  }, [router])

  if (!checked) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-slateGray">
        Checking administrator credentials...
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="bg-softSand p-8 rounded-2xl border border-lightGray shadow-sm space-y-4">
        <span className="text-xs bg-red-100 text-crimsonRed border border-red-200 px-3 py-1 rounded-full font-semibold inline-block">
          Security Authorization Required
        </span>
        <h1 className="text-2xl font-bold text-charcoal">Admin Custody Restricted</h1>
        <p className="text-slateGray text-sm">
          The Campus Security &amp; Administration Dashboard has moved to the dedicated Admin Portal.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            href="/admin/login"
            className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-sm"
          >
            Go to Admin Login
          </Link>
          <Link
            href="/my-reports"
            className="bg-warmWhite border border-lightGray text-midnightNavy hover:bg-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            Student My Reports
          </Link>
        </div>
      </div>
    </div>
  )
}
