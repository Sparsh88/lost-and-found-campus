import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-midnightNavy text-slate-300 py-10 mt-auto border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-base mb-2">Campus Lost &amp; Found</h3>
          <p className="text-sm text-slate-400">
            A college web project designed to help students and security staff reunite lost items with their owners across our 600-acre campus.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
          <ul className="space-y-1.5 text-sm text-slate-400">
            <li><Link href="/lost" className="hover:text-brightAzure transition">Lost Items</Link></li>
            <li><Link href="/found" className="hover:text-brightAzure transition">Found Items</Link></li>
            <li><Link href="/admin/login" className="hover:text-brightAzure transition">Staff Portal &amp; Admin Desk</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Campus Contact</h4>
          <p className="text-sm text-slate-400">Email: info@lpu.co.in</p>
          <p className="text-sm text-slate-400">Campus Security Office: Block 29</p>
        </div>
      </div>

      <div className="border-t border-white/10 mt-8 pt-4 text-center text-xs text-slate-400">
        © 2026 Campus Lost and Found - Group Project
      </div>
    </footer>
  )
}
