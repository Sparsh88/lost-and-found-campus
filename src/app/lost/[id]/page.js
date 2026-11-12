'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { DEFAULT_ITEM_IMAGE, ITEM_CATEGORIES } from '@/lib/constants'
import CategoryBadge from '@/components/ui/CategoryBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import FinderModal from '@/components/FinderModal'

export default function LostItemDetailsPage() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [finderModalOpen, setFinderModalOpen] = useState(false)
  const [finderSubmissions, setFinderSubmissions] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)

  const loadItem = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/lost-items/${id}`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok && data.item) {
        setItem(data.item)
        setEditForm({
          itemName: data.item.itemName,
          category: data.item.category,
          description: data.item.description,
          lostLocation: data.item.lostLocation,
          lostDate: data.item.lostDate,
          identifyingDetails: data.item.identifyingDetails || '',
        })

        if (data.item.isOwner) {
          const fRes = await fetch(`/api/lost-items/${id}/finder`, { cache: 'no-store' })
          if (fRes.ok) {
            const fData = await fRes.json()
            setFinderSubmissions(fData.submissions || [])
          }
        }
      } else {
        setItem(null)
      }
    } catch {
      setItem(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadItem()
  }, [loadItem])

  async function handleOwnerSave(e) {
    e.preventDefault()
    setActionError('')
    setActionMessage('')
    setSaving(true)
    try {
      const res = await fetch(`/api/lost-items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error || 'Failed to update report.')
      } else {
        setActionMessage('Lost report updated successfully.')
        setIsEditing(false)
        await loadItem()
      }
    } catch {
      setActionError('Unable to reach server.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(newStatus) {
    setActionError('')
    setActionMessage('')
    try {
      const res = await fetch(`/api/lost-items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error || 'Failed to update status.')
      } else {
        setActionMessage(`Report marked as ${newStatus}.`)
        await loadItem()
      }
    } catch {
      setActionError('Unable to reach server.')
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slateGray">
        Loading lost item report...
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-charcoal mb-2">Item Not Found</h2>
        <p className="text-slateGray text-sm mb-4">
          This lost item report does not exist or may have been deleted.
        </p>
        <Link
          href="/lost"
          className="text-brightAzure hover:text-electricBlue hover:underline text-sm font-medium"
        >
          ← Back to Lost Items
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link
        href="/lost"
        className="text-brightAzure hover:text-electricBlue text-sm hover:underline inline-block font-medium"
      >
        ← Back to Lost Items
      </Link>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-forestGreen text-xs p-3 rounded-lg">
          ✓ {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg">
          ⚠️ {actionError}
        </div>
      )}

      <div className="bg-softSand rounded-xl border border-lightGray overflow-hidden shadow-sm">
        <img
          src={item.imageUrl || DEFAULT_ITEM_IMAGE}
          alt={item.itemName}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = DEFAULT_ITEM_IMAGE
          }}
          className="w-full h-64 sm:h-80 object-cover"
        />

        <div className="p-6 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={item.category} />
              <StatusBadge status={item.status} />
            </div>

            <h1 className="text-2xl font-bold text-charcoal">{item.itemName}</h1>
            <p className="text-xs text-slateGray mt-0.5">Report ID: {item.reportId}</p>
          </div>

          {!isEditing ? (
            <>
              <div>
                <h2 className="text-sm font-semibold text-charcoal mb-1">Description</h2>
                <p className="text-slateGray text-sm whitespace-pre-wrap">{item.description}</p>
              </div>

              {item.identifyingDetails && (
                <div className="bg-warmWhite border border-lightGray p-4 rounded-lg text-sm">
                  <span className="text-xs font-semibold text-charcoal block mb-1">
                    Identifying Details
                  </span>
                  <p className="text-slateGray text-sm">{item.identifyingDetails}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-warmWhite border border-lightGray p-4 rounded-lg text-sm">
                <div>
                  <span className="text-slateGray block text-xs">Lost Location</span>
                  <span className="font-semibold text-charcoal">📍 {item.lostLocation}</span>
                </div>
                <div>
                  <span className="text-slateGray block text-xs">Lost Date</span>
                  <span className="font-semibold text-charcoal">📅 {item.lostDate}</span>
                </div>
              </div>

              <div className="border-t border-lightGray pt-4 flex flex-wrap gap-3">
                {item.status === 'ACTIVE' && !item.isOwner && (
                  <button
                    type="button"
                    onClick={() => setFinderModalOpen(true)}
                    className="bg-forestGreen hover:bg-green-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition shadow-sm"
                  >
                    I Found This Item →
                  </button>
                )}

                {item.isOwner && item.status !== 'RETURNED' && (
                  <>
                    {item.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition shadow-sm"
                      >
                        Edit Report
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleStatus(item.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE')
                      }
                      className="bg-warmWhite border border-lightGray hover:bg-white text-charcoal text-sm font-semibold px-5 py-2.5 rounded-lg transition"
                    >
                      {item.status === 'ACTIVE' ? 'Close Report' : 'Reopen Report'}
                    </button>
                  </>
                )}

                <Link
                  href="/found"
                  className="bg-warmWhite border border-lightGray hover:bg-white text-charcoal text-sm font-medium px-4 py-2.5 rounded-lg transition"
                >
                  Check Found Items Catalog
                </Link>
              </div>
            </>
          ) : (
            <form onSubmit={handleOwnerSave} className="space-y-3 border-t border-lightGray pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={editForm.itemName}
                    onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })}
                    className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Category *</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal"
                  >
                    {ITEM_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Lost Location *</label>
                  <input
                    type="text"
                    required
                    value={editForm.lostLocation}
                    onChange={(e) => setEditForm({ ...editForm, lostLocation: e.target.value })}
                    className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Lost Date *</label>
                  <input
                    type="date"
                    required
                    value={editForm.lostDate}
                    onChange={(e) => setEditForm({ ...editForm, lostDate: e.target.value })}
                    className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Identifying Details</label>
                <textarea
                  rows={2}
                  value={editForm.identifyingDetails}
                  onChange={(e) => setEditForm({ ...editForm, identifyingDetails: e.target.value })}
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-warmWhite border border-lightGray text-charcoal text-xs font-semibold px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Private Finder Submissions section visible strictly to the Report Owner */}
      {item.isOwner && (
        <div className="bg-softSand rounded-xl border border-lightGray p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal">
                Private Finder Messages ({finderSubmissions.length})
              </h2>
              <p className="text-xs text-slateGray">
                Only visible to you and campus security administrators.
              </p>
            </div>
          </div>

          {finderSubmissions.length > 0 ? (
            <div className="space-y-3">
              {finderSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-warmWhite border border-lightGray rounded-xl p-4 space-y-2 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-charcoal text-sm">
                      {sub.finderName} (Reg: {sub.registrationNumber})
                    </span>
                    <span className="text-slateGray">
                      {new Date(sub.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-charcoal">
                    <strong>Contact Mobile:</strong> {sub.mobileNumber}
                  </p>
                  <p className="text-slateGray whitespace-pre-wrap bg-white p-2.5 rounded-lg border border-lightGray">
                    {sub.message}
                  </p>
                  {sub.photoFile?.fileId && (
                    <div>
                      <a
                        href={`/api/files/private/${sub.photoFile.fileId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brightAzure hover:underline font-semibold"
                      >
                        📎 View Found-Item Photograph ({sub.photoFile.originalName})
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slateGray">
              No finder submissions received yet for this report.
            </p>
          )}
        </div>
      )}

      <FinderModal
        lostItem={item}
        isOpen={finderModalOpen}
        onClose={() => setFinderModalOpen(false)}
        onSuccess={() => loadItem()}
      />
    </div>
  )
}
