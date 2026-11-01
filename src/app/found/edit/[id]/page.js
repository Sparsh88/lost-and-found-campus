'use client'

/**
 * app/found/edit/[id]/page.js  –  Module 2: Update Found Item
 * ─────────────────────────────────────────────────────────────────
 * Allows users / finders / security staff to update found-item details,
 * manage status (Pending, Claimed, Verified, Handed Over), and add
 * handover details when an item is returned to its rightful owner.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, CheckCircle, Package, MapPin,
  User, ShieldCheck, AlertTriangle
} from 'lucide-react'
import { CATEGORIES, CAMPUS_LOCATIONS, STATUS } from '@/modules/found/data'
import { getFoundItemById, updateFoundItem } from '@/modules/found/store'

export default function EditFoundItemPage() {
  const { id } = useParams()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(null)
  const [form, setForm] = useState({
    itemName: '',
    category: '',
    description: '',
    location: '',
    foundDate: '',
    foundTime: '',
    imageUrl: '',
    finderName: '',
    finderContact: '',
    status: 'Pending',
    handoverInfo: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [updatedSuccess, setUpdatedSuccess] = useState(false)

  useEffect(() => {
    const existing = getFoundItemById(id)
    if (existing) {
      setItem(existing)
      setForm({
        itemName: existing.itemName || '',
        category: existing.category || '',
        description: existing.description || '',
        location: existing.location || '',
        foundDate: existing.foundDate || '',
        foundTime: existing.foundTime || '',
        imageUrl: existing.imageUrl || '',
        finderName: existing.finderName || '',
        finderContact: existing.finderContact || '',
        status: existing.status || 'Pending',
        handoverInfo: existing.handoverInfo || '',
      })
    }
    setLoading(false)
  }, [id])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.itemName.trim()) errs.itemName = 'Item name is required.'
    if (!form.category) errs.category = 'Please select a category.'
    if (!form.description.trim()) errs.description = 'Description is required.'
    if (!form.location.trim()) errs.location = 'Location is required.'
    if (!form.foundDate) errs.foundDate = 'Found date is required.'
    if (!form.foundTime) errs.foundTime = 'Found time is required.'
    if (!form.finderName.trim()) errs.finderName = 'Finder name is required.'
    if (!form.finderContact.trim()) errs.finderContact = 'Finder contact is required.'
    if (form.status === 'Handed Over' && !form.handoverInfo.trim()) {
      errs.handoverInfo = 'Please provide handover notes (recipient name, student ID, security staff badge).'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))

    updateFoundItem(id, form)
    setSubmitting(false)
    setUpdatedSuccess(true)

    setTimeout(() => {
      router.push(`/found/${id}`)
    }, 1500)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading item...</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Item Not Found</h2>
        <p className="text-slate-500 text-sm mb-6">Cannot edit an item that does not exist.</p>
        <Link href="/found" className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Back to Found Items
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/found/${id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Item Details
        </Link>
        <h1 className="section-heading text-3xl">Manage / Edit Found Item</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Update found item details, modify status, or record handover notes.
        </p>
      </div>

      {updatedSuccess ? (
        <div className="card p-8 text-center bg-emerald-50 border border-emerald-200">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-emerald-900 mb-1">Changes Saved Successfully!</h2>
          <p className="text-emerald-700 text-xs">Redirecting back to item details...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Status & Handover Control */}
          <div className="card p-6 space-y-4 border border-emerald-200/80 bg-emerald-50/20">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-emerald-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              Item Status &amp; Handover Management
            </h2>

            <div>
              <label className="form-label" htmlFor="status">
                Current Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="form-input bg-white font-semibold text-slate-800"
              >
                <option value={STATUS.PENDING}>Pending (Awaiting Claim)</option>
                <option value={STATUS.CLAIMED}>Claimed (Claim Under Review)</option>
                <option value={STATUS.VERIFIED}>Verified (Ownership Confirmed)</option>
                <option value={STATUS.HANDED_OVER}>Handed Over (Returned to Owner)</option>
              </select>
            </div>

            {form.status === 'Handed Over' && (
              <div className="space-y-2 pt-2">
                <label className="form-label" htmlFor="handoverInfo">
                  Handover Information <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="handoverInfo"
                  name="handoverInfo"
                  rows={3}
                  value={form.handoverInfo}
                  onChange={handleChange}
                  placeholder="Record handover details: recipient name, student ID, verification date, security officer name..."
                  className={`form-input bg-white resize-none ${errors.handoverInfo ? 'border-rose-400 focus:ring-rose-400' : ''}`}
                />
                {errors.handoverInfo && <p className="text-rose-500 text-xs">{errors.handoverInfo}</p>}
              </div>
            )}
          </div>

          {/* Item Basic Information */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">
              <Package className="w-4 h-4 text-emerald-600" />
              Item Details
            </h2>

            <div>
              <label className="form-label" htmlFor="itemName">Item Name *</label>
              <input
                id="itemName"
                name="itemName"
                type="text"
                value={form.itemName}
                onChange={handleChange}
                className={`form-input ${errors.itemName ? 'border-rose-400' : ''}`}
              />
              {errors.itemName && <p className="text-rose-500 text-xs mt-1">{errors.itemName}</p>}
            </div>

            <div>
              <label className="form-label" htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`form-input ${errors.category ? 'border-rose-400' : ''}`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label" htmlFor="description">Detailed Description *</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                className={`form-input resize-none ${errors.description ? 'border-rose-400' : ''}`}
              />
              {errors.description && <p className="text-rose-500 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Location & Time */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Location &amp; Date
            </h2>

            <div>
              <label className="form-label" htmlFor="location">Found Location *</label>
              <input
                id="location"
                name="location"
                type="text"
                list="campus-locations-edit"
                value={form.location}
                onChange={handleChange}
                className={`form-input ${errors.location ? 'border-rose-400' : ''}`}
              />
              <datalist id="campus-locations-edit">
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="foundDate">Found Date *</label>
                <input
                  id="foundDate"
                  name="foundDate"
                  type="date"
                  value={form.foundDate}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="foundTime">Found Time *</label>
                <input
                  id="foundTime"
                  name="foundTime"
                  type="time"
                  value={form.foundTime}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Finder Details */}
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-emerald-600" />
              Finder Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="finderName">Finder Name *</label>
                <input
                  id="finderName"
                  name="finderName"
                  type="text"
                  value={form.finderName}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label" htmlFor="finderContact">Finder Contact *</label>
                <input
                  id="finderContact"
                  name="finderContact"
                  type="text"
                  value={form.finderContact}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 justify-center py-3 text-sm"
            >
              {submitting ? 'Saving Changes...' : 'Save & Update Item'}
            </button>
            <Link href={`/found/${id}`} className="btn-secondary flex-1 justify-center py-3 text-sm text-center">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
