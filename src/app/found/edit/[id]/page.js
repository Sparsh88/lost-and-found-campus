'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '@/lib/constants'

export default function EditFoundItemPage() {
  const { id } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)

  const [form, setForm] = useState({
    itemName: '',
    category: ITEM_CATEGORIES[0],
    description: '',
    foundLocation: CAMPUS_LOCATIONS[0],
    foundDate: '',
    foundTime: '',
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await fetch(`/api/found-items/${id}`, { cache: 'no-store' })
        const data = await res.json()
        if (res.ok && data.item) {
          setIsAuthorized(Boolean(data.item.isFinderOwner && data.item.status === 'AVAILABLE'))
          setForm({
            itemName: data.item.itemName || '',
            category: data.item.category || ITEM_CATEGORIES[0],
            description: data.item.description || '',
            foundLocation: data.item.foundLocation || CAMPUS_LOCATIONS[0],
            foundDate: data.item.foundDate || '',
            foundTime: data.item.foundTime || '',
          })
        } else {
          setError(data.error || 'Found item not found.')
        }
      } catch {
        setError('Unable to load item details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slateGray">
        Loading found item details...
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-softSand p-8 rounded-2xl border border-lightGray shadow-sm space-y-4">
          <span className="text-xs bg-amber-50 text-amberOrange border border-amber-200 px-3 py-1 rounded-full font-semibold inline-block">
            Edit Restricted
          </span>
          <h1 className="text-2xl font-bold text-charcoal">Permission Required</h1>
          <p className="text-slateGray text-sm">
            {error || 'Only the reporting student can edit an available found item before claims are processed.'}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href={`/found/${id}`}
              className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-sm"
            >
              Back to Item
            </Link>
          </div>
        </div>
      </div>
    )
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const res = await fetch(`/api/found-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to update found item.')
        setSaving(false)
        return
      }
      router.push(`/found/${id}`)
    } catch {
      setError('Unable to reach server.')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/found/${id}`} className="text-brightAzure hover:text-electricBlue text-sm hover:underline font-medium">
          ← Back to Item Details
        </Link>
        <h1 className="text-2xl font-bold text-charcoal mt-2">Edit Found Item</h1>
        <p className="text-slateGray text-sm">Update details for your found item submission.</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-softSand p-6 rounded-xl border border-lightGray shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Item Name</label>
          <input
            type="text"
            name="itemName"
            required
            value={form.itemName}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
          >
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            required
            value={form.description}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-1">Found Location</label>
          <input
            type="text"
            name="foundLocation"
            list="edit-found-locations"
            required
            value={form.foundLocation}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
          />
          <datalist id="edit-found-locations">
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Found Date</label>
            <input
              type="date"
              name="foundDate"
              required
              value={form.foundDate}
              onChange={handleChange}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">Found Time</label>
            <input
              type="time"
              name="foundTime"
              value={form.foundTime}
              onChange={handleChange}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-electricBlue hover:bg-electricBlue-hover disabled:opacity-60 text-white font-medium py-2 rounded-lg text-sm transition shadow-sm"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href={`/found/${id}`}
            className="px-4 py-2 bg-warmWhite border border-lightGray rounded-lg text-sm text-midnightNavy hover:bg-white text-center transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
