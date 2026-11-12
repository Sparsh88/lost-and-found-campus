'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Login form state (Admin / Staff ID + Password)
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')

  // Register form state (Basic Staff Details)
  const [regName, setRegName] = useState('')
  const [regAdminId, setRegAdminId] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regRole, setRegRole] = useState('admin')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

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

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationNumber: adminId.trim(),
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

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!regName.trim() || !regAdminId.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setError('Please complete all required staff profile fields.')
      return
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          registrationNumber: regAdminId.trim(),
          email: regEmail.trim(),
          phone: regPhone.trim(),
          role: regRole,
          password: regPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Admin registration failed.')
        setLoading(false)
        return
      }

      setSuccess(
        `Staff account created (${data.admin?.registrationNumber})! Use your Admin ID & password for future logins.`
      )
      setTimeout(() => {
        router.push('/admin/dashboard')
      }, 650)
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
            {tab === 'login'
              ? 'Sign in with your Admin / Staff ID & password to manage claims and handovers.'
              : 'Register a staff account with your official details and Admin ID.'}
          </p>
        </div>

        <div className="flex bg-warmWhite p-1 rounded-xl border border-lightGray">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              tab === 'login'
                ? 'bg-midnightNavy text-white shadow-sm'
                : 'text-slateGray hover:text-charcoal'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              tab === 'register'
                ? 'bg-midnightNavy text-white shadow-sm'
                : 'text-slateGray hover:text-charcoal'
            }`}
          >
            Create Staff Account
          </button>
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

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">
                Admin / Staff ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. STAFF-001 or SEC-104"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">
                Password *
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
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Officer Vikram Mehta"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">
                  Admin / Staff ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STAFF-002"
                  value={regAdminId}
                  onChange={(e) => setRegAdminId(e.target.value)}
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876500003"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">
                  Campus Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="staff@campus.edu"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">
                  Staff Role *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
                >
                  <option value="admin">Campus Administrator</option>
                  <option value="security">Security Officer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">
                Create Password *
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                placeholder="Re-enter password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-midnightNavy hover:bg-midnightNavy-hover disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              {loading ? 'Creating Staff Account...' : 'Create Admin Account'}
            </button>
          </form>
        )}

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
