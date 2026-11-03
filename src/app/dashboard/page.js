import Link from 'next/link'
import { getFoundItems } from '@/modules/found/store'
import StatusBadge from '@/components/ui/StatusBadge'

export default function DashboardPage() {
  const items = getFoundItems()

  // Calculate simple statistics
  const total = items.length
  const pending = items.filter((i) => i.status === 'Pending').length
  const claimed = items.filter((i) => i.status === 'Claimed').length
  const handedOver = items.filter((i) => i.status === 'Handed Over').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of campus lost &amp; found activities</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 font-medium uppercase">Total Found</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-xs text-yellow-600 font-medium uppercase">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{pending}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-xs text-blue-600 font-medium uppercase">Claimed</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{claimed}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <p className="text-xs text-green-600 font-medium uppercase">Handed Over</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{handedOver}</p>
        </div>
      </div>

      {/* Recent Items Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 text-base">Recent Found Items</h2>
          <Link href="/found" className="text-sm text-blue-600 hover:underline">
            View All →
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <Link href={`/found/${item.id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-sm block">
                  {item.itemName}
                </Link>
                <p className="text-xs text-gray-500">📍 {item.location} • 📅 {item.foundDate}</p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={item.status} />
                <Link href={`/found/${item.id}`} className="text-xs text-blue-600 hover:underline">
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
