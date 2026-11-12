'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { categories, DEFAULT_ITEM_IMAGE } from '@/modules/lost'

export default function AddLostItemPage() {
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    type: 'LOST',
    itemName: '',
    category: 'Electronics',
    description: '',
    location: '',
    foundDate: new Date().toISOString().split('T')[0],
    imageUrl: '',
    finderName: '',
    finderContact: '',
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
          const user = localStorage.getItem('currentUser')
          if (user) {
            const parsed = JSON.parse(user)
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (
      !formData.itemName.trim() ||
      !formData.description.trim() ||
      !formData.location.trim() ||
      !formData.foundDate
    ) {
      setError('Please fill all required fields.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          finderName: formData.finderName || 'Student',
          finderContact: formData.finderContact || 'contact@campus.edu',
          imageUrl: formData.imageUrl.trim() || DEFAULT_ITEM_IMAGE,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit lost item report.')
        setSubmitting(false)
        return
      }

      router.push('/lost')
    } catch {
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
        <Link
          href="/lost"
          className="text-brightAzure hover:text-electricBlue text-sm hover:underline font-medium"
        >
          ← Back to Lost Items
        </Link>

        <h1 className="text-2xl font-bold text-charcoal mt-2">
          Report Lost Item
        </h1>

        <p className="text-slateGray text-sm">
          Enter the details of the item you lost on campus so security and finders can match it.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-softSand p-6 rounded-xl border border-lightGray shadow-sm space-y-4"
      >

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Item Name *
          </label>

          <input
            type="text"
            name="itemName"
            required
            value={formData.itemName}
            onChange={handleChange}
            placeholder="e.g. Blue Milton Bottle or HP Spectre Charger"
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
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Description *
          </label>

          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe colors, scratches, distinctive marks, brand, or contents..."
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Lost Location *
          </label>

          <input
            type="text"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
            placeholder="Where did you last have or leave the item?"
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Date Lost *
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
            Image URL (Optional)
          </label>

          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="Paste photo link or leave empty"
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          />

          <p className="text-xs text-slateGray mt-1">
            If you don&apos;t provide an image, the default image will be displayed.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-electricBlue hover:bg-electricBlue-hover disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm"
        >
          {submitting ? 'Submitting Report...' : 'Submit Lost Item Report'}
        </button>

      </form>
    </div>
  )
}
