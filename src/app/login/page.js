'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register form state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials.')
        setLoading(false)
        return
      }

      window.dispatchEvent(new Event('authChange'))
      setSuccess('Signed in successfully! Redirecting...')
      setTimeout(() => {
        router.push('/found')
      }, 450)
    } catch {
      setError('Unable to reach server. Please check your connection.')
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!regName.trim() || !regEmail.trim() || !regNumber.trim() || !regPhone.trim() || !regPassword) {
      setError('Please fill in all required fields.')
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
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          registrationNumber: regNumber.trim(),
          phone: regPhone.trim(),
          password: regPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Registration failed.')
        setLoading(false)
        return
      }

      window.dispatchEvent(new Event('authChange'))
      setSuccess('Account created successfully! Welcome to Campus Lost & Found.')
      setTimeout(() => {
        router.push('/found')
      }, 500)
    } catch {
      setError('Unable to reach registration server.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-softSand p-6 sm:p-8 rounded-2xl border border-lightGray shadow-sm space-y-6">
        <div className="text-center">
          <span className="text-xs bg-blue-100 text-electricBlue border border-blue-200 px-3 py-1 rounded-full font-semibold inline-block mb-2">
            Student Authentication
          </span>
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">
            Campus Lost &amp; Found
          </h1>
          <p className="text-sm text-slateGray mt-1">
            {tab === 'login' ? 'Sign in with your university student account' : 'Register a new campus student account'}
          </p>
        </div>

        <div className="flex bg-warmWhite p-1 rounded-xl border border-lightGray">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition ${
              tab === 'login'
                ? 'bg-electricBlue text-white shadow-sm'
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
                ? 'bg-electricBlue text-white shadow-sm'
                : 'text-slateGray hover:text-charcoal'
            }`}
          >
            Create Account
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
                Campus Email
              </label>
              <input
                type="email"
                required
                placeholder="rahul.sharma@campus.edu"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
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
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-electricBlue hover:bg-electricBlue-hover disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm transition shadow-sm"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
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
                placeholder="e.g. Rahul Sharma"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">
                Campus Email *
              </label>
              <input
                type="email"
                required
                placeholder="student@campus.edu"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">
                  Registration No *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12104582"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
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
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-electricBlue hover:bg-electricBlue-hover disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm transition shadow-sm"
            >
              {loading ? 'Creating Account...' : 'Register Campus Account'}
            </button>
          </form>
        )}

        <div className="flex items-center justify-between text-xs text-slateGray pt-1 border-t border-lightGray">
          <Link href="/" className="text-brightAzure hover:text-electricBlue hover:underline font-medium">
            ← Return Home
          </Link>
          <Link href="/admin/login" className="text-midnightNavy hover:text-electricBlue hover:underline font-semibold">
            Admin Portal →
          </Link>
        </div>
      </div>
    </div>
  )
}
