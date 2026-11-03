'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getFoundItemById, deleteFoundItem } from '@/modules/found/store'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryBadge from '@/components/ui/CategoryBadge'

export default function ItemDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const item = getFoundItemById(id)

  if (!item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Item Not Found</h2>
        <p className="text-gray-500 text-sm mb-4">
          This item does not exist or may have been deleted.
        </p>
        <Link href="/found" className="text-blue-600 hover:underline text-sm">
          ← Back to Found Items
        </Link>
      </div>
    )
  }

  function handleDelete() {
    if (confirm('Are you sure you want to delete this found item record?')) {
      deleteFoundItem(item.id)
      alert('Item deleted.')
      router.push('/found')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      <Link href="/found" className="text-blue-600 text-sm hover:underline mb-4 inline-block">
        ← Back to Found Items
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        
        {/* Item Image */}
        <img
          src={item.imageUrl || 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80'}
          alt={item.itemName}
          className="w-full h-64 object-cover"
        />

        <div className="p-6 space-y-5">
          
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={item.category} />
              <StatusBadge status={item.status} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{item.itemName}</h1>
            <p className="text-xs text-gray-400 mt-0.5">Item ID: #{item.id}</p>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Description</h2>
            <p className="text-gray-600 text-sm whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-lg text-sm">
            <div>
              <span className="text-gray-500 block text-xs">Found Location</span>
              <span className="font-medium text-gray-800">📍 {item.location}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-xs">Date &amp; Time</span>
              <span className="font-medium text-gray-800">📅 {item.foundDate} at {item.foundTime}</span>
            </div>
          </div>

          {/* Finder info */}
          <div className="border-t border-gray-100 pt-3 text-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">Finder Details</h2>
            <p className="text-gray-600">Name: <span className="font-medium text-gray-800">{item.finderName}</span></p>
            <p className="text-gray-600">Contact: <span className="font-medium text-gray-800">{item.finderContact}</span></p>
          </div>

          {/* Handover Info */}
          {item.handoverInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <h2 className="font-semibold text-green-900 mb-1">Handover Information</h2>
              <p className="text-green-800">{item.handoverInfo}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="border-t border-gray-100 pt-4 flex flex-wrap gap-3">
            <Link
              href={`/found/edit/${item.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              Edit / Update Status
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-sm px-4 py-2 rounded-lg transition"
            >
              Delete Item
            </button>
            <Link
              href="/claims"
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm px-4 py-2 rounded-lg ml-auto"
            >
              Claim this Item
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
