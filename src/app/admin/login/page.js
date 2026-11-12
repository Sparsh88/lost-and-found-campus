'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/admin/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.admin) {
          router.replace('/admin/dashboard')
        }
      })
      .catch(() => {})
  }, [router])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Administrator authentication failed.')
        setLoading(false)
        return
      }

      setSuccess('Authenticated as Campus Administrator. Opening dashboard...')
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 400)
    } catch {
      setError('Unable to reach authentication server.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-warmWhite">
      <div className="max-w-md w-full bg-softSand p-6 sm:p-8 rounded-2xl border border-lightGray shadow-sm space-y-6">
        <div className="text-center">
          <span className="text-xs bg-midnightNavy text-white px-3 py-1 rounded-full font-semibold inline-block mb-2">
            🛡️ Authorized Staff Only
          </span>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">
            Admin &amp; Security Portal
          </h1>
          <p className="text-sm text-slateGray mt-1">
            Sign in to verify ownership claims, manage custody, and complete physical handovers.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-forestGreen text-xs p-3 rounded-lg flex items-center gap-2">
            <span>✓</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Administrator Email
            </label>
            <input
              type="email"
              required
              placeholder="admin@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-midnightNavy hover:bg-midnightNavy-hover disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm"
          >
            {loading ? 'Verifying Credentials...' : 'Sign In to Admin Desk'}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-slateGray pt-2 border-t border-lightGray">
          <Link href="/" className="text-brightAzure hover:text-electricBlue hover:underline font-medium">
            ← Student Website
          </Link>
          <Link href="/login" className="text-brightAzure hover:text-electricBlue hover:underline font-medium">
            Student Login →
          </Link>
        </div>
      </div>
    </div>
  )
}
