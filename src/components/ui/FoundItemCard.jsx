import Link from 'next/link'
import StatusBadge from './StatusBadge'
import CategoryBadge from './CategoryBadge'

export default function FoundItemCard({ item }) {
  return (
    <div className="bg-softSand rounded-xl shadow-sm border border-lightGray overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition duration-200">
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

        <h3 className="font-semibold text-charcoal text-base mb-1 truncate">
          {item.itemName}
        </h3>

        <p className="text-slateGray text-sm line-clamp-2 mb-3">
          {item.description}
        </p>

        <div className="text-xs text-slateGray space-y-1 mb-4">
          <p>📍 {item.location}</p>
          <p>📅 {item.foundDate} at {item.foundTime}</p>
        </div>

        <Link
          href={`/found/${item.id}`}
          className="block text-center w-full bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium py-2 rounded-lg transition shadow-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
