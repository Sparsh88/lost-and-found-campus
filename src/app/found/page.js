'use client'

/**
 * app/found/page.js  –  Module 2: Found Items Listing
 * ─────────────────────────────────────────────────────────────────
 * Displays all registered found items with:
 *  • Search bar (name + description)
 *  • Category filter pills
 *  • Status filter dropdown
 *  • Responsive card grid
 *  • "Report Found Item" CTA
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, Plus, Package, X } from 'lucide-react'
import { MOCK_FOUND_ITEMS, CATEGORIES } from '@/modules/found/data'
import FoundItemCard from '@/components/ui/FoundItemCard'

// ─── Status filter options ────────────────────────────────────────
const STATUS_OPTIONS = ['All', 'Pending', 'Claimed', 'Verified', 'Handed Over']

export default function FoundItemsPage() {
  // ── State ──────────────────────────────────────────────────────
  const [searchQuery,      setSearchQuery]      = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus,   setSelectedStatus]   = useState('All')

  // ── Filtered items ─────────────────────────────────────────────
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return MOCK_FOUND_ITEMS.filter((item) => {
      const matchesSearch =
        !q ||
        item.itemName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q)

      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory

      const matchesStatus =
        selectedStatus === 'All' || item.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchQuery, selectedCategory, selectedStatus])

  // ── Clear filters ──────────────────────────────────────────────
  const hasActiveFilters =
    searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'

  function clearFilters() {
    setSearchQuery('')
    setSelectedCategory('All')
    setSelectedStatus('All')
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ─── Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-heading text-3xl">Found Items</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
            {hasActiveFilters ? ' (filtered)' : ` · ${MOCK_FOUND_ITEMS.length} total`}
          </p>
        </div>
        <Link href="/found/add" className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Report Found Item
        </Link>
      </div>

      {/* ─── Search + Status Filter Row ─── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, description, or location…"
            className="form-input pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-input pl-9 pr-8 appearance-none cursor-pointer min-w-[160px]"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Category Filter Pills ─── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {['All', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all border ${
              selectedCategory === cat
                ? 'bg-blue-700 text-white border-blue-700 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700'
            }`}
          >
            {cat}
          </button>
        ))}

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3.5 py-1.5 rounded-full text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 flex items-center gap-1 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filters
          </button>
        )}
      </div>

      {/* ─── Results Grid ─── */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <FoundItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        /* ─── Empty State ─── */
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No items found</h3>
          <p className="text-gray-400 text-sm mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search query or filters.'
              : 'No found items have been registered yet.'}
          </p>
          {hasActiveFilters ? (
            <button onClick={clearFilters} className="btn-secondary">
              Clear all filters
            </button>
          ) : (
            <Link href="/found/add" className="btn-primary">
              <Plus className="w-4 h-4" />
              Report the First Found Item
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

