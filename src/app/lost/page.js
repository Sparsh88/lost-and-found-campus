'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ITEM_CATEGORIES, DEFAULT_ITEM_IMAGE } from '@/lib/constants'
import CategoryBadge from '@/components/ui/CategoryBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import FinderModal from '@/components/FinderModal'

export default function LostPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedLostItem, setSelectedLostItem] = useState(null)

  const loadLostItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/lost-items', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to load lost item reports.')
      } else {
        setItems(data.items || [])
      }
    } catch {
      setError('Unable to reach server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLostItems()
  }, [loadLostItems])

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      item.lostLocation?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.reportId?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = category === 'All' || item.category === category
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
            Lost Items
          </h1>
          <p className="text-slateGray text-sm mt-1">
            Browse reported missing belongings across campus ({filteredItems.length} items)
          </p>
        </div>

        <Link
          href="/lost/add"
          className="bg-electricBlue hover:bg-electricBlue-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm self-start sm:self-auto"
        >
          + Report Lost Item
        </Link>
      </div>

      <div className="bg-softSand p-4 rounded-xl border border-lightGray shadow-sm mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by item name, report ID, location or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/70 focus:outline-none focus:ring-2 focus:ring-skyBlue"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-skyBlue"
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
            <option value="RETURNED">Returned</option>
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
          {[1, 2, 3].map((n) => (
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
            <div
              key={item.id}
              className="bg-softSand rounded-xl shadow-sm border border-lightGray overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between"
            >
              <div>
                <img
                  src={item.imageUrl || DEFAULT_ITEM_IMAGE}
                  alt={item.itemName}
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = DEFAULT_ITEM_IMAGE
                  }}
                  className="w-full h-44 object-cover"
                />

                <div className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <CategoryBadge category={item.category} />
                    <StatusBadge status={item.status} />
                  </div>

                  <h3 className="font-semibold text-charcoal text-base mb-1 truncate">
                    {item.itemName}
                  </h3>

                  <p className="text-slateGray text-sm line-clamp-2 mb-3">
                    {item.description}
                  </p>

                  <div className="text-xs text-slateGray space-y-1 mb-3">
                    <p>📍 {item.lostLocation}</p>
                    <p>📅 Lost on: {item.lostDate}</p>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4 flex gap-2">
                <Link
                  href={`/lost/${item.id}`}
                  className="flex-1 text-center bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium py-2 rounded-lg transition shadow-sm"
                >
                  View Details
                </Link>
                {item.status === 'ACTIVE' && !item.isOwner && (
                  <button
                    type="button"
                    onClick={() => setSelectedLostItem(item)}
                    className="px-3.5 bg-forestGreen hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition shadow-sm"
                  >
                    I Found This
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-softSand rounded-xl border border-lightGray p-6 shadow-sm">
          <p className="text-slateGray text-base mb-3">
            No lost items match your search.
          </p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setStatusFilter('All'); }}
            className="text-brightAzure hover:text-electricBlue hover:underline text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}

      <FinderModal
        lostItem={selectedLostItem}
        isOpen={Boolean(selectedLostItem)}
        onClose={() => setSelectedLostItem(null)}
        onSuccess={() => loadLostItems()}
      />
    </div>
  )
}
