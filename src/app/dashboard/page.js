'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getFoundItems, updateFoundItem, deleteFoundItem } from '@/modules/found/store'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryBadge from '@/components/ui/CategoryBadge'

export default function DashboardPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => {
    const adminFlag = localStorage.getItem('isAdmin') === 'true'
    setIsAdmin(adminFlag)
    setItems(getFoundItems())
    setLoading(false)
  }, [])

  function handleLogout() {
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('userEmail')
    window.dispatchEvent(new Event('authChange'))
    setIsAdmin(false)
    router.push('/login')
  }

  function handleStatusChange(id, newStatus) {
    updateFoundItem(id, { status: newStatus })
    setItems([...getFoundItems()])
  }

  function handleDelete(id) {
    if (confirm('Are you sure you want to delete this found item record?')) {
      deleteFoundItem(id)
      setItems([...getFoundItems()])
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slateGray">
        Loading...
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-softSand p-8 rounded-2xl border border-lightGray shadow-sm space-y-4">
          <span className="text-xs bg-red-100 text-crimsonRed border border-red-200 px-3 py-1 rounded-full font-semibold inline-block">
            Admin Access Required
          </span>
          <h1 className="text-2xl font-bold text-charcoal">Admin Panel Restricted</h1>
          <p className="text-slateGray text-sm">
            This dashboard is reserved for campus administration and security staff. Please sign in with administrator credentials to view system metrics and manage item custody.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/login"
              className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-sm"
            >
              Sign In as Admin
            </Link>
            <Link
              href="/found"
              className="bg-warmWhite border border-lightGray text-midnightNavy hover:bg-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
            >
              Browse Found Items
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const total = items.length
  const pending = items.filter((i) => i.status === 'Pending').length
  const claimed = items.filter((i) => i.status === 'Claimed').length
  const handedOver = items.filter((i) => i.status === 'Handed Over').length

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase()) ||
      item.finderName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal">Admin Panel</h1>
            <span className="text-xs bg-emerald-50 text-forestGreen border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">
              Administrator Mode
            </span>
          </div>
          <p className="text-slateGray text-sm">
            Campus Lost &amp; Found administration and custody records
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto bg-warmWhite border border-lightGray hover:bg-white text-crimsonRed font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm"
        >
          Logout Admin
        </button>
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
        
        <div className="p-4 border-b border-lightGray bg-softSand flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-charcoal text-base">Campus Item Custody Records</h2>
            <p className="text-xs text-slateGray">Manage verification states and item disposals</p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search items or finders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-warmWhite border border-lightGray rounded-lg px-3 py-1.5 text-xs text-charcoal placeholder-slateGray/70 focus:outline-none focus:ring-2 focus:ring-skyBlue"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-warmWhite border border-lightGray rounded-lg px-2.5 py-1.5 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-skyBlue"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Claimed">Claimed</option>
              <option value="Verified">Verified</option>
              <option value="Handed Over">Handed Over</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-warmWhite border-b border-lightGray text-xs font-semibold text-slateGray">
                <th className="p-3">Item Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Location &amp; Date</th>
                <th className="p-3">Finder</th>
                <th className="p-3">Current Status</th>
                <th className="p-3">Change Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightGray bg-warmWhite">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-softSand/40 transition">
                  <td className="p-3 font-semibold text-charcoal">
                    <Link href={`/found/${item.id}`} className="hover:text-brightAzure">
                      {item.itemName}
                    </Link>
                    <span className="block text-xs font-normal text-slateGray">ID: #{item.id}</span>
                  </td>
                  <td className="p-3">
                    <CategoryBadge category={item.category} />
                  </td>
                  <td className="p-3 text-xs text-slateGray">
                    <p className="font-medium text-charcoal">📍 {item.location}</p>
                    <p>📅 {item.foundDate}</p>
                  </td>
                  <td className="p-3 text-xs text-slateGray">
                    <p className="font-medium text-charcoal">{item.finderName}</p>
                    <p>{item.finderContact}</p>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-3">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="bg-warmWhite border border-lightGray rounded px-2 py-1 text-xs text-charcoal focus:outline-none focus:ring-1 focus:ring-skyBlue"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Claimed">Claimed</option>
                      <option value="Verified">Verified</option>
                      <option value="Handed Over">Handed Over</option>
                    </select>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Link
                      href={`/found/edit/${item.id}`}
                      className="text-xs text-brightAzure hover:text-electricBlue font-medium hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-crimsonRed hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slateGray text-sm">
                    No items match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  )
}
