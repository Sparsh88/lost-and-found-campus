'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '@/modules/found/data'
import { getFoundItems } from '@/modules/found/store'
import FoundItemCard from '@/components/ui/FoundItemCard'

export default function FoundPage() {
  const [items] = useState(getFoundItems())
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = category === 'All' || item.category === category
    const matchesStatus = status === 'All' || item.status === status

    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Found Items</h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse all registered items found across campus ({filteredItems.length} items)
          </p>
        </div>

        <Link
          href="/found/add"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition self-start sm:self-auto"
        >
          + Report Found Item
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by item name, location or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Claimed">Claimed</option>
            <option value="Verified">Verified</option>
            <option value="Handed Over">Handed Over</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setCategory('All')}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              category === 'All'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <FoundItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-gray-500 text-base mb-3">No found items match your search.</p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setStatus('All'); }}
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

    </div>
  )
}
