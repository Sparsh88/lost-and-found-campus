
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  CATEGORIES,
  getLostItems,
  deleteLostItem,
  DEFAULT_ITEM_IMAGE,
} from '@/modules/lost'

export default function LostPage() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('All')
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setItems(getLostItems())

    const userData = localStorage.getItem('currentUser')

    try {
      setCurrentUser(userData ? JSON.parse(userData) : null)
    } catch (error) {
      setCurrentUser(null)
    }

    setLoading(false)
  }, [])

  // Only the student who uploaded the item can delete it
  function canDelete(item) {
    if (!currentUser?.email || !item.ownerEmail) {
      return false
    }

    return (
      currentUser.email.toLowerCase() ===
      item.ownerEmail.toLowerCase()
    )
  }

  // Delete report
  function handleDelete(id) {
    const item = items.find(
      (entry) => String(entry.id) === String(id)
    )

    if (!item || !canDelete(item)) {
      alert('You are not allowed to delete this report.')
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to delete this lost item?'
    )

    if (!confirmed) return

    deleteLostItem(id)

    setItems((prevItems) =>
      prevItems.filter(
        (entry) => String(entry.id) !== String(id)
      )
    )

    alert('Lost item deleted successfully!')
  }

  // Search and filter
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' || item.category === category

    const matchesStatus =
      status === 'All' || item.status === status

    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center text-slateGray">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
            Lost Items
          </h1>

          <p className="text-slateGray text-sm mt-1">
            Browse all reported lost items across campus ({filteredItems.length} items)
          </p>
        </div>

        <Link
          href="/lost/add"
          className="bg-electricBlue hover:bg-electricBlue-hover text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm self-start sm:self-auto"
        >
          + Report Lost Item
        </Link>

      </div>

      {/* Search and Filters */}
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
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
            <option value="Claimed">Claimed</option>
          </select>

        </div>

        {/* Category Filters */}
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

      {/* Lost Items Cards */}
      {filteredItems.length > 0 ? (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredItems.map((item) => (

            <div
              key={item.id}
              className="bg-softSand rounded-xl shadow-sm border border-lightGray overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition duration-200"
            >

              <img
                src={item.imageUrl || DEFAULT_ITEM_IMAGE}
                alt={item.itemName}
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = DEFAULT_ITEM_IMAGE
                }}
                className="w-full h-44 object-cover"
              />

              <div className="p-4">

                <div className="flex items-center justify-between gap-2 mb-2">

                  <span className="bg-white/80 text-brightAzure border border-lightGray px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    {item.category}
                  </span>

                  <span className="bg-amber-50 text-amberOrange border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                    {item.status}
                  </span>

                </div>

                <h3 className="font-semibold text-charcoal text-base mb-1 truncate">
                  {item.itemName}
                </h3>

                <p className="text-slateGray text-sm line-clamp-2 mb-3">
                  {item.description}
                </p>

                <div className="text-xs text-slateGray space-y-1 mb-4">

                  <p>📍 {item.location}</p>

                  <p>
                    📅 {item.lostDate} at {item.lostTime}
                  </p>

                  <p>👤 {item.ownerName}</p>

                </div>

                {/* View and Delete Buttons */}
                <div className="flex gap-2">

                  <Link
                    href={`/lost/${item.id}`}
                    className="flex-1 text-center bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium py-2 rounded-lg transition shadow-sm"
                  >
                    View Details
                  </Link>

                  {canDelete(item) && (

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition"
                    >
                      Delete
                    </button>

                  )}

                </div>

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
            onClick={() => {
              setSearch('')
              setCategory('All')
              setStatus('All')
            }}
            className="text-brightAzure hover:text-electricBlue hover:underline text-sm font-medium"
          >
            Clear all filters
          </button>

        </div>

      )}

    </div>
  )
}
