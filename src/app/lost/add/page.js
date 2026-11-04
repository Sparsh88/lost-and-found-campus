'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { addLostItem, categories, DEFAULT_ITEM_IMAGE } from '@/modules/lost'

export default function AddLostItemPage() {
  const router = useRouter()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Electronics',
    description: '',
    location: '',
    lostDate: '',
    imageUrl: '',
  })

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    const admin = localStorage.getItem('isAdmin') === 'true'

    if (user || admin) {
      setIsLoggedIn(true)
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

    if (
      !formData.itemName.trim() ||
      !formData.description.trim() ||
      !formData.location.trim() ||
      !formData.lostDate
    ) {
      alert('Please fill all required fields.')
      return
    }

    addLostItem({
      ...formData,
      imageUrl: formData.imageUrl.trim() || DEFAULT_ITEM_IMAGE,
      status: 'Lost',
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
            You must be logged in to report a lost item on campus. Please sign in first.
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
          Report Lost Item
        </h1>

        <p className="text-slateGray text-sm">
          Enter the details of the item you lost on campus.
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
            value={formData.itemName}
            onChange={handleChange}
            placeholder="Enter item name"
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
            placeholder="Describe the item..."
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
            placeholder="Where did you lose the item?"
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          />
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
            placeholder="Paste image URL or leave empty"
            className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:ring-2 focus:ring-skyBlue focus:border-skyBlue focus:outline-none"
          />

          <p className="text-xs text-slateGray mt-1">
            If you don&apos;t provide an image, the default image will be displayed.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-electricBlue hover:bg-electricBlue-hover text-white font-medium py-2.5 rounded-lg text-sm transition shadow-sm"
        >
          Submit Lost Item
        </button>

      </form>
    </div>
  )
}
