import Link from 'next/link'
import { getFoundItems } from '@/modules/found/store'
import StatusBadge from '@/components/ui/StatusBadge'

export default function DashboardPage() {
  const items = getFoundItems()

  const total = items.length
  const pending = items.filter((i) => i.status === 'Pending').length
  const claimed = items.filter((i) => i.status === 'Claimed').length
  const handedOver = items.filter((i) => i.status === 'Handed Over').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Dashboard</h1>
        <p className="text-slateGray text-sm mt-1">Overview of campus lost &amp; found activities</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-softSand p-5 rounded-xl border border-lightGray shadow-sm">
          <p className="text-xs text-slateGray font-semibold uppercase tracking-wider">Total Found</p>
          <p className="text-3xl font-bold text-charcoal mt-1">{total}</p>
        </div>

        <div className="bg-softSand p-5 rounded-xl border border-lightGray shadow-sm">
          <p className="text-xs text-amberOrange font-semibold uppercase tracking-wider">Pending</p>
          <p className="text-3xl font-bold text-amberOrange mt-1">{pending}</p>
        </div>

        <div className="bg-softSand p-5 rounded-xl border border-lightGray shadow-sm">
          <p className="text-xs text-brightAzure font-semibold uppercase tracking-wider">Claimed</p>
          <p className="text-3xl font-bold text-brightAzure mt-1">{claimed}</p>
        </div>

        <div className="bg-softSand p-5 rounded-xl border border-lightGray shadow-sm">
          <p className="text-xs text-forestGreen font-semibold uppercase tracking-wider">Handed Over</p>
          <p className="text-3xl font-bold text-forestGreen mt-1">{handedOver}</p>
        </div>
      </div>

      <div className="bg-softSand rounded-xl border border-lightGray overflow-hidden shadow-sm">
        <div className="p-4 border-b border-lightGray flex justify-between items-center bg-softSand">
          <h2 className="font-bold text-charcoal text-base">Recent Found Items</h2>
          <Link href="/found" className="text-sm text-brightAzure hover:text-electricBlue hover:underline font-medium">
            View All →
          </Link>
        </div>

        <div className="divide-y divide-lightGray bg-warmWhite">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-softSand/50 transition">
              <div>
                <Link href={`/found/${item.id}`} className="font-semibold text-charcoal hover:text-brightAzure text-sm block">
                  {item.itemName}
                </Link>
                <p className="text-xs text-slateGray">📍 {item.location} • 📅 {item.foundDate}</p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={item.status} />
                <Link href={`/found/${item.id}`} className="text-xs text-brightAzure hover:text-electricBlue hover:underline font-medium">
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
