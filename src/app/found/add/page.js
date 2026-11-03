'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES, CAMPUS_LOCATIONS } from '@/modules/found/data'
import { addFoundItem } from '@/modules/found/store'

export default function AddFoundItemPage() {
  const router = useRouter()

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

  function handleChange(e) {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!formData.itemName || !formData.description || !formData.foundDate || !formData.foundTime || !formData.finderName) {
      alert('Please fill in all required fields.')
      return
    }

    addFoundItem(formData)
    alert('Found item reported successfully!')
    router.push('/found')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      <div className="mb-6">
        <Link href="/found" className="text-blue-600 text-sm hover:underline">
          ← Back to Found Items
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Report a Found Item</h1>
        <p className="text-gray-500 text-sm">
          Register an item you found on campus so the owner can recover it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            name="itemName"
            required
            placeholder="e.g. Blue Milton Water Bottle"
            value={formData.itemName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Detailed Description *
          </label>
          <textarea
            name="description"
            rows={3}
            required
            placeholder="Describe the item (color, brand, identifying marks, condition)..."
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Found Location on Campus *
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Found Date *
            </label>
            <input
              type="date"
              name="foundDate"
              required
              value={formData.foundDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Found Time *
            </label>
            <input
              type="time"
              name="foundTime"
              required
              value={formData.foundTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Image URL (Optional)
          </label>
          <input
            type="url"
            name="imageUrl"
            placeholder="https://example.com/item.jpg"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-400 mt-1">Leave empty to use a placeholder image.</p>
        </div>

        <div className="border-t border-gray-200 pt-4 space-y-4">
          <h2 className="font-semibold text-gray-800 text-sm">Finder&apos;s Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              name="finderName"
              required
              placeholder="e.g. Rahul Sharma"
              value={formData.finderName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Contact (Email / Phone) *
            </label>
            <input
              type="text"
              name="finderContact"
              required
              placeholder="e.g. student@campus.edu or 9876543210"
              value={formData.finderContact}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition"
          >
            Submit Found Item
          </button>
          <Link
            href="/found"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 text-center"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}
