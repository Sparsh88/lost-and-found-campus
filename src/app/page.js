import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-12 pb-12">
      
      <section className="bg-blue-800 text-white py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="bg-blue-700 text-blue-100 text-xs px-3 py-1 rounded-full font-medium inline-block">
            600-Acre Campus System
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold">
            Campus Lost &amp; Found
          </h1>
          <p className="text-blue-100 text-base sm:text-lg">
            A unified system connecting students, finders, and campus security across all three modules.
          </p>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            <Link
              href="/lost"
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition"
            >
              Report Lost Item
            </Link>
            <Link
              href="/found"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition"
            >
              Browse Found Items
            </Link>
            <Link
              href="/claims"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition"
            >
              Claim an Item
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Project Modules
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Explore the three independent modules of our campus management system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full inline-block mb-3">
                Module 1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Lost Item Service</h3>
              <p className="text-sm text-gray-600 mb-4">
                Students can report their lost belongings, search existing lost-item reports, and view detailed records.
              </p>
            </div>
            <Link
              href="/lost"
              className="text-blue-600 font-semibold text-sm hover:underline"
            >
              Go to Lost Items →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full inline-block mb-3">
                Module 2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Found Item Service</h3>
              <p className="text-sm text-gray-600 mb-4">
                Register items found on campus with photos, filter by category or location, and track custody handovers.
              </p>
            </div>
            <Link
              href="/found"
              className="text-blue-600 font-semibold text-sm hover:underline"
            >
              Go to Found Items →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full inline-block mb-3">
                Module 3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Claim &amp; Verification</h3>
              <p className="text-sm text-gray-600 mb-4">
                Submit claims with ownership proof, verified by campus authorities before items are safely handed over.
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

      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
            How The 3-Module System Works
          </h2>
          <p className="text-gray-500 text-sm text-center mb-6">
            End-to-end workflow from losing an item to verified security handover
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center text-sm">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="font-bold text-red-600 text-lg mb-1">1</div>
              <p className="font-semibold text-gray-800">Report Lost</p>
              <p className="text-gray-500 text-xs mt-1">Student logs missing belongings with location and time.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="font-bold text-blue-600 text-lg mb-1">2</div>
              <p className="font-semibold text-gray-800">Register Found</p>
              <p className="text-gray-500 text-xs mt-1">Finder submits found item details, photos, and drop-off info.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="font-bold text-yellow-600 text-lg mb-1">3</div>
              <p className="font-semibold text-gray-800">Claim &amp; Verify</p>
              <p className="text-gray-500 text-xs mt-1">Owner submits proof of ownership for verification.</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="font-bold text-green-600 text-lg mb-1">4</div>
              <p className="font-semibold text-gray-800">Security Handover</p>
              <p className="text-gray-500 text-xs mt-1">Authorities approve claim and return item at Block 29.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-blue-900">Campus Security Office — Block 29</h3>
            <p className="text-sm text-blue-700 mt-1">
              Found valuable items, ID cards, electronics, and documents can be handed over to security at Block 29.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
            >
              View System Dashboard
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
