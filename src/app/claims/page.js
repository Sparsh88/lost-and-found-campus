/**
 * app/claims/page.js  –  Module 3: Claim & Verification Service
 * ─────────────────────────────────────────────────────────────────
 * Owned by: Teammate 3
 * This is a placeholder page. Teammate 3 should implement this
 * module on the `module-3-claims` branch.
 * ─────────────────────────────────────────────────────────────────
 */
import Link from 'next/link'
import { ClipboardCheck, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Claims & Verification – Campus Lost & Found',
}

export default function ClaimsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <ClipboardCheck className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Claim &amp; Verification Service</h1>
        <p className="text-gray-500 mb-2">
          <strong>Module 3</strong> — Claim &amp; Verification Service is under development.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          This section is owned by <strong>Teammate 3</strong>. It will allow students
          to submit ownership claims, verify claims with supporting details, and allow
          authorities to approve or reject claims before handing over items.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-secondary">
            ← Back to Home
          </Link>
          <Link href="/found" className="btn-primary">
            Browse Found Items
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

