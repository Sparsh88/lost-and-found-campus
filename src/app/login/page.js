'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState('login')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regStudentId, setRegStudentId] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')

  function getStoredUsers() {
    try {
      const stored = localStorage.getItem('campusUsers')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  function handleLogin(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const cleanEmail = loginEmail.trim().toLowerCase()
    const isAdmin = (cleanEmail === 'admin12@gmial.com' || cleanEmail === 'admin12@gmail.com') && loginPassword === 'Admin@12'

    if (isAdmin) {
      localStorage.setItem('isAdmin', 'true')
      localStorage.setItem('currentUser', JSON.stringify({ name: 'Campus Admin', email: cleanEmail, role: 'admin' }))
      window.dispatchEvent(new Event('authChange'))
      router.push('/dashboard')
      return
    }

    const users = getStoredUsers()
    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail)

    if (!existingUser) {
      setError('No account found with this email. Please click "Create Account" first.')
      return
    }

    if (existingUser.password !== loginPassword) {
      setError('Incorrect password. Please verify your password.')
      return
    }

    localStorage.setItem('isAdmin', 'false')
    localStorage.setItem('currentUser', JSON.stringify(existingUser))
    window.dispatchEvent(new Event('authChange'))
    router.push('/found')
  }

  function handleRegister(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirmPassword) {
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

    const cleanEmail = regEmail.trim().toLowerCase()

    if (cleanEmail === 'admin12@gmial.com' || cleanEmail === 'admin12@gmail.com') {
      setError('This email is reserved for administration.')
      return
    }

    const users = getStoredUsers()
    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail)

    if (existingUser) {
      setError('An account with this email already exists. Please Sign In.')
      return
    }

    const newUser = {
      name: regName.trim(),
      email: cleanEmail,
      studentId: regStudentId.trim() || 'N/A',
      password: regPassword,
      role: 'user',
    }

    const updatedUsers = [...users, newUser]
    localStorage.setItem('campusUsers', JSON.stringify(updatedUsers))
    localStorage.setItem('isAdmin', 'false')
    localStorage.setItem('currentUser', JSON.stringify(newUser))
    window.dispatchEvent(new Event('authChange'))

    router.push('/found')
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-softSand p-6 sm:p-8 rounded-2xl border border-lightGray shadow-sm space-y-6">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal tracking-tight">
            Campus Lost &amp; Found
          </h1>
          <p className="text-sm text-slateGray mt-1">
            {tab === 'login' ? 'Sign in to your campus account' : 'Register a new student or finder account'}
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
          <div className="bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-forestGreen text-xs p-3 rounded-lg">
            {success}
          </div>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">
                Campus Email or ID
              </label>
              <input
                type="email"
                required
                placeholder="student@campus.edu"
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
              className="w-full bg-electricBlue hover:bg-electricBlue-hover text-white font-medium py-2 rounded-lg text-sm transition shadow-sm"
            >
              Sign In
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

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-1">
                Student / Roll No (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 12345678"
                value={regStudentId}
                onChange={(e) => setRegStudentId(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
              />
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
              className="w-full bg-electricBlue hover:bg-electricBlue-hover text-white font-medium py-2 rounded-lg text-sm transition shadow-sm"
            >
              Create Account
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slateGray pt-1">
          <Link href="/" className="text-brightAzure hover:text-electricBlue hover:underline font-medium">
            ← Return to Home Page
          </Link>
        </div>

      </div>
    </div>
  )
}
