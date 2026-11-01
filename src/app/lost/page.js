/**
 * app/lost/page.js  –  Module 1: Lost Item Service
 * ─────────────────────────────────────────────────────────────────
 * Owned by: Teammate 1
 * This is a placeholder page. Teammate 1 should implement this
 * module on the `module-1-lost` branch.
 * ─────────────────────────────────────────────────────────────────
 */
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Lost Items – Campus Lost & Found',
}

export default function LostItemsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Lost Item Service</h1>
        <p className="text-gray-500 mb-2">
          <strong>Module 1</strong> — Lost Item Service is under development.
        </p>
        <p className="text-gray-400 text-sm mb-8">
          This section is owned by <strong>Teammate 1</strong>. It will allow students
          to report lost items, search existing lost-item reports, and view item details.
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

