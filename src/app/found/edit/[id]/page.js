'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CATEGORIES, CAMPUS_LOCATIONS } from '@/modules/found/data'
import { getFoundItemById, updateFoundItem } from '@/modules/found/store'

export default function EditFoundItemPage() {
  const { id } = useParams()
  const router = useRouter()
  const existingItem = getFoundItemById(id)

  const [form, setForm] = useState(
    existingItem || {
      itemName: '',
      category: 'Other',
      description: '',
      location: '',
      foundDate: '',
      foundTime: '',
      status: 'Pending',
      handoverInfo: '',
      finderName: '',
      finderContact: '',
    }
  )

  if (!existingItem) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Item Not Found</h2>
        <Link href="/found" className="text-blue-600 hover:underline text-sm">
          ← Back to Found Items
        </Link>
      </div>
    )
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    updateFoundItem(id, form)
    alert('Item updated successfully!')
    router.push(`/found/${id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      <div className="mb-6">
        <Link href={`/found/${id}`} className="text-blue-600 text-sm hover:underline">
          ← Back to Item Details
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit Found Item</h1>
        <p className="text-gray-500 text-sm">Update item details or manage handover status.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <label className="block text-sm font-semibold text-blue-900">
            Current Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="Pending">Pending (Not Claimed)</option>
            <option value="Claimed">Claimed (Under Verification)</option>
            <option value="Verified">Verified (Owner Confirmed)</option>
            <option value="Handed Over">Handed Over (Returned to Owner)</option>
          </select>

          {form.status === 'Handed Over' && (
            <div className="pt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Handover Notes / Verification Details
              </label>
              <textarea
                name="handoverInfo"
                rows={2}
                placeholder="e.g. Handed over to student John Doe (Roll #123) by Security Officer Mr. Singh"
                value={form.handoverInfo || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
          <input
            type="text"
            name="itemName"
            required
            value={form.itemName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            required
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition"
          >
            Save Changes
          </button>
          <Link
            href={`/found/${id}`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 text-center"
          >
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}
