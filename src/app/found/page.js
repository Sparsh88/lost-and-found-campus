'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ITEM_CATEGORIES } from '@/lib/constants'
import FoundItemCard from '@/components/ui/FoundItemCard'

export default function FoundPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')

  useEffect(() => {
    fetchItems()
    const handleUpdate = () => fetchItems()
    window.addEventListener('campusDataUpdated', handleUpdate)
    window.addEventListener('focus', handleUpdate)
    return () => {
      window.removeEventListener('campusDataUpdated', handleUpdate)
      window.removeEventListener('focus', handleUpdate)
    }
  }, [])

  async function fetchItems() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/found-items', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load found items.')
      } else {
        setItems(data.items || [])
      }
    } catch {
      setError('Unable to reach server.')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      item.foundLocation?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.foundId?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = category === 'All' || item.category === category
    const matchesStatus = status === 'All' || item.status === status
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Found Items</h1>
          <p className="text-slateGray text-sm mt-1">
            Browse registered items found across campus ({filteredItems.length} items)
          </p>
        </div>

        <Link
          href="/found/add"
          className="bg-electricBlue hover:bg-electricBlue-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm self-start sm:self-auto"
        >
          + Report Found Item
        </Link>
      </div>

      <div className="bg-softSand p-4 rounded-xl border border-lightGray shadow-sm mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by item name, found ID, location or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/70 focus:outline-none focus:ring-2 focus:ring-skyBlue focus:border-skyBlue"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-skyBlue focus:border-skyBlue"
          >
            <option value="All">All Statuses</option>
            <option value="AVAILABLE">Available to Claim</option>
            <option value="RESERVED_FOR_HANDOVER">Reserved for Handover</option>
            <option value="RETURNED">Returned</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setCategory('All')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              category === 'All'
                ? 'bg-electricBlue text-white shadow-sm'
                : 'bg-warmWhite text-charcoal border border-lightGray hover:bg-white'
            }`}
          >
            All
          </button>
          {ITEM_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                category === cat
                  ? 'bg-electricBlue text-white shadow-sm'
                  : 'bg-warmWhite text-charcoal border border-lightGray hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-softSand rounded-xl p-4 border border-lightGray animate-pulse space-y-3">
              <div className="h-44 bg-lightGray/60 rounded-lg"></div>
              <div className="h-4 bg-lightGray/80 rounded w-3/4"></div>
              <div className="h-3 bg-lightGray/60 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <FoundItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-softSand rounded-xl border border-lightGray p-6 shadow-sm">
          <p className="text-slateGray text-base mb-3">No found items match your search.</p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setStatus('All'); }}
            className="text-brightAzure hover:text-electricBlue hover:underline text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
