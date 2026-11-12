'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CATEGORIES,
  CAMPUS_LOCATIONS,
  addLostItem,
} from '@/modules/lost'

export default function AddLostItemPage() {
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'ID Card',
    description: '',
    location: 'Main Library',
    lostDate: '',
    lostTime: '',
    imageUrl: '',
    ownerName: '',
    ownerContact: '',
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
            ownerName: parsed.name,
            ownerContact: parsed.email || '',
          }))
        }
      } catch (error) {
        console.error('Unable to read user details:', error)
      }
    }

    setLoading(false)
  }, [])

  function handleChange(e) {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    const userData = localStorage.getItem('currentUser')
    const admin = localStorage.getItem('isAdmin') === 'true'

    if (!userData && !admin) {
      alert('You must be logged in to report a lost item.')
      router.push('/login')
      return
    }

    let user = null

    try {
      user = userData ? JSON.parse(userData) : null
    } catch {
      alert('Please log in again.')
      router.push('/login')
      return
    }

    if (
      !formData.itemName.trim() ||
      !formData.description.trim() ||
      !formData.lostDate ||
      !formData.lostTime ||
      !formData.ownerName.trim() ||
      !formData.ownerContact.trim()
    ) {
      alert('Please fill in all required fields.')
      return
    }

    addLostItem({
      ...formData,
      ownerEmail: user?.email?.toLowerCase() || '',
      createdBy: user?.email?.toLowerCase() || '',
    })

    alert('Lost item reported successfully!')

    router.push('/lost')
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

          <h1 className="text-2xl font-bold text-charcoal">
            Login Required
          </h1>

          <p className="text-slateGray text-sm">
            You must be logged in to report a lost item on campus. Please sign in to your account first.
          </p>

          <div className="pt-2 flex justify-center gap-3">

            <Link
              href="/login"
              className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-sm"
            >
              Sign In to Report
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
          Report a Lost Item
        </h1>

        <p className="text-slateGray text-sm">
          Report your missing item so someone on campus can help you find it.
        </p>

      </div>

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
            placeholder="e.g. Black HP Laptop"
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
            Lost Location on Campus *
          </label>

          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          >
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Lost Time *
            </label>

            <input
              type="time"
              name="lostTime"
              required
              value={formData.lostTime}
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

          <p className="text-xs text-slateGray mt-1">
            Leave empty to use the default image.
          </p>
        </div>

        <div className="border-t border-lightGray pt-4 space-y-4">

          <h2 className="font-semibold text-charcoal text-sm">
            Owner&apos;s Information
          </h2>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Your Name *
            </label>

            <input
              type="text"
              name="ownerName"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.ownerName}
              onChange={handleChange}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-charcoal mb-1">
              Your Contact (Email / Phone) *
            </label>

            <input
              type="text"
              name="ownerContact"
              required
              placeholder="e.g. student@campus.edu or 9876543210"
              value={formData.ownerContact}
              onChange={handleChange}
              className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/60 focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
            />
          </div>

        </div>

        <div className="flex gap-3 pt-2">

          <button
            type="submit"
            className="flex-1 bg-electricBlue hover:bg-electricBlue-hover text-white font-medium py-2 rounded-lg text-sm transition shadow-sm"
          >
            Submit Lost Item
          </button>

          <Link
            href="/lost"
            className="px-4 py-2 bg-warmWhite border border-lightGray rounded-lg text-sm text-midnightNavy hover:bg-white text-center transition"
          >
            Cancel
          </Link>

        </div>

      </form>
    </div>
  )
}
