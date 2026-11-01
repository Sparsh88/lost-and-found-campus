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
  imageUrl:       '',
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
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, imageUrl: 'Please upload a valid image file.' }))
      return
    }
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
      const firstError = document.querySelector('[data-error="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSubmitting(true)
    try {
      addFoundItem(form)
      await new Promise((r) => setTimeout(r, 600))
      setSubmitted(true)
      setTimeout(() => router.push('/found'), 1800)
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
        <div className="text-center max-w-md bg-white p-8 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Item Registered Successfully!</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Thank you for helping the campus community. Redirecting you to the Found Items list...
          </p>
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  // ─── Form ─────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <Link href="/found" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-4">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Found Items
        </Link>
        <h1 className="section-heading text-3xl">Report a Found Item</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Fill in the details below to register an item found on campus.
          Fields marked <span className="text-rose-500">*</span> are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* ── Section 1: Item Details ── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">
            <Package className="w-4 h-4 text-emerald-600" />
            Item Details
          </h2>

          {/* Item Name */}
          <div data-error={!!errors.itemName}>
            <label className="form-label" htmlFor="itemName">
              Item Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="itemName"
              name="itemName"
              type="text"
              value={form.itemName}
              onChange={handleChange}
              placeholder="e.g. Student ID Card, Scientific Calculator, Dell Bag..."
              className={`form-input ${errors.itemName ? 'border-rose-400 focus:ring-rose-400' : ''}`}
            />
            {errors.itemName && <p className="text-rose-500 text-xs mt-1">{errors.itemName}</p>}
          </div>

          {/* Category */}
          <div data-error={!!errors.category}>
            <label className="form-label" htmlFor="category">
              Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`form-input pl-10 appearance-none ${errors.category ? 'border-rose-400 focus:ring-rose-400' : ''}`}
              >
                <option value="">Select a category…</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {errors.category && <p className="text-rose-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Description */}
          <div data-error={!!errors.description}>
            <label className="form-label" htmlFor="description">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the item in detail — colour, brand, condition, identifying marks..."
              className={`form-input resize-none ${errors.description ? 'border-rose-400 focus:ring-rose-400' : ''}`}
            />
            <div className="flex justify-between mt-1">
              {errors.description
                ? <p className="text-rose-500 text-xs">{errors.description}</p>
                : <span />
              }
              <span className="text-xs text-slate-400">{form.description.length} characters</span>
            </div>
          </div>
        </div>

        {/* ── Section 2: Location & Time ── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Where &amp; When Was It Found?
          </h2>

          {/* Location */}
          <div data-error={!!errors.location}>
            <label className="form-label" htmlFor="location">
              Found Location on Campus <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                list="campus-locations"
                placeholder="e.g. Main Library, Cafeteria, Sports Complex..."
                className={`form-input pl-10 ${errors.location ? 'border-rose-400 focus:ring-rose-400' : ''}`}
              />
            </div>
            <datalist id="campus-locations">
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
            {errors.location && <p className="text-rose-500 text-xs mt-1">{errors.location}</p>}
          </div>

          {/* Found Date + Found Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div data-error={!!errors.foundDate}>
              <label className="form-label" htmlFor="foundDate">
                Found Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="foundDate"
                  name="foundDate"
                  type="date"
                  value={form.foundDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`form-input pl-10 ${errors.foundDate ? 'border-rose-400' : ''}`}
                />
              </div>
              {errors.foundDate && <p className="text-rose-500 text-xs mt-1">{errors.foundDate}</p>}
            </div>

            <div data-error={!!errors.foundTime}>
              <label className="form-label" htmlFor="foundTime">
                Found Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="foundTime"
                  name="foundTime"
                  type="time"
                  value={form.foundTime}
                  onChange={handleChange}
                  className={`form-input pl-10 ${errors.foundTime ? 'border-rose-400' : ''}`}
                />
              </div>
              {errors.foundTime && <p className="text-rose-500 text-xs mt-1">{errors.foundTime}</p>}
            </div>
          </div>
        </div>

        {/* ── Section 3: Image Upload ── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">
            <Upload className="w-4 h-4 text-emerald-600" />
            Item Photo <span className="text-slate-400 font-normal lowercase">(optional)</span>
          </h2>

          {imagePreview ? (
            <div className="relative w-full max-w-sm">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl border border-slate-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="imageUpload"
              className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-colors"
            >
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <p className="text-xs text-slate-600 font-medium">
                <span className="text-emerald-700 font-semibold">Click to upload photo</span> or drag &amp; drop
              </p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP up to 5 MB</p>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleImageUpload}
              />
            </label>
          )}
          {errors.imageUrl && <p className="text-rose-500 text-xs">{errors.imageUrl}</p>}
        </div>

        {/* ── Section 4: Finder Contact ── */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-emerald-600" />
            Finder&apos;s Contact Information
          </h2>

          {/* Finder Name */}
          <div data-error={!!errors.finderName}>
            <label className="form-label" htmlFor="finderName">
              Your Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="finderName"
                name="finderName"
                type="text"
                value={form.finderName}
                onChange={handleChange}
                placeholder="Full Name"
                className={`form-input pl-10 ${errors.finderName ? 'border-rose-400 focus:ring-rose-400' : ''}`}
              />
            </div>
            {errors.finderName && <p className="text-rose-500 text-xs mt-1">{errors.finderName}</p>}
          </div>

          {/* Finder Contact */}
          <div data-error={!!errors.finderContact}>
            <label className="form-label" htmlFor="finderContact">
              Contact (Email or Phone) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="finderContact"
                name="finderContact"
                type="text"
                value={form.finderContact}
                onChange={handleChange}
                placeholder="student.email@campus.edu.in or 98XXXXXXXX"
                className={`form-input pl-10 ${errors.finderContact ? 'border-rose-400 focus:ring-rose-400' : ''}`}
              />
            </div>
            {errors.finderContact && <p className="text-rose-500 text-xs mt-1">{errors.finderContact}</p>}
          </div>

          {/* Privacy note */}
          <div className="flex gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p>
              Your contact details are kept secure and shared only with campus security
              authorities during verified handover.
            </p>
          </div>
        </div>

        {/* ── Global Error ── */}
        {errors.submit && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {errors.submit}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex-1 justify-center py-3 text-sm disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit Found Item Report'}
          </button>
          <Link href="/found" className="btn-secondary flex-1 justify-center py-3 text-sm text-center">
            Cancel
          </Link>
        </div>

      </form>
    </div>
  )
}
