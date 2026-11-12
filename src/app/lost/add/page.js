'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS, DEFAULT_ITEM_IMAGE } from '@/lib/constants'

export default function AddLostItemPage() {
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    itemName: '',
    category: ITEM_CATEGORIES[0],
    description: '',
    lostLocation: CAMPUS_LOCATIONS[0],
    lostDate: new Date().toISOString().split('T')[0],
    identifyingDetails: '',
    imageUrl: '',
    imagePublicId: '',
  })

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        setCurrentUser(data.user || null)
      })
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploadingImage(true)

    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/uploads/public', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to upload image.')
      } else {
        setFormData((prev) => ({
          ...prev,
          imageUrl: data.url,
          imagePublicId: data.publicId || '',
        }))
      }
    } catch {
      setError('Image upload failed. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (
      !formData.itemName.trim() ||
      !formData.description.trim() ||
      !formData.lostLocation.trim() ||
      !formData.lostDate
    ) {
      setError('Please fill all required fields.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/lost-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl: formData.imageUrl.trim() || DEFAULT_ITEM_IMAGE,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit lost item report.')
        setSubmitting(false)
        return
      }

      router.push(`/lost/${data.item.id}`)
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

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-softSand p-8 rounded-2xl border border-lightGray shadow-sm space-y-4">
          <span className="text-xs bg-amber-50 text-amberOrange border border-amber-200 px-3 py-1 rounded-full font-semibold inline-block">
            Authentication Required
          </span>
          <h1 className="text-2xl font-bold text-charcoal">Sign In to Report Lost Item</h1>
          <p className="text-slateGray text-sm">
            Please log in with your campus student account so finders can notify you privately if they locate your item.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/login"
              className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/lost"
              className="bg-warmWhite border border-lightGray text-midnightNavy hover:bg-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              Back to Lost Items
            </Link>
          </div>
        </div>
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
          Enter the details of the item you lost on campus so security and finders can notify you privately.
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
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Detailed Description *
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe color, brand, size, model, and circumstances when lost..."
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Lost Location *
            </label>
            <input
              type="text"
              name="lostLocation"
              list="campus-locations-list"
              required
              value={formData.lostLocation}
              onChange={handleChange}
              placeholder="Where did you last have the item?"
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
            />
            <datalist id="campus-locations-list">
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Lost Date *
            </label>
            <input
              type="date"
              name="lostDate"
              required
              value={formData.lostDate}
              onChange={handleChange}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Additional Identifying Details (Optional)
          </label>
          <textarea
            name="identifyingDetails"
            rows={2}
            value={formData.identifyingDetails}
            onChange={handleChange}
            placeholder="Scratches, stickers, engravings, case details, or distinguishing marks..."
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
          />
        </div>

        <div className="bg-warmWhite border border-lightGray rounded-xl p-4 space-y-3">
          <label className="block text-sm font-semibold text-charcoal">
            Item Photograph (Optional)
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            className="w-full text-xs text-slateGray file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-lightGray file:text-xs file:font-semibold file:bg-softSand file:text-charcoal hover:file:bg-white"
          />
          {uploadingImage && (
            <p className="text-xs text-brightAzure">Uploading photograph...</p>
          )}
          <div className="text-xs text-slateGray">Or paste an image URL:</div>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/item.jpg"
            className="w-full bg-white border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
          />
          {formData.imageUrl && (
            <img
              src={formData.imageUrl}
              alt="Preview"
              className="h-32 w-full object-cover rounded-lg border border-lightGray"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || uploadingImage}
          className="w-full bg-electricBlue hover:bg-electricBlue-hover disabled:opacity-60 text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm"
        >
          {submitting ? 'Submitting Report...' : 'Submit Lost Item Report'}
        </button>
      </form>
    </div>
  )
}
