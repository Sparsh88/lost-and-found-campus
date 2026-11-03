import Link from 'next/link'
import StatusBadge from './StatusBadge'
import CategoryBadge from './CategoryBadge'

export default function FoundItemCard({ item }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      <img
        src={item.imageUrl || 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=400&q=80'}
        alt={item.itemName}
        className="w-full h-44 object-cover"
      />

      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <CategoryBadge category={item.category} />
          <StatusBadge status={item.status} />
        </div>

        <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
          {item.itemName}
        </h3>

        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {item.description}
        </p>

        <div className="text-xs text-gray-500 space-y-1 mb-4">
          <p>📍 {item.location}</p>
          <p>📅 {item.foundDate} at {item.foundTime}</p>
        </div>

        <Link
          href={`/found/${item.id}`}
          className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
