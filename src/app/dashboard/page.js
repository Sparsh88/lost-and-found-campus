'use client'

/**
 * app/dashboard/page.js  –  Shared Dashboard
 * ─────────────────────────────────────────────────────────────────
 * Overview dashboard showing statistics and recent found items.
 * All three teammates can contribute sections to this page.
 * ─────────────────────────────────────────────────────────────────
 */

import Link from 'next/link'
import { Package, BookOpen, ClipboardCheck, Clock, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { MOCK_FOUND_ITEMS, STATUS } from '@/modules/found/data'
import StatusBadge from '@/components/ui/StatusBadge'

// ─── Derive stats from mock data ──────────────────────────────────
function getStats(items) {
  return {
    total:      items.length,
    pending:    items.filter((i) => i.status === STATUS.PENDING).length,
    claimed:    items.filter((i) => i.status === STATUS.CLAIMED).length,
    verified:   items.filter((i) => i.status === STATUS.VERIFIED).length,
    handedOver: items.filter((i) => i.status === STATUS.HANDED_OVER).length,
  }
}

export default function DashboardPage() {
  const stats  = getStats(MOCK_FOUND_ITEMS)
  const recent = [...MOCK_FOUND_ITEMS]
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5)

  const statCards = [
    { label: 'Total Found Items', value: stats.total,      icon: Package,        color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
    { label: 'Pending',           value: stats.pending,    icon: Clock,          color: 'bg-yellow-50 text-yellow-700', border: 'border-yellow-200' },
    { label: 'Claimed',           value: stats.claimed,    icon: ClipboardCheck, color: 'bg-indigo-50 text-indigo-700', border: 'border-indigo-200' },
    { label: 'Handed Over',       value: stats.handedOver, icon: CheckCircle,    color: 'bg-green-50 text-green-700', border: 'border-green-200' },
  ]

  const modules = [
    { title: 'Module 1 – Lost Item Service',          description: 'Report and search for lost items.',                href: '/lost',   owner: 'Teammate 1', color: 'bg-red-50 text-red-700',   icon: BookOpen },
    { title: 'Module 2 – Found Item Service',         description: 'Register and browse found items.',                href: '/found',  owner: 'You (Me)',    color: 'bg-blue-50 text-blue-700', icon: Package },
    { title: 'Module 3 – Claim & Verification',       description: 'Submit claims and verify ownership.',             href: '/claims', owner: 'Teammate 3', color: 'bg-green-50 text-green-700', icon: ClipboardCheck },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="section-heading text-3xl">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of the Campus Lost &amp; Found system across all three modules.
        </p>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`card p-5 border ${s.border}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ─── Recent Found Items ─── */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Recent Found Items
              </h2>
              <Link href="/found" className="text-sm text-blue-700 hover:underline font-medium">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recent.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <img
                    src={item.imageUrl}
                    alt={item.itemName}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=100&q=80' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{item.itemName}</p>
                    <p className="text-xs text-gray-400 truncate">{item.location} · {item.foundDate}</p>
                  </div>
                  <StatusBadge status={item.status} />
                  <Link href={`/found/${item.id}`} className="text-blue-600 hover:text-blue-800 flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Module Status ─── */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800">Module Status</h2>
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <div key={mod.title} className="card p-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${mod.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{mod.title}</h3>
                <p className="text-xs text-gray-500 mb-1">{mod.description}</p>
                <p className="text-xs text-gray-400 mb-3">Owner: <strong>{mod.owner}</strong></p>
                <Link href={mod.href} className="text-xs text-blue-700 font-medium hover:underline flex items-center gap-1">
                  Open Module <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

