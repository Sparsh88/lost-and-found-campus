import Link from 'next/link'
import { Search, MapPin, Shield, ArrowRight, BookOpen, Package, ClipboardCheck } from 'lucide-react'

// ─── Feature cards data ─────────────────────────────────────────────────────
const features = [
  {
    icon: BookOpen,
    title: 'Report Lost Item',
    description:
      'Missing something? Report your lost item so the campus community can help you find it.',
    href: '/lost',
    color: 'bg-red-50 text-red-600',
    btnColor: 'bg-red-600 hover:bg-red-700',
    label: 'View Lost Items',
  },
  {
    icon: Package,
    title: 'Report Found Item',
    description:
      'Found something on campus? Register it here so the rightful owner can reclaim it.',
    href: '/found',
    color: 'bg-blue-50 text-blue-600',
    btnColor: 'bg-blue-700 hover:bg-blue-800',
    label: 'Browse Found Items',
  },
  {
    icon: ClipboardCheck,
    title: 'Submit a Claim',
    description:
      'See something that belongs to you? Submit a claim and verify your ownership.',
    href: '/claims',
    color: 'bg-green-50 text-green-600',
    btnColor: 'bg-green-600 hover:bg-green-700',
    label: 'View Claims',
  },
]

// ─── Stats data ─────────────────────────────────────────────────────────────
const stats = [
  { value: '320+', label: 'Items Recovered' },
  { value: '95%',  label: 'Return Rate' },
  { value: '600',  label: 'Acre Campus' },
  { value: '24/7', label: 'System Access' },
]

// ─── How it works steps ──────────────────────────────────────────────────────
const steps = [
  { step: '01', title: 'Report', description: 'File a lost or found item report with photos and details.' },
  { step: '02', title: 'Match',  description: 'Our system cross-references lost and found listings.' },
  { step: '03', title: 'Claim',  description: 'Submit a claim and verify your ownership securely.' },
  { step: '04', title: 'Collect', description: 'Coordinate with campus security for item handover.' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        {/* decorative circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          {/* badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium text-blue-100 mb-6 border border-white/20">
            <Shield className="w-4 h-4" />
            Campus Security System
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Lost Something on{' '}
            <span className="text-yellow-400">Campus?</span>
          </h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Campus Lost &amp; Found connects students, finders, and campus security
            to make item recovery fast, easy, and reliable.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/found"
              className="btn-primary bg-yellow-400 hover:bg-yellow-300 text-blue-900 text-base px-8 py-3"
            >
              Browse Found Items
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/found/add"
              className="btn-secondary border-white text-white hover:bg-white/10 text-base px-8 py-3"
            >
              Report a Found Item
            </Link>
          </div>

          {/* campus badge */}
          <div className="mt-12 flex items-center justify-center gap-2 text-blue-200 text-sm">
            <MapPin className="w-4 h-4" />
            <span>Serving a 600-acre university campus</span>
          </div>
        </div>
      </section>

      {/* ════════════════════ STATS ════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-1">{s.value}</div>
                <div className="text-sm text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FEATURE CARDS ════════════════════ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What Would You Like To Do?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Our platform is built around three simple modules. Jump right in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="card card-hover flex flex-col">
                  <div className="p-6 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                  </div>
                  <div className="px-6 pb-6">
                    <Link
                      href={f.href}
                      className={`btn-primary w-full justify-center ${f.btnColor} text-white border-0`}
                    >
                      {f.label}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════ HOW IT WORKS ════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              A simple four-step process to recover your belongings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center p-6">
                {/* connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-0.5 bg-blue-100 z-0" />
                )}
                <div className="relative z-10 w-14 h-14 rounded-full bg-blue-700 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-4 shadow-md">
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ BOTTOM CTA ════════════════════ */}
      <section className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Found Something on Campus?</h2>
          <p className="text-blue-100 mb-8">
            Be a campus hero — register found items and help reunite belongings with their owners.
          </p>
          <Link href="/found/add" className="btn-primary bg-yellow-400 hover:bg-yellow-300 text-blue-900 text-base px-10 py-3">
            Report a Found Item
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  )
}

