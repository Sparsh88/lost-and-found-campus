'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    const isAdmin = (cleanEmail === 'admin12@gmial.com' || cleanEmail === 'admin12@gmail.com') && password === 'Admin@12'

    if (isAdmin) {
      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('userEmail', cleanEmail)
      window.dispatchEvent(new Event('authChange'))
      alert('Logged in as Administrator!')
      router.push('/dashboard')
    } else {
      localStorage.setItem('isAdmin', 'false')
      localStorage.setItem('userEmail', cleanEmail)
      window.dispatchEvent(new Event('authChange'))
      alert('Logged in successfully as student/user.')
      router.push('/found')
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-softSand p-8 rounded-2xl border border-lightGray shadow-sm space-y-6">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal">Campus Login</h1>
          <p className="text-sm text-slateGray mt-1">
            Sign in to access your campus lost and found account or admin panel
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Campus Email or Admin ID
            </label>
            <input
              type="email"
              required
              placeholder="e.g. admin12@gmial.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-electricBlue hover:bg-electricBlue-hover text-white font-medium py-2 rounded-lg text-sm transition shadow-sm"
          >
            Sign In
          </button>
        </form>

        <div className="bg-warmWhite border border-lightGray rounded-xl p-3 text-xs text-slateGray space-y-1">
          <p className="font-semibold text-charcoal">Admin Credentials:</p>
          <p>Email: <code className="text-electricBlue font-mono font-medium">admin12@gmial.com</code></p>
          <p>Password: <code className="text-electricBlue font-mono font-medium">Admin@12</code></p>
        </div>

        <div className="text-center text-xs text-slateGray">
          <Link href="/" className="text-brightAzure hover:text-electricBlue hover:underline font-medium">
            ← Return to Home Page
          </Link>
        </div>

      </div>
    </div>
  )
}
