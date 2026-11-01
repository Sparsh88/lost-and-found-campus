import Link from 'next/link'
import { Shield, MapPin, Mail, Phone, ExternalLink } from 'lucide-react'

const quickLinks = [
  { label: 'Report Lost Item',  href: '/lost' },
  { label: 'Browse Found Items', href: '/found' },
  { label: 'Submit a Claim',    href: '/claims' },
  { label: 'Dashboard',         href: '/dashboard' },
]

const moduleLinks = [
  { label: 'Lost Item Service',           href: '/lost' },
  { label: 'Found Item Service',          href: '/found' },
  { label: 'Claim & Verification Service', href: '/claims' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* ─── Main Footer ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-white">Campus Lost &amp; Found</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Connecting students, finders, and campus security authorities across
              a 600-acre university campus.
            </p>
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
              University Campus, India
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Modules */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Modules</h3>
            <ul className="space-y-2.5">
              {moduleLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact Security</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                Campus Security: 1800-XXX-XXXX
              </li>
              <li className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                security@campus.edu.in
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {year} Campus Lost &amp; Found — Group Project P04. All rights reserved.</span>
          <span>Built with Next.js · React · Tailwind CSS · Node.js · MongoDB</span>
        </div>
      </div>
    </footer>
  )
}

