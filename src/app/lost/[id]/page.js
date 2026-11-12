'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  getLostItemById,
  DEFAULT_ITEM_IMAGE,
} from '@/modules/lost'

export default function LostItemDetailsPage() {
  const { id } = useParams()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setItem(getLostItemById(id))
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-slateGray">
        Loading...
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">

        <h2 className="text-xl font-bold text-charcoal mb-2">
          Item Not Found
        </h2>

        <p className="text-slateGray text-sm mb-4">
          This item does not exist or may have been deleted.
        </p>

        <Link
          href="/lost"
          className="text-brightAzure hover:text-electricBlue hover:underline text-sm font-medium"
        >
          ← Back to Lost Items
        </Link>

      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      <Link
        href="/lost"
        className="text-brightAzure hover:text-electricBlue text-sm hover:underline mb-4 inline-block font-medium"
      >
        ← Back to Lost Items
      </Link>

      <div className="bg-softSand rounded-xl border border-lightGray overflow-hidden shadow-sm">

        <img
          src={item.imageUrl || DEFAULT_ITEM_IMAGE}
          alt={item.itemName}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = DEFAULT_ITEM_IMAGE
          }}
          className="w-full h-64 object-cover"
        />

        <div className="p-6 space-y-5">

          <div>

            <div className="flex items-center gap-2 mb-2">

              <span className="bg-white/80 text-brightAzure border border-lightGray px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {item.category}
              </span>

              <span className="bg-amber-50 text-amberOrange border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {item.status}
              </span>

            </div>

            <h1 className="text-2xl font-bold text-charcoal">
              {item.itemName}
            </h1>

            <p className="text-xs text-slateGray mt-0.5">
              Item ID: #{item.id}
            </p>

          </div>

          <div>

            <h2 className="text-sm font-semibold text-charcoal mb-1">
              Description
            </h2>

            <p className="text-slateGray text-sm whitespace-pre-wrap">
              {item.description}
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-warmWhite border border-lightGray p-4 rounded-lg text-sm">

            <div>
              <span className="text-slateGray block text-xs">
                Lost Location
              </span>

              <span className="font-semibold text-charcoal">
                📍 {item.location}
              </span>
            </div>

            <div>
              <span className="text-slateGray block text-xs">
                Date &amp; Time
              </span>

              <span className="font-semibold text-charcoal">
                📅 {item.lostDate} at {item.lostTime}
              </span>
            </div>

          </div>

          <div className="border-t border-lightGray pt-3 text-sm">

            <h2 className="text-sm font-semibold text-charcoal mb-1">
              Owner Details
            </h2>

            <p className="text-slateGray">
              Name:{' '}
              <span className="font-semibold text-charcoal">
                {item.ownerName}
              </span>
            </p>

            <p className="text-slateGray">
              Contact:{' '}
              <span className="font-semibold text-charcoal">
                {item.ownerContact}
              </span>
            </p>

          </div>

          <div className="border-t border-lightGray pt-4">

            <Link
              href="/claims"
              className="inline-block bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-6 py-2.5 rounded-lg transition shadow-sm"
            >
              Go to Claim Page
            </Link>

          </div>

        </div>
      </div>
    </div>
  )
}
