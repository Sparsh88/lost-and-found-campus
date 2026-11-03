import Link from 'next/link'

export default function ClaimsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-softSand p-8 rounded-xl border border-lightGray shadow-sm space-y-4">
        <span className="text-xs bg-green-100/80 text-forestGreen border border-green-200 px-3 py-1 rounded-full font-semibold inline-block">
          Module 3
        </span>
        <h1 className="text-2xl font-bold text-charcoal">Claim &amp; Verification Service</h1>
        <p className="text-slateGray text-sm">
          Students can submit ownership proof and claims verified by campus authorities before item handover.
        </p>
        <div className="pt-2">
          <Link
            href="/found"
            className="inline-block bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-sm"
          >
            Go to Found Items
          </Link>
        </div>
      </div>
    </div>
  )
}
