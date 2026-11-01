/**
 * components/ui/FoundItemCard.jsx
 * Card component for displaying a single found item in the listing grid.
 */
import Link from 'next/link'
import { MapPin, Clock, User, ArrowRight } from 'lucide-react'
import StatusBadge from './StatusBadge'
import CategoryBadge from './CategoryBadge'

/**
 * @param {{ item: import('@/modules/found/data').FoundItem }} props
 */
export default function FoundItemCard({ item }) {
  // Format date nicely
  const formattedDate = new Date(item.foundDate + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="card card-hover flex flex-col group">
      {/* ─── Image ─── */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <img
          src={item.imageUrl || 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=400&q=80'}
          alt={item.itemName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=400&q=80'
          }}
        />
        {/* overlay badges */}
        <div className="absolute top-2.5 left-2.5">
          <CategoryBadge category={item.category} />
        </div>
        <div className="absolute top-2.5 right-2.5">
          <StatusBadge status={item.status} />
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">{item.itemName}</h3>
        <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">{item.description}</p>

        {/* Meta info */}
        <div className="space-y-1.5 mt-auto pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{formattedDate} at {item.foundTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">Found by: {item.finderName}</span>
          </div>
        </div>

        {/* View Details button */}
        <Link
          href={`/found/${item.id}`}
          className="mt-4 btn-primary w-full justify-center text-xs py-2 px-3"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
