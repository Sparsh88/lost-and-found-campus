'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES, CAMPUS_LOCATIONS } from '@/modules/found/data'
import { addFoundItem } from '@/modules/found/store'

export default function AddFoundItemPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'ID Card',
    description: '',
    location: 'Main Library',
    foundDate: '',
    foundTime: '',
    imageUrl: '',
    finderName: '',
    finderContact: '',
  })

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    const admin = localStorage.getItem('isAdmin') === 'true'

    if (user || admin) {
      setIsLoggedIn(true)
      try {
        const parsed = user ? JSON.parse(user) : null
        if (parsed?.name) {
          setFormData((prev) => ({
            ...prev,
            finderName: parsed.name,
            finderContact: parsed.email || '',
          }))
        }
      } catch {}
    }
    setLoading(false)
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  function handleSubmit(e) {
    e.preventDefault()

    const user = localStorage.getItem('currentUser')
    const admin = localStorage.getItem('isAdmin') === 'true'
    if (!user && !admin) {
      alert('You must be logged in to report a found item.')
      router.push('/login')
      return
    }

    if (!formData.itemName || !formData.description || !formData.foundDate || !formData.foundTime || !formData.finderName) {
      alert('Please fill in all required fields.')
      return
    }

    addFoundItem(formData)
    alert('Found item reported successfully!')
    router.push('/found')
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slateGray">
        Loading...
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-softSand p-8 rounded-2xl border border-lightGray shadow-sm space-y-4">
          <span className="text-xs bg-amber-50 text-amberOrange border border-amber-200 px-3 py-1 rounded-full font-semibold inline-block">
            Authentication Required
          </span>
          <h1 className="text-2xl font-bold text-charcoal">Login Required</h1>
          <p className="text-slateGray text-sm">
            You must be logged in to report a found item on campus. Please sign in to your account first.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/login"
              className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-sm"
            >
              Sign In to Report
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
          Register an item you found on campus so the owner can recover it.
        </p>
      </div>

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
            Detailed Description *
          </label>
          <textarea
            name="description"
            rows={3}
            required
            placeholder="Describe the item (color, brand, identifying marks, condition)..."
            value={formData.description}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          />
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
              Found Time *
            </label>
            <input
              type="time"
              name="foundTime"
              required
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
          <p className="text-xs text-slateGray mt-1">Leave empty to use a placeholder image.</p>
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
            className="flex-1 bg-electricBlue hover:bg-electricBlue-hover text-white font-medium py-2 rounded-lg text-sm transition shadow-sm"
          >
            Submit Found Item
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
