import Link from 'next/link'
import { MapPin, Shield, ArrowRight, BookOpen, Package, ClipboardCheck } from 'lucide-react'

// ─── Feature cards data ─────────────────────────────────────────────────────
const features = [
  {
    icon: BookOpen,
    title: 'Report Lost Item',
    description:
      'Missing something? Report your lost item so the campus community and security can help you find it.',
    href: '/lost',
    color: 'bg-rose-50 text-rose-600',
    btnColor: 'bg-rose-600 hover:bg-rose-700',
    label: 'View Lost Items',
  },
  {
    icon: Package,
    title: 'Report Found Item',
    description:
      'Found something on campus? Register it here so the rightful owner can reclaim it safely.',
    href: '/found',
    color: 'bg-emerald-50 text-emerald-600',
    btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    label: 'Browse Found Items',
  },
  {
    icon: ClipboardCheck,
    title: 'Submit a Claim',
    description:
      'See something that belongs to you? Submit a claim with proof of ownership for verification.',
    href: '/claims',
    color: 'bg-indigo-50 text-indigo-600',
    btnColor: 'bg-indigo-600 hover:bg-indigo-700',
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
  { step: '01', title: 'Report', description: 'File a lost or found item report with photos and location details.' },
  { step: '02', title: 'Match',  description: 'Our campus system cross-references lost and found listings.' },
  { step: '03', title: 'Claim',  description: 'Submit an ownership claim and verify details with security.' },
  { step: '04', title: 'Collect', description: 'Coordinate safe handover with campus authorities.' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-20 md:py-28">
        {/* Subtle background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-80 h-80 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-600 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-300 mb-6 border border-white/10">
            <Shield className="w-3.5 h-3.5" />
            Official Campus Security Service
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white leading-tight">
            Lost Something on <span className="text-emerald-400">Campus?</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Campus Lost &amp; Found connects students, finders, and security
            to make item recovery fast, transparent, and hassle-free.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <Link
              href="/found"
              className="btn-primary text-base px-7 py-3"
            >
              Browse Found Items
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/found/add"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-base transition-all"
            >
              Report a Found Item
            </Link>
          </div>

          {/* Campus location badge */}
          <div className="mt-10 flex items-center justify-center gap-1.5 text-slate-400 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Serving a 600-acre university campus</span>
          </div>
        </div>
      </section>

      {/* ════════════════════ STATS ════════════════════ */}
      <section className="bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">{s.value}</div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ FEATURE CARDS ════════════════════ */}
      <section className="py-16 bg-slate-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">What Would You Like To Do?</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Our platform connects finders, owners, and verification authorities across three distinct services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="card card-hover flex flex-col p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${f.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">{f.description}</p>
                  <Link
                    href={f.href}
                    className={`btn-primary justify-center ${f.btnColor}`}
                  >
                    {f.label}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════ HOW IT WORKS ════════════════════ */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">How It Works</h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              A simple four-step process to recover your lost belongings safely.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative text-center p-6 bg-slate-50/70 rounded-xl border border-slate-200/70">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-1 text-base">{s.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════ BOTTOM CTA ════════════════════ */}
      <section className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Found Something on Campus?</h2>
          <p className="text-slate-300 text-sm mb-8 max-w-lg mx-auto">
            Help your fellow students by registering found belongings. The campus community thanks you.
          </p>
          <Link href="/found/add" className="btn-primary text-base px-8 py-3">
            Report a Found Item
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  )
}
