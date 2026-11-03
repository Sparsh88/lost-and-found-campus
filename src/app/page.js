import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-12 pb-12">
      
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="bg-blue-700 text-blue-100 text-xs px-3 py-1 rounded-full font-medium inline-block">
            600-Acre Campus System
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold">
            Campus Lost &amp; Found
          </h1>
          <p className="text-blue-100 text-base sm:text-lg">
            Easily report lost items, register found belongings, and claim your missing items with campus security.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link
              href="/found"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-6 py-2.5 rounded-lg text-sm transition"
            >
              Browse Found Items
            </Link>
            <Link
              href="/found/add"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-6 py-2.5 rounded-lg text-sm transition"
            >
              Report a Found Item
            </Link>
          </div>
        </div>
      </section>

      {/* Modules Overview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Project Modules
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded inline-block mb-3">
                Module 1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Lost Item Service</h3>
              <p className="text-sm text-gray-600 mb-4">
                Students can report their lost belongings and search through existing lost-item reports.
              </p>
            </div>
            <Link
              href="/lost"
              className="text-blue-600 font-semibold text-sm hover:underline"
            >
              Go to Lost Items →
            </Link>
          </div>

          {/* Module 2 */}
          <div className="bg-white p-6 rounded-xl border-2 border-blue-500 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-3">
                Module 2 (Our Service)
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Found Item Service</h3>
              <p className="text-sm text-gray-600 mb-4">
                Register items found on campus, filter by category or location, and track handover custody.
              </p>
            </div>
            <Link
              href="/found"
              className="bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
            >
              Browse Found Items →
            </Link>
          </div>

          {/* Module 3 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded inline-block mb-3">
                Module 3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Claim &amp; Verification</h3>
              <p className="text-sm text-gray-600 mb-4">
                Submit claims with ownership proof, verified by campus authorities before handover.
              </p>
            </div>
            <Link
              href="/claims"
              className="text-blue-600 font-semibold text-sm hover:underline"
            >
              Go to Claims →
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-gray-100 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center text-sm">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-bold text-blue-600 text-lg mb-1">1</div>
              <p className="font-semibold text-gray-800">Find or Lose</p>
              <p className="text-gray-500 text-xs mt-1">Item is found or lost on campus.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-bold text-blue-600 text-lg mb-1">2</div>
              <p className="font-semibold text-gray-800">Report</p>
              <p className="text-gray-500 text-xs mt-1">Register details with image &amp; location.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-bold text-blue-600 text-lg mb-1">3</div>
              <p className="font-semibold text-gray-800">Verify</p>
              <p className="text-gray-500 text-xs mt-1">Owner claims item with security proof.</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="font-bold text-blue-600 text-lg mb-1">4</div>
              <p className="font-semibold text-gray-800">Handover</p>
              <p className="text-gray-500 text-xs mt-1">Item is returned safely to owner.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
