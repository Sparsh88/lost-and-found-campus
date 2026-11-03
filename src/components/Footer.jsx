import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div>
          <h3 className="text-white font-bold text-base mb-2">Campus Lost &amp; Found</h3>
          <p className="text-sm text-gray-400">
            A college web project designed to help students and security staff reunite lost items with their owners across our 600-acre campus.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Project Modules</h4>
          <ul className="space-y-1 text-sm text-gray-400">
            <li><Link href="/lost" className="hover:text-white">Module 1: Lost Item Service</Link></li>
            <li><Link href="/found" className="hover:text-white">Module 2: Found Item Service</Link></li>
            <li><Link href="/claims" className="hover:text-white">Module 3: Claim &amp; Verification</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Campus Contact</h4>
          <p className="text-sm text-gray-400">Campus Security Office: Block 29</p>
          <p className="text-sm text-gray-400">Email: info@lpu.co.in</p>
        </div>

      </div>

      <div className="border-t border-gray-800 mt-8 pt-4 text-center text-xs text-gray-500">
        © 2026 Campus Lost &amp; Found - Group Project
      </div>
    </footer>
  )
}
