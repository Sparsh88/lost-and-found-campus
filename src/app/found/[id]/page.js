'use client'

/**
 * app/found/[id]/page.js  –  Module 2: Found Item Details
 * ─────────────────────────────────────────────────────────────────
 * Displays complete information for a single found item including:
 *   • Full image, name, category, status
 *   • Description, location, date/time
 *   • Finder contact details
 *   • Handover information (when status is 'Handed Over')
 *   • Action buttons (Edit / Delete / Submit Claim)
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, MapPin, Clock, Calendar, User, Phone,
  Package, AlertTriangle, CheckCircle, Edit3, Trash2,
  Info, Shield, Tag,
} from 'lucide-react'
import { getFoundItemById, deleteFoundItem } from '@/modules/found/store'
import StatusBadge from '@/components/ui/StatusBadge'
import CategoryBadge from '@/components/ui/CategoryBadge'

// ─── Status info panels ───────────────────────────────────────────
const STATUS_INFO = {
  'Pending': {
    icon: Clock,
    color: 'bg-amber-50/70 border-amber-200 text-amber-800',
    iconColor: 'text-amber-600',
    message: 'This item is currently awaiting an ownership claim. If this belongs to you, submit a claim below.',
  },
  'Claimed': {
    icon: Info,
    color: 'bg-slate-100 border-slate-300 text-slate-800',
    iconColor: 'text-slate-600',
    message: 'A claim has been submitted for this item. Campus security is reviewing ownership verification documents.',
  },
  'Verified': {
    icon: CheckCircle,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    iconColor: 'text-indigo-600',
    message: 'Ownership has been verified. The owner may coordinate with campus security for item collection.',
  },
  'Handed Over': {
    icon: CheckCircle,
    color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    iconColor: 'text-emerald-600',
    message: 'This item has been successfully returned and handed over to its verified owner.',
  },
}

// ─── Detail row component ─────────────────────────────────────────
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-emerald-700" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-slate-800 text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

export default function FoundItemDetailsPage() {
  const { id }  = useParams()
  const router  = useRouter()

  // ── State ──────────────────────────────────────────────────────
  const [item,           setItem]           = useState(null)
  const [loading,        setLoading]        = useState(true)
  const [notFound,       setNotFound]       = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting,       setDeleting]       = useState(false)

  // ── Load item ─────────────────────────────────────────────────
  useEffect(() => {
    const found = getFoundItemById(id)
    if (found) {
      setItem(found)
    } else {
      setNotFound(true)
    }
    setLoading(false)
  }, [id])

  // ── Delete ────────────────────────────────────────────────────
  async function handleDelete() {
    setDeleting(true)
    await new Promise((r) => setTimeout(r, 600))
    deleteFoundItem(id)
    router.push('/found')
  }

  // ── Format date ───────────────────────────────────────────────
  const formattedDate = item
    ? new Date(item.foundDate + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const submittedAt = item
    ? new Date(item.submittedAt).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : ''

  // ─── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading item details…</p>
      </div>
    )
  }

  // ─── Not Found ────────────────────────────────────────────────
  if (notFound || !item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Item Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">
          The item report does not exist or may have been removed.
        </p>
        <Link href="/found" className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Found Items
        </Link>
      </div>
    )
  }

  const statusInfo = STATUS_INFO[item.status] ?? STATUS_INFO['Pending']
  const StatusIcon = statusInfo.icon

  // ─── Main Details Page ────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ─── Back link ─── */}
      <Link href="/found" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Found Items
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ══════ LEFT: Image + Actions ══════ */}
        <div className="lg:col-span-2 space-y-4">

          {/* Image */}
          <div className="card overflow-hidden">
            <img
              src={item.imageUrl || 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80'}
              alt={item.itemName}
              className="w-full h-72 object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1586769852836-bc069f19e1b6?w=600&q=80'
              }}
            />
            <div className="p-4 flex items-center justify-between border-t border-slate-100">
              <CategoryBadge category={item.category} />
              <StatusBadge status={item.status} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-4 space-y-2.5">
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">Actions</h3>
            <Link
              href="/claims"
              className="btn-primary w-full justify-center text-xs py-2.5"
            >
              <Shield className="w-3.5 h-3.5" />
              Submit a Claim
            </Link>
            <Link
              href={`/found/edit/${item.id}`}
              className="btn-secondary w-full justify-center text-xs py-2.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit / Manage Report
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger w-full justify-center text-xs py-2.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Report
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Registered on {submittedAt}
          </div>
        </div>

        {/* ══════ RIGHT: Details ══════ */}
        <div className="lg:col-span-3 space-y-5">

          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{item.itemName}</h1>
            <p className="text-slate-400 text-xs">Item ID: <span className="font-mono text-slate-600">{item.id}</span></p>
          </div>

          {/* Status Banner */}
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${statusInfo.color}`}>
            <StatusIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${statusInfo.iconColor}`} />
            <p className="text-xs sm:text-sm leading-relaxed">{statusInfo.message}</p>
          </div>

          {/* Description */}
          <div className="card p-5">
            <h2 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Package className="w-4 h-4 text-emerald-600" />
              Description
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Details Grid */}
          <div className="card p-5">
            <h2 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Info className="w-4 h-4 text-emerald-600" />
              Item Information
            </h2>
            <DetailRow icon={Tag}      label="Category"   value={item.category} />
            <DetailRow icon={MapPin}   label="Found At"   value={item.location} />
            <DetailRow icon={Calendar} label="Found Date" value={formattedDate} />
            <DetailRow icon={Clock}    label="Found Time" value={item.foundTime} />
          </div>

          {/* Finder Details */}
          <div className="card p-5">
            <h2 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
              <User className="w-4 h-4 text-emerald-600" />
              Finder's Information
            </h2>
            <DetailRow icon={User}  label="Finder Name"    value={item.finderName} />
            <DetailRow icon={Phone} label="Contact"        value={item.finderContact} />
          </div>

          {/* Handover Info (only when Handed Over) */}
          {item.status === 'Handed Over' && item.handoverInfo && (
            <div className="card p-5 border-l-4 border-emerald-500 bg-emerald-50/20">
              <h2 className="font-bold text-slate-900 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Handover Information
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">{item.handoverInfo}</p>
            </div>
          )}

        </div>
      </div>

      {/* ─── Delete Confirmation Modal ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 text-center mb-1">Delete Report?</h3>
            <p className="text-slate-500 text-xs text-center mb-6 leading-relaxed">
              This will permanently delete the report for <strong>{item.itemName}</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="btn-secondary flex-1 justify-center text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger flex-1 justify-center text-xs"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
