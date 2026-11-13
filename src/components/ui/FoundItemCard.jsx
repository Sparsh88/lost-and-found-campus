'use client'

import Link from 'next/link'
import StatusBadge from './StatusBadge'
import CategoryBadge from './CategoryBadge'
import { getSuggestedItemImage, resolveItemImage } from '@/lib/itemImages'

export default function FoundItemCard({ item }) {
  const isAvailable = item.status === 'AVAILABLE' && !item.isFinderOwner
  const fallbackSrc = getSuggestedItemImage(item.itemName, item.category)
  const displaySrc = resolveItemImage(item.itemName, item.category, item.imageUrl)

  return (
    <div className="bg-softSand rounded-xl shadow-sm border border-lightGray overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between">
      <div>
        <img
          src={displaySrc}
          alt={item.itemName}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = fallbackSrc
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
            <p>📍 {item.foundLocation || item.location}</p>
            <p>
              📅 {item.foundDate}
              {item.foundTime ? ` at ${item.foundTime}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-2">
        <Link
          href={`/found/${item.id}`}
          className="flex-1 text-center bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium py-2 rounded-lg transition shadow-sm"
        >
          View Details
        </Link>
        {isAvailable && (
          <Link
            href={`/found/${item.id}?claim=1`}
            className="px-3.5 text-center bg-forestGreen hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition shadow-sm"
          >
            Claim
          </Link>
        )}
      </div>
    </div>
  )
}
