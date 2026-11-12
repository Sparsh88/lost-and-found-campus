'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '@/modules/found/data'
import FoundItemCard from '@/components/ui/FoundItemCard'

export default function FoundPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await fetch('/api/items?type=FOUND')
      const data = await res.json()
      if (data.items) {
        setItems(data.items)
      }
    } catch (err) {
      console.error('Failed to load found items:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())

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
            placeholder="Search by item name, location or description..."
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
            <option value="Pending">Pending</option>
            <option value="Claimed">Claimed</option>
            <option value="Verified">Verified</option>
            <option value="Disputed">Disputed</option>
            <option value="Handed Over">Handed Over</option>
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
          {CATEGORIES.map((cat) => (
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
