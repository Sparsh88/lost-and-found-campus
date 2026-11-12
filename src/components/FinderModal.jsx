'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function FinderModal({ lostItem, isOpen, onClose, onSuccess }) {
  const [user, setUser] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [finderName, setFinderName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [mobileNumber, setMobileNumber] = useState('')
  const [message, setMessage] = useState('')
  const [photoFileId, setPhotoFileId] = useState('')
  const [photoFileName, setPhotoFileName] = useState('')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setError('')
    setSuccessMsg('')
    setCheckingAuth(true)

    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        if (data.user) {
          setUser(data.user)
          setFinderName(data.user.name || '')
          setRegistrationNumber(data.user.registrationNumber || data.user.studentId || '')
          setMobileNumber(data.user.phone || '')
        } else {
          setUser(null)
        }
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setCheckingAuth(false)
      })

    return () => {
      active = false
    }
  }, [isOpen])

  if (!isOpen || !lostItem) return null

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploadingPhoto(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('purpose', 'finder_photo')

      const res = await fetch('/api/uploads/private', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to upload photograph.')
      } else {
        setPhotoFileId(data.file.fileId)
        setPhotoFileName(data.file.originalName)
      }
    } catch {
      setError('Failed to upload photograph. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!finderName.trim() || !registrationNumber.trim() || !mobileNumber.trim() || !message.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/lost-items/${lostItem.id}/finder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          finderName: finderName.trim(),
          registrationNumber: registrationNumber.trim(),
          mobileNumber: mobileNumber.trim(),
          message: message.trim(),
          photoFileId,
          photoFileName,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to submit finder details.')
        setSubmitting(false)
        return
      }

      setSuccessMsg(data.message || 'Finder report sent privately to the owner!')
      window.dispatchEvent(new Event('notificationsUpdated'))
      if (onSuccess) onSuccess(data)
      setTimeout(() => {
        onClose()
      }, 1400)
    } catch {
      setError('Unable to reach server. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl p-6 shadow-2xl border border-lightGray space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-lightGray pb-3">
          <div>
            <h3 className="font-bold text-charcoal text-lg">I Found This Item</h3>
            <p className="text-xs text-slateGray">
              Report: {lostItem.itemName} ({lostItem.reportId})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slateGray hover:text-charcoal text-xl p-1"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {checkingAuth ? (
          <div className="py-8 text-center text-sm text-slateGray">
            Verifying your campus session...
          </div>
        ) : !user ? (
          <div className="bg-softSand border border-lightGray rounded-xl p-5 text-center space-y-3">
            <p className="text-sm font-semibold text-charcoal">Student Sign-In Required</p>
            <p className="text-xs text-slateGray">
              Please sign in with your campus account so the owner can securely receive your contact details.
            </p>
            <Link
              href="/login"
              className="inline-block bg-electricBlue hover:bg-electricBlue-hover text-white text-xs font-semibold px-5 py-2 rounded-lg transition shadow-sm"
            >
              Sign In to Continue →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-crimsonRed text-xs p-3 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-forestGreen text-xs p-3 rounded-lg">
                ✓ {successMsg}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-[11px] text-slateGray">
              🔒 Your registration number and mobile number are shared <strong>privately</strong> only with the report owner and campus administrators.
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Finder&apos;s Full Name *
              </label>
              <input
                type="text"
                required
                value={finderName}
                onChange={(e) => setFinderName(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Message / Where You Found It *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Share where and when you found this item and where the owner can meet or collect it..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-warmWhite border border-lightGray rounded-lg px-3 py-2 text-xs text-charcoal focus:ring-1 focus:ring-skyBlue focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Found-Item Photograph (Optional, Private)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="w-full text-xs text-slateGray file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-lightGray file:text-xs file:font-semibold file:bg-warmWhite file:text-charcoal hover:file:bg-softSand"
              />
              {uploadingPhoto && (
                <p className="text-[11px] text-brightAzure mt-1">Uploading photograph securely...</p>
              )}
              {photoFileName && (
                <p className="text-[11px] text-forestGreen mt-1">✓ Attached: {photoFileName}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting || uploadingPhoto}
                className="flex-1 bg-electricBlue hover:bg-electricBlue-hover disabled:opacity-60 text-white font-medium py-2 rounded-lg text-xs transition shadow-sm"
              >
                {submitting ? 'Sending Notification...' : 'Send Finder Details Privately'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-lightGray rounded-lg text-xs text-charcoal hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
