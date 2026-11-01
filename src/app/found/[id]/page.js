'use client'

/**
 * app/found/[id]/page.js  –  Module 2: Found Item Details
 * ─────────────────────────────────────────────────────────────────
 * Displays complete information for a single found item including:
 *   • Full image, name, category, status
 *   • Description, location, date/time
 *   • Finder contact details
 *   • Handover information (when status is 'Handed Over')
 *   • Action buttons (Edit / Delete)
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
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconColor: 'text-yellow-600',
    message: 'This item is currently awaiting a claim. If this belongs to you, go to the Claims page to submit a claim.',
  },
  'Claimed': {
    icon: Info,
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    iconColor: 'text-blue-600',
    message: 'A claim has been submitted for this item. Campus security is currently reviewing the ownership verification.',
  },
  'Verified': {
    icon: CheckCircle,
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    iconColor: 'text-purple-600',
    message: 'Ownership has been verified. Coordinate with campus security for item collection.',
  },
  'Handed Over': {
    icon: CheckCircle,
    color: 'bg-green-50 border-green-200 text-green-800',
    iconColor: 'text-green-600',
    message: 'This item has been successfully returned to its verified owner.',
  },
}

// ─── Detail row component ─────────────────────────────────────────
function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-gray-800 text-sm font-medium">{value}</p>
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
    // Simulate async fetch (replace with fetch('/api/found-items/' + id))
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
    await new Promise((r) => setTimeout(r, 600))  // UX delay
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
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading item details…</p>
      </div>
    )
  }

  // ─── Not Found ────────────────────────────────────────────────
  if (notFound || !item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
        <p className="text-gray-500 mb-6">
          The item you are looking for does not exist or may have been removed.
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
      <Link href="/found" className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Found Items
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* ══════ LEFT: Image + Quick Actions ══════ */}
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
            <div className="p-4 flex items-center justify-between">
              <CategoryBadge category={item.category} />
              <StatusBadge status={item.status} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 text-sm">Actions</h3>
            <Link
              href="/claims"
              className="btn-primary w-full justify-center text-sm"
            >
              <Shield className="w-4 h-4" />
              Submit a Claim
            </Link>
            <Link
              href={`/found/edit/${item.id}`}
              className="btn-secondary w-full justify-center text-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit This Report
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger w-full justify-center text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Report
            </button>
          </div>

          {/* Submission info */}
          <div className="text-xs text-gray-400 text-center">
            Registered on {submittedAt}
          </div>
        </div>

        {/* ══════ RIGHT: Details ══════ */}
        <div className="lg:col-span-3 space-y-5">

          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{item.itemName}</h1>
            <p className="text-gray-400 text-sm">Item ID: <span className="font-mono">{item.id}</span></p>
          </div>

          {/* Status Banner */}
          <div className={`flex items-start gap-3 p-4 rounded-xl border ${statusInfo.color}`}>
            <StatusIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${statusInfo.iconColor}`} />
            <p className="text-sm leading-relaxed">{statusInfo.message}</p>
          </div>

          {/* Description */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Description
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Details Grid */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Item Information
            </h2>
            <DetailRow icon={Tag}      label="Category"   value={item.category} />
            <DetailRow icon={MapPin}   label="Found At"   value={item.location} />
            <DetailRow icon={Calendar} label="Found Date" value={formattedDate} />
            <DetailRow icon={Clock}    label="Found Time" value={item.foundTime} />
          </div>

          {/* Finder Details */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Finder's Information
            </h2>
            <DetailRow icon={User}  label="Finder Name"    value={item.finderName} />
            <DetailRow icon={Phone} label="Contact"        value={item.finderContact} />
          </div>

          {/* Handover Info (only when Handed Over) */}
          {item.status === 'Handed Over' && item.handoverInfo && (
            <div className="card p-5 border-l-4 border-green-500">
              <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Handover Information
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">{item.handoverInfo}</p>
            </div>
          )}

        </div>
      </div>

      {/* ─── Delete Confirmation Modal ─── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Report?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This will permanently delete the found item report for{' '}
              <strong>{item.itemName}</strong>. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger flex-1 justify-center"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

