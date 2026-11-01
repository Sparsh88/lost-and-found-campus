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
    { label: 'Total Found Items', value: stats.total,      icon: Package,        color: 'bg-slate-100 text-slate-800', border: 'border-slate-200' },
    { label: 'Pending Claims',    value: stats.pending,    icon: Clock,          color: 'bg-amber-50 text-amber-800', border: 'border-amber-200' },
    { label: 'In Verification',   value: stats.claimed,    icon: ClipboardCheck, color: 'bg-indigo-50 text-indigo-800', border: 'border-indigo-200' },
    { label: 'Returned to Owner', value: stats.handedOver, icon: CheckCircle,    color: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-200' },
  ]

  const modules = [
    { title: 'Module 1 – Lost Item Service',          description: 'Report and search for lost items.',                href: '/lost',   owner: 'Teammate 1', color: 'bg-rose-50 text-rose-700',   icon: BookOpen },
    { title: 'Module 2 – Found Item Service',         description: 'Register and browse found items.',                href: '/found',  owner: 'You (Me)',    color: 'bg-emerald-50 text-emerald-700', icon: Package },
    { title: 'Module 3 – Claim & Verification',       description: 'Submit claims and verify ownership.',             href: '/claims', owner: 'Teammate 3', color: 'bg-indigo-50 text-indigo-700', icon: ClipboardCheck },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="section-heading text-3xl">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">
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
              <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ─── Recent Found Items ─── */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Recent Found Items
              </h2>
              <Link href="/found" className="text-xs text-emerald-700 hover:underline font-semibold">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recent.map((item) => (
                <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                  <img
                    src={item.imageUrl}
                    alt={item.itemName}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-slate-100 border border-slate-200"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=100&q=80' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{item.itemName}</p>
                    <p className="text-xs text-slate-400 truncate">{item.location} · {item.foundDate}</p>
                  </div>
                  <StatusBadge status={item.status} />
                  <Link href={`/found/${item.id}`} className="text-slate-400 hover:text-slate-900 flex-shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Module Status ─── */}
        <div className="space-y-4">
          <h2 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Module Status</h2>
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <div key={mod.title} className="card p-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${mod.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{mod.title}</h3>
                <p className="text-xs text-slate-500 mb-2 leading-relaxed">{mod.description}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">Owner: <strong className="text-slate-700">{mod.owner}</strong></span>
                  <Link href={mod.href} className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                    Open <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
