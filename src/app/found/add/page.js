'use client'

/**
 * app/found/add/page.js  –  Module 2: Report a Found Item
 * ─────────────────────────────────────────────────────────────────
 * Form for registering a newly found item. Fields:
 *   Item name · Category · Description · Location · Found date
 *   Found time · Image upload (preview) · Finder name · Finder contact
 *
 * On submit: item is added to the in-memory store and user is
 * redirected to the Found Items listing.
 *
 * MongoDB integration: replace addFoundItem() with a POST fetch.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Upload, X, CheckCircle,
  Package, MapPin, Calendar, Clock,
  User, Phone, Tag, FileText,
} from 'lucide-react'
import { CATEGORIES, CAMPUS_LOCATIONS } from '@/modules/found/data'
import { addFoundItem } from '@/modules/found/store'

// ─── Initial form state ───────────────────────────────────────────
const INITIAL_FORM = {
  itemName:       '',
  category:       '',
  description:    '',
  location:       '',
  foundDate:      '',
  foundTime:      '',
  imageUrl:       '',          // URL entered manually (file upload → Data URL in demo)
  finderName:     '',
  finderContact:  '',
}

export default function ReportFoundItemPage() {
  const router = useRouter()

  // ── State ──────────────────────────────────────────────────────
  const [form,        setForm]        = useState(INITIAL_FORM)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors,      setErrors]      = useState({})
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)

  // ── Handlers ───────────────────────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, imageUrl: 'Please upload a valid image file.' }))
      return
    }
    // Validate file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, imageUrl: 'Image must be smaller than 5 MB.' }))
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setImagePreview(ev.target.result)
      setForm((prev) => ({ ...prev, imageUrl: ev.target.result }))
      setErrors((prev) => ({ ...prev, imageUrl: '' }))
    }
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImagePreview(null)
    setForm((prev) => ({ ...prev, imageUrl: '' }))
  }

  // ── Validation ─────────────────────────────────────────────────
  function validate() {
    const newErrors = {}

    if (!form.itemName.trim())      newErrors.itemName     = 'Item name is required.'
    if (!form.category)             newErrors.category     = 'Please select a category.'
    if (!form.description.trim())   newErrors.description  = 'Description is required.'
    if (form.description.trim().length < 20)
      newErrors.description = 'Description must be at least 20 characters.'
    if (!form.location.trim())      newErrors.location     = 'Location is required.'
    if (!form.foundDate)            newErrors.foundDate    = 'Found date is required.'
    if (!form.foundTime)            newErrors.foundTime    = 'Found time is required.'
    if (!form.finderName.trim())    newErrors.finderName   = 'Your name is required.'
    if (!form.finderContact.trim()) newErrors.finderContact = 'Contact information is required.'

    // Date must not be in the future
    if (form.foundDate) {
      const today = new Date().toISOString().split('T')[0]
      if (form.foundDate > today) newErrors.foundDate = 'Found date cannot be in the future.'
    }

    return newErrors
  }

  // ── Submit ─────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    try {
      // ── MongoDB stub: replace with POST /api/found-items ───────
      // const res = await fetch('/api/found-items', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(form),
      // })
      // const data = await res.json()
      // ──────────────────────────────────────────────────────────

      addFoundItem(form)        // <- in-memory store (remove when using MongoDB)

      // Simulate network delay for UX
      await new Promise((r) => setTimeout(r, 800))

      setSubmitted(true)
      // Redirect to listing after a short success screen
      setTimeout(() => router.push('/found'), 2000)
    } catch (err) {
      console.error('Submit error:', err)
      setErrors({ submit: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Success Screen ───────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Registered!</h2>
          <p className="text-gray-500 mb-6">
            Thank you! The found item has been registered successfully. Redirecting
            you to the Found Items page…
          </p>
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  // ─── Form ─────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <Link href="/found" className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Found Items
        </Link>
        <h1 className="section-heading text-3xl">Report a Found Item</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Fill in the details below to register an item you found on campus.
          Fields marked <span className="text-red-500">*</span> are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

        {/* ── Section 1: Item Details ── */}
        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-base border-b pb-3">
            <Package className="w-5 h-5 text-blue-600" />
            Item Details
          </h2>

          {/* Item Name */}
          <div data-error={!!errors.itemName}>
            <label className="form-label" htmlFor="itemName">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              id="itemName"
              name="itemName"
              type="text"
              value={form.itemName}
              onChange={handleChange}
              placeholder="e.g. Samsung Galaxy S23, Blue Water Bottle…"
              className={`form-input ${errors.itemName ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            {errors.itemName && <p className="text-red-500 text-xs mt-1">{errors.itemName}</p>}
          </div>

          {/* Category */}
          <div data-error={!!errors.category}>
            <label className="form-label" htmlFor="category">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`form-input pl-9 appearance-none ${errors.category ? 'border-red-400 focus:ring-red-400' : ''}`}
              >
                <option value="">Select a category…</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Description */}
          <div data-error={!!errors.description}>
            <label className="form-label" htmlFor="description">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the item in detail — colour, brand, condition, any distinguishing marks…"
              className={`form-input resize-none ${errors.description ? 'border-red-400 focus:ring-red-400' : ''}`}
            />
            <div className="flex justify-between mt-1">
              {errors.description
                ? <p className="text-red-500 text-xs">{errors.description}</p>
                : <span />
              }
              <span className="text-xs text-gray-400">{form.description.length} chars</span>
            </div>
          </div>
        </div>

        {/* ── Section 2: Location & Time ── */}
        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-base border-b pb-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            Where &amp; When Was It Found?
          </h2>

          {/* Location */}
          <div data-error={!!errors.location}>
            <label className="form-label" htmlFor="location">
              Found Location on Campus <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                list="campus-locations"
                placeholder="Start typing a location or choose from the list…"
                className={`form-input pl-9 ${errors.location ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </div>
            <datalist id="campus-locations">
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>

          {/* Found Date + Found Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div data-error={!!errors.foundDate}>
              <label className="form-label" htmlFor="foundDate">
                Found Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="foundDate"
                  name="foundDate"
                  type="date"
                  value={form.foundDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`form-input pl-9 ${errors.foundDate ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </div>
              {errors.foundDate && <p className="text-red-500 text-xs mt-1">{errors.foundDate}</p>}
            </div>

            <div data-error={!!errors.foundTime}>
              <label className="form-label" htmlFor="foundTime">
                Found Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="foundTime"
                  name="foundTime"
                  type="time"
                  value={form.foundTime}
                  onChange={handleChange}
                  className={`form-input pl-9 ${errors.foundTime ? 'border-red-400 focus:ring-red-400' : ''}`}
                />
              </div>
              {errors.foundTime && <p className="text-red-500 text-xs mt-1">{errors.foundTime}</p>}
            </div>
          </div>
        </div>

        {/* ── Section 3: Image Upload ── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-base border-b pb-3">
            <Upload className="w-5 h-5 text-blue-600" />
            Item Image <span className="text-gray-400 font-normal text-sm">(Optional)</span>
          </h2>

          {imagePreview ? (
            /* Preview */
            <div className="relative w-full max-w-sm">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl border border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Upload Zone */
            <label
              htmlFor="imageUpload"
              className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                <span className="text-blue-700 font-semibold">Click to upload</span> or drag &amp; drop
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5 MB</p>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
              />
            </label>
          )}
          {errors.imageUrl && <p className="text-red-500 text-xs">{errors.imageUrl}</p>}
        </div>

        {/* ── Section 4: Finder Contact ── */}
        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-base border-b pb-3">
            <User className="w-5 h-5 text-blue-600" />
            Finder&apos;s Contact Information
          </h2>

          {/* Finder Name */}
          <div data-error={!!errors.finderName}>
            <label className="form-label" htmlFor="finderName">
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="finderName"
                name="finderName"
                type="text"
                value={form.finderName}
                onChange={handleChange}
                placeholder="Your full name"
                className={`form-input pl-9 ${errors.finderName ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </div>
            {errors.finderName && <p className="text-red-500 text-xs mt-1">{errors.finderName}</p>}
          </div>

          {/* Finder Contact */}
          <div data-error={!!errors.finderContact}>
            <label className="form-label" htmlFor="finderContact">
              Contact (Email or Phone) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                id="finderContact"
                name="finderContact"
                type="text"
                value={form.finderContact}
                onChange={handleChange}
                placeholder="your.email@campus.edu.in or 98XXXXXXXX"
                className={`form-input pl-9 ${errors.finderContact ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
            </div>
            {errors.finderContact && <p className="text-red-500 text-xs mt-1">{errors.finderContact}</p>}
          </div>

          {/* Info note */}
          <div className="flex gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-700">
            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Your contact details are shared only with authorized campus security staff
              and the verified owner of the item. They will not be publicly displayed.
            </p>
          </div>
        </div>

        {/* ── Global Error ── */}
        {errors.submit && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {errors.submit}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Submit Found Item Report
              </>
            )}
          </button>
          <Link href="/found" className="btn-secondary flex-1 justify-center py-3 text-base text-center">
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}

