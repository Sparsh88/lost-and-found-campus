'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES, CAMPUS_LOCATIONS } from '@/modules/found/data'

export default function AddFoundItemPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    type: 'FOUND',
    itemName: '',
    category: 'ID Card',
    description: '',
    location: 'Main Library',
    foundDate: new Date().toISOString().split('T')[0],
    foundTime: '',
    imageUrl: '',
    finderName: '',
    finderContact: '',
    secretQuestion: '',
    secretAnswer: '',
  })

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.user) {
          setIsLoggedIn(true)
          setFormData((prev) => ({
            ...prev,
            finderName: data.user.name,
            finderContact: data.user.email,
          }))
        } else {
          // Check fallback localStorage
          const localUser = localStorage.getItem('currentUser')
          if (localUser) {
            const parsed = JSON.parse(localUser)
            setIsLoggedIn(true)
            setFormData((prev) => ({
              ...prev,
              finderName: parsed.name,
              finderContact: parsed.email,
            }))
          }
        }
      } catch {
        setIsLoggedIn(true)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!formData.itemName || !formData.description || !formData.foundDate || !formData.finderName) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit found item.')
        setSubmitting(false)
        return
      }

      router.push('/found')
    } catch (err) {
      setError('Unable to reach server. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slateGray">
        Checking campus credentials...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      <div className="mb-6">
        <Link href="/found" className="text-brightAzure hover:text-electricBlue text-sm hover:underline font-medium">
          ← Back to Found Items
        </Link>
        <h1 className="text-2xl font-bold text-charcoal mt-2">Report a Found Item</h1>
        <p className="text-slateGray text-sm">
          Register an item found on campus so the rightful owner can verify and recover it.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-softSand p-6 rounded-xl border border-lightGray shadow-sm space-y-4">
        
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Item Name *
          </label>
          <input
            type="text"
            name="itemName"
            required
            placeholder="e.g. Blue Milton Water Bottle"
            value={formData.itemName}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Public Description *
          </label>
          <textarea
            name="description"
            rows={3}
            required
            placeholder="Describe the item (color, general location, condition). Do NOT reveal secret identifying marks here!"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          />
          <p className="text-xs text-slateGray mt-1">💡 Tip: Avoid writing unique secret stickers or serial numbers here to prevent false claims.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Found Location on Campus *
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          >
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Found Date *
            </label>
            <input
              type="date"
              name="foundDate"
              required
              value={formData.foundDate}
              onChange={handleChange}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Found Time (Optional)
            </label>
            <input
              type="time"
              name="foundTime"
              value={formData.foundTime}
              onChange={handleChange}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Item Image URL (Optional)
          </label>
          <input
            type="url"
            name="imageUrl"
            placeholder="https://example.com/item.jpg"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          />
          <p className="text-xs text-slateGray mt-1">Leave empty to use standard campus placeholder image.</p>
        </div>

        {/* Blind Verification Secret Anchor */}
        <div className="bg-warmWhite border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-amberOrange font-bold text-xs">🛡️ ANTI-FRAUD VERIFICATION ANCHOR</span>
            <span className="text-xs text-slateGray">(Hidden from Public Catalog)</span>
          </div>
          <p className="text-xs text-slateGray">
            Add a secret question only the real owner knows (e.g., sticker character, screen wallpaper, keychain name).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Challenge Question</label>
              <input
                type="text"
                name="secretQuestion"
                placeholder="e.g. What sticker is on the laptop?"
                value={formData.secretQuestion}
                onChange={handleChange}
                className="w-full bg-white border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Correct Answer</label>
              <input
                type="text"
                name="secretAnswer"
                placeholder="e.g. NASA astronaut sticker"
                value={formData.secretAnswer}
                onChange={handleChange}
                className="w-full bg-white border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-lightGray pt-4 space-y-4">
          <h2 className="font-semibold text-charcoal text-sm">Finder&apos;s Information</h2>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Your Name *
            </label>
            <input
              type="text"
              name="finderName"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.finderName}
              onChange={handleChange}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Your Contact (Email / Phone) *
            </label>
            <input
              type="text"
              name="finderContact"
              required
              placeholder="e.g. student@campus.edu or 9876543210"
              value={formData.finderContact}
              onChange={handleChange}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-electricBlue hover:bg-electricBlue-hover disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm transition shadow-sm"
          >
            {submitting ? 'Registering Item...' : 'Submit Found Item'}
          </button>
          <Link
            href="/found"
            className="px-4 py-2 bg-warmWhite border border-lightGray rounded-lg text-sm text-midnightNavy hover:bg-white text-center transition"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}
