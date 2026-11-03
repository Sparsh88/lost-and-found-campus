import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-12 pb-12">
      
      <section className="bg-midnightNavy text-white py-16 sm:py-20 px-4 text-center border-b border-white/10">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="bg-white/10 text-slate-200 text-xs px-3 py-1 rounded-full font-medium inline-block border border-white/20">
            600-Acre Campus System
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Campus Lost &amp; Found
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            Easily report lost items, register found belongings, and claim your missing items with campus security.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link
              href="/lost"
              className="bg-crimsonRed hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              Lost Items
            </Link>
            <Link
              href="/found"
              className="bg-electricBlue hover:bg-electricBlue-hover text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              Found Items
            </Link>
            <Link
              href="/claims"
              className="bg-forestGreen hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-sm"
            >
              Claim &amp; Verify
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-charcoal text-center mb-6">
          Project Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-softSand p-6 rounded-xl border border-lightGray shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-crimsonRed bg-red-100/70 border border-red-200 px-2.5 py-1 rounded-md inline-block mb-3">
                Module 1
              </div>
              <h3 className="text-lg font-bold text-charcoal mb-2">Lost Item Service</h3>
              <p className="text-sm text-slateGray mb-4">
                Students can report their lost belongings and search through existing lost-item reports.
              </p>
            </div>
            <Link
              href="/lost"
              className="text-brightAzure hover:text-electricBlue font-semibold text-sm hover:underline"
            >
              Go to Lost Items →
            </Link>
          </div>

          <div className="bg-softSand p-6 rounded-xl border border-lightGray shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-electricBlue bg-blue-100/70 border border-blue-200 px-2.5 py-1 rounded-md inline-block mb-3">
                Module 2
              </div>
              <h3 className="text-lg font-bold text-charcoal mb-2">Found Item Service</h3>
              <p className="text-sm text-slateGray mb-4">
                Register items found on campus, filter by category or location, and track handover custody.
              </p>
            </div>
            <Link
              href="/found"
              className="text-brightAzure hover:text-electricBlue font-semibold text-sm hover:underline"
            >
              Go to Found Items →
            </Link>
          </div>

          <div className="bg-softSand p-6 rounded-xl border border-lightGray shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-forestGreen bg-green-100/70 border border-green-200 px-2.5 py-1 rounded-md inline-block mb-3">
                Module 3
              </div>
              <h3 className="text-lg font-bold text-charcoal mb-2">Claim &amp; Verification</h3>
              <p className="text-sm text-slateGray mb-4">
                Submit claims with ownership proof, verified by campus authorities before handover.
              </p>
            </div>
            <Link
              href="/claims"
              className="text-brightAzure hover:text-electricBlue font-semibold text-sm hover:underline"
            >
              Go to Claims →
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-softSand rounded-2xl border border-lightGray p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-charcoal mb-4 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center text-sm">
            <div className="bg-warmWhite border border-lightGray p-4 rounded-xl shadow-sm">
              <div className="font-bold text-electricBlue text-lg mb-1">1</div>
              <p className="font-semibold text-charcoal">Find or Lose</p>
              <p className="text-slateGray text-xs mt-1">Item is found or lost on campus.</p>
            </div>
            <div className="bg-warmWhite border border-lightGray p-4 rounded-xl shadow-sm">
              <div className="font-bold text-electricBlue text-lg mb-1">2</div>
              <p className="font-semibold text-charcoal">Report</p>
              <p className="text-slateGray text-xs mt-1">Register details with image &amp; location.</p>
            </div>
            <div className="bg-warmWhite border border-lightGray p-4 rounded-xl shadow-sm">
              <div className="font-bold text-electricBlue text-lg mb-1">3</div>
              <p className="font-semibold text-charcoal">Verify</p>
              <p className="text-slateGray text-xs mt-1">Owner claims item with security proof.</p>
            </div>
            <div className="bg-warmWhite border border-lightGray p-4 rounded-xl shadow-sm">
              <div className="font-bold text-electricBlue text-lg mb-1">4</div>
              <p className="font-semibold text-charcoal">Handover</p>
              <p className="text-slateGray text-xs mt-1">Item is returned safely to owner.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
