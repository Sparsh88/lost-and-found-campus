'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '@/lib/constants'
import { getSuggestedItemImage, resolveItemImage } from '@/lib/itemImages'

export default function AddFoundItemPage() {
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
    foundLocation: CAMPUS_LOCATIONS[0],
    foundDate: new Date().toISOString().split('T')[0],
    foundTime: '',
    imageUrl: '',
    imagePublicId: '',
    hiddenIdentifyingDetails: '',
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
    setFormData((prev) => ({ ...prev, [name]: value }))
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

    if (!formData.itemName.trim() || !formData.description.trim() || !formData.foundDate || !formData.foundLocation.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/found-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          imageUrl: resolveItemImage(formData.itemName, formData.category, formData.imageUrl),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit found item.')
        setSubmitting(false)
        return
      }

      window.dispatchEvent(new Event('campusDataUpdated'))
      router.refresh()
      router.push(`/found/${data.item.id}`)
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
          <h1 className="text-2xl font-bold text-charcoal">Sign In to Report Found Item</h1>
          <p className="text-slateGray text-sm">
            Please log in with your campus account. Your finder identity is automatically linked securely on the server.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/login"
              className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/found"
              className="bg-warmWhite border border-lightGray text-midnightNavy hover:bg-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              Back to Found Items
            </Link>
          </div>
        </div>
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
          Register an item found on campus so the rightful owner can verify ownership and recover it.
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
            placeholder="e.g. Black HP Laptop or Blue Milton Water Bottle"
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
            {ITEM_CATEGORIES.map((cat) => (
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
            placeholder="Describe the item (color, general condition). Keep unique secret marks hidden below!"
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          />
          <p className="text-xs text-slateGray mt-1">💡 Tip: Avoid revealing unique stickers, lockscreens, or serial numbers in the public description.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">
            Found Location on Campus *
          </label>
          <input
            type="text"
            name="foundLocation"
            list="found-locations-list"
            required
            value={formData.foundLocation}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          />
          <datalist id="found-locations-list">
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
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
            <p className="text-xs text-brightAzure">Uploading image...</p>
          )}
          <div className="text-xs text-slateGray">Or paste an image URL:</div>
          <input
            type="url"
            name="imageUrl"
            placeholder="https://example.com/item.jpg"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full bg-white border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:outline-none"
          />
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-slateGray">
              {formData.imageUrl.trim()
                ? 'Uploaded / custom photo preview:'
                : `Auto-matched photo for "${formData.itemName.trim() || formData.category}":`}
            </p>
            <img
              src={resolveItemImage(formData.itemName, formData.category, formData.imageUrl)}
              alt={formData.itemName || 'Item Preview'}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = getSuggestedItemImage(formData.itemName, formData.category)
              }}
              className="h-36 w-full object-cover rounded-lg border border-lightGray"
            />
          </div>
        </div>

        <div className="bg-warmWhite border border-amber-200 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-amberOrange font-bold text-xs">🛡️ HIDDEN VERIFICATION DETAILS</span>
            <span className="text-xs text-slateGray">(Admin-only — never shown to claimants)</span>
          </div>
          <textarea
            name="hiddenIdentifyingDetails"
            rows={2}
            placeholder="Note serial numbers, stickers, items inside, or unique scratches so admins can verify the true owner..."
            value={formData.hiddenIdentifyingDetails}
            onChange={handleChange}
            className="w-full bg-white border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
          />
        </div>

        <div className="border-t border-lightGray pt-4 space-y-2">
          <h2 className="font-semibold text-charcoal text-sm">Verified Finder Profile</h2>
          <div className="bg-warmWhite border border-lightGray rounded-lg p-3 text-xs text-slateGray space-y-1">
            <p>
              <span className="font-semibold text-charcoal">Name:</span> {currentUser.name}
            </p>
            <p>
              <span className="font-semibold text-charcoal">Registration No:</span> {currentUser.registrationNumber}
            </p>
            <p>
              <span className="font-semibold text-charcoal">Mobile:</span> {currentUser.phone || 'On profile'}
            </p>
            <p className="text-[11px] text-slateGray/80 pt-1">
              🔒 Automatically populated from your authenticated profile. Your registration number and phone are never exposed publicly.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || uploadingImage}
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
