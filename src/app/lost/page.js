'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAllLostItems, categories, DEFAULT_ITEM_IMAGE } from '@/modules/lost'

export default function LostPage() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => {
    setItems(getAllLostItems())
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' || item.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">
            Lost Items
          </h1>

          <p className="text-slateGray text-sm mt-1">
            Browse reported lost items across campus ({filteredItems.length} items)
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

        <input
          type="text"
          placeholder="Search by item name, location or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-sm text-charcoal placeholder-slateGray/70 focus:outline-none focus:ring-2 focus:ring-skyBlue"
        />

        <div className="flex flex-wrap gap-1.5 pt-1">

          <button
            onClick={() => setCategory('All')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
              category === 'All'
                ? 'bg-electricBlue text-white shadow-sm'
                : 'bg-warmWhite text-charcoal border border-lightGray'
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                category === cat
                  ? 'bg-electricBlue text-white shadow-sm'
                  : 'bg-warmWhite text-charcoal border border-lightGray'
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

                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                    {item.category}
                  </span>

                  <span className="text-xs bg-red-100 text-crimsonRed px-2 py-1 rounded-full font-semibold">
                    {item.status || 'Lost'}
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
                  <p>📅 {item.lostDate}</p>
                </div>

                <Link
                  href={`/lost/${item.id}`}
                  className="block text-center w-full bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium py-2 rounded-lg transition shadow-sm"
                >
                  View Details
                </Link>

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
