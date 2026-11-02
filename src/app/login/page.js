'use client'

/**
 * app/login/page.js
 * ─────────────────────────────────────────────────────────────────
 * Campus Authentication / Login Portal
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Shield, Lock, Mail, LogIn, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    // Simulate authentication
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1200)
    }, 800)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-gray-100">
        
        {/* Brand / Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-800 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Sign In to Campus Portal
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Campus Lost &amp; Found Management System
          </p>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-gray-900">Login Successful!</h3>
            <p className="text-sm text-gray-500">Redirecting to campus dashboard...</p>
          </div>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="form-label" htmlFor="email">
                Campus Email or ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@campus.edu.in"
                  className="form-input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-sm flex items-center gap-2"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/"
                className="text-xs text-gray-500 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
              >
                ← Return to Home Page
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
