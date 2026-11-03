'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getFoundItemById, deleteFoundItem } from '@/modules/found/store'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryBadge from '@/components/ui/CategoryBadge'

export default function ItemDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const item = getFoundItemById(id)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('currentUser')
    const admin = localStorage.getItem('isAdmin') === 'true'
    if (user || admin) {
      setIsLoggedIn(true)
    }
  }, [])

  if (!item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-charcoal mb-2">Item Not Found</h2>
        <p className="text-slateGray text-sm mb-4">
          This item does not exist or may have been deleted.
        </p>
        <Link href="/found" className="text-brightAzure hover:text-electricBlue hover:underline text-sm font-medium">
          ← Back to Found Items
        </Link>
      </div>
    )
  }

  function handleDelete() {
    const user = localStorage.getItem('currentUser')
    const admin = localStorage.getItem('isAdmin') === 'true'
    if (!user && !admin) {
      alert('You must be logged in to delete an item.')
      router.push('/login')
      return
    }

    if (confirm('Are you sure you want to delete this found item record?')) {
      deleteFoundItem(item.id)
      alert('Item deleted.')
      router.push('/found')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      
      <Link href="/found" className="text-brightAzure hover:text-electricBlue text-sm hover:underline mb-4 inline-block font-medium">
        ← Back to Found Items
      </Link>

      <div className="bg-softSand rounded-xl border border-lightGray overflow-hidden shadow-sm">
        
        <img
          src={item.imageUrl || 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80'}
          alt={item.itemName}
          className="w-full h-64 object-cover"
        />

        <div className="p-6 space-y-5">
          
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={item.category} />
              <StatusBadge status={item.status} />
            </div>
            <h1 className="text-2xl font-bold text-charcoal">{item.itemName}</h1>
            <p className="text-xs text-slateGray mt-0.5">Item ID: #{item.id}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-charcoal mb-1">Description</h2>
            <p className="text-slateGray text-sm whitespace-pre-wrap">{item.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-warmWhite border border-lightGray p-4 rounded-lg text-sm">
            <div>
              <span className="text-slateGray block text-xs">Found Location</span>
              <span className="font-semibold text-charcoal">📍 {item.location}</span>
            </div>
            <div>
              <span className="text-slateGray block text-xs">Date &amp; Time</span>
              <span className="font-semibold text-charcoal">📅 {item.foundDate} at {item.foundTime}</span>
            </div>
          </div>

          <div className="border-t border-lightGray pt-3 text-sm">
            <h2 className="text-sm font-semibold text-charcoal mb-1">Finder Details</h2>
            <p className="text-slateGray">Name: <span className="font-semibold text-charcoal">{item.finderName}</span></p>
            <p className="text-slateGray">Contact: <span className="font-semibold text-charcoal">{item.finderContact}</span></p>
          </div>

          {item.handoverInfo && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm">
              <h2 className="font-semibold text-forestGreen mb-1">Handover Information</h2>
              <p className="text-forestGreen">{item.handoverInfo}</p>
            </div>
          )}

          <div className="border-t border-lightGray pt-4 flex flex-wrap gap-3">
            {isLoggedIn ? (
              <Link
                href={`/found/edit/${item.id}`}
                className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
              >
                Edit / Update Status
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
              >
                Log In to Edit
              </Link>
            )}

            {isLoggedIn && (
              <button
                onClick={handleDelete}
                className="bg-red-50 hover:bg-red-100 text-crimsonRed border border-red-200 text-sm font-medium px-4 py-2 rounded-lg transition"
              >
                Delete Item
              </button>
            )}

            <Link
              href="/claims"
              className="bg-warmWhite border border-lightGray hover:bg-white text-midnightNavy text-sm font-medium px-4 py-2 rounded-lg ml-auto transition"
            >
              Claim this Item
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
