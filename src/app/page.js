import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import Handover from '@/models/Handover'
import CategoryBadge from '@/components/ui/CategoryBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import FoundItemCard from '@/components/ui/FoundItemCard'
import { CAMPUS_LOCATIONS, DEFAULT_ITEM_IMAGE } from '@/lib/constants'

export const dynamic = 'force-dynamic'

async function getHomeData() {
  const fallback = {
    stats: {
      activeLost: 0,
      availableFound: 0,
      returnedItems: 0,
      totalReports: 0,
    },
    recentLost: [],
    recentFound: [],
  }

  try {
    await connectDB()

    const [
      activeLost,
      totalLost,
      availableFound,
      returnedFound,
      returnedLost,
      handoverCount,
      totalFound,
      recentLostDocs,
      recentFoundDocs,
    ] = await Promise.all([
      LostItem.countDocuments({ status: 'ACTIVE' }),
      LostItem.countDocuments(),
      FoundItem.countDocuments({ status: 'AVAILABLE' }),
      FoundItem.countDocuments({ status: 'RETURNED' }),
      LostItem.countDocuments({ status: 'RETURNED' }),
      Handover.countDocuments(),
      FoundItem.countDocuments(),
      LostItem.find({ status: 'ACTIVE' })
        .select('reportId itemName category description lostDate lostLocation imageUrl status createdAt')
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
      FoundItem.find({ status: 'AVAILABLE' })
        .select('foundId itemName category description foundDate foundTime foundLocation imageUrl custodyOffice shelfBin status finderName createdAt')
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ])

    const returnedItems = Math.max(handoverCount, returnedFound + returnedLost)

    return {
      stats: {
        activeLost,
        availableFound,
        returnedItems,
        totalReports: totalLost + totalFound,
      },
      recentLost: recentLostDocs.map((item) => ({
        id: item._id.toString(),
        reportId: item.reportId,
        itemName: item.itemName,
        category: item.category,
        description: item.description,
        lostDate: item.lostDate,
        lostLocation: item.lostLocation,
        imageUrl: item.imageUrl || DEFAULT_ITEM_IMAGE,
        status: item.status,
      })),
      recentFound: recentFoundDocs.map((item) => ({
        id: item._id.toString(),
        foundId: item.foundId,
        itemName: item.itemName,
        category: item.category,
        description: item.description,
        foundDate: item.foundDate,
        foundTime: item.foundTime || '',
        foundLocation: item.foundLocation,
        imageUrl: item.imageUrl || DEFAULT_ITEM_IMAGE,
        status: item.status,
        finderName: item.finderName,
        isFinderOwner: false,
      })),
    }
  } catch {
    return fallback
  }
}

export default async function HomePage() {
  const { stats, recentLost, recentFound } = await getHomeData()
  const keyCampusZones = CAMPUS_LOCATIONS.filter((loc) => loc !== 'Other').slice(0, 8)

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner with LPU Campus Background */}
      <section className="relative overflow-hidden min-h-[400px] sm:min-h-[460px] lg:min-h-[500px] flex items-center justify-center py-14 sm:py-20 px-4 text-center border-b border-lightGray bg-midnightNavy">
        <img
          src="/images/lpu-campus.jpg"
          alt="Lovely Professional University 600-Acre Campus"
          className="absolute inset-0 w-full h-full object-cover object-[center_62%]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-900/35 via-[#0B1F3A]/55 to-[#0B1F3A]/75"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <span className="bg-white/95 text-charcoal text-xs sm:text-sm px-4 py-1.5 rounded-full font-semibold inline-block border border-white/80 shadow-md">
            Lovely Professional University · 600-Acre Campus System
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight [text-shadow:0_2px_14px_rgba(0,0,0,0.7)]">
            Campus Lost &amp; Found
          </h1>

          <p className="text-slate-100 text-base sm:text-lg max-w-2xl mx-auto font-medium [text-shadow:0_1px_10px_rgba(0,0,0,0.8)]">
            Easily report lost items, register found belongings, and claim your missing items with campus security.
          </p>

          <div className="flex flex-wrap gap-3 justify-center pt-3">
            <Link
              href="/lost"
              className="bg-crimsonRed hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-lg ring-1 ring-white/25"
            >
              Lost Items
            </Link>
            <Link
              href="/found"
              className="bg-electricBlue hover:bg-electricBlue-hover text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-lg ring-1 ring-white/25"
            >
              Found Items
            </Link>
            <Link
              href="/claims"
              className="bg-forestGreen hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-lg ring-1 ring-white/25"
            >
              Claim &amp; Verify
            </Link>
          </div>
        </div>
      </section>

      {/* Live Campus Recovery Snapshot */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/lost"
            className="bg-softSand border border-lightGray rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs font-semibold text-crimsonRed uppercase tracking-wide">
              Active Lost Reports
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
              {stats.activeLost}
            </p>
            <p className="text-xs text-slateGray mt-1">
              Reported missing by students
            </p>
          </Link>

          <Link
            href="/found"
            className="bg-softSand border border-lightGray rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs font-semibold text-electricBlue uppercase tracking-wide">
              Available Found Items
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
              {stats.availableFound}
            </p>
            <p className="text-xs text-slateGray mt-1">
              Ready for verified claim
            </p>
          </Link>

          <Link
            href="/claims"
            className="bg-softSand border border-lightGray rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <p className="text-xs font-semibold text-forestGreen uppercase tracking-wide">
              Items Reunited
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
              {stats.returnedItems}
            </p>
            <p className="text-xs text-slateGray mt-1">
              Completed secure handovers
            </p>
          </Link>

          <div className="bg-softSand border border-lightGray rounded-xl p-5 shadow-sm">
            <p className="text-xs font-semibold text-midnightNavy uppercase tracking-wide">
              Total Reports Logged
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
              {stats.totalReports}
            </p>
            <p className="text-xs text-slateGray mt-1">
              Across Block 29 &amp; campus zones
            </p>
          </div>
        </div>
      </section>

      {/* Recently Found on Campus (Live Data) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-charcoal">
              Recently Found on Campus
            </h2>
            <p className="text-sm text-slateGray mt-0.5">
              Items turned in across campus blocks and held securely for rightful owners.
            </p>
          </div>
          <Link
            href="/found"
            className="text-sm font-semibold text-brightAzure hover:text-electricBlue hover:underline"
          >
            View All Found Items →
          </Link>
        </div>

        {recentFound.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentFound.map((item) => (
              <FoundItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-softSand border border-lightGray rounded-xl p-6 text-center text-sm text-slateGray">
            No found items currently awaiting claims.{' '}
            <Link href="/found/add" className="text-brightAzure font-semibold hover:underline">
              Report a found item →
            </Link>
          </div>
        )}
      </section>

      {/* Latest Lost Reports (Live Data) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold text-charcoal">
              Latest Lost Reports
            </h2>
            <p className="text-sm text-slateGray mt-0.5">
              Help fellow LPU students spot missing belongings and notify owners privately.
            </p>
          </div>
          <Link
            href="/lost"
            className="text-sm font-semibold text-brightAzure hover:text-electricBlue hover:underline"
          >
            View All Lost Items →
          </Link>
        </div>

        {recentLost.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentLost.map((item) => (
              <div
                key={item.id}
                className="bg-softSand rounded-xl shadow-sm border border-lightGray overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <img
                    src={item.imageUrl || DEFAULT_ITEM_IMAGE}
                    alt={item.itemName}
                    className="w-full h-44 object-cover"
                  />

                  <div className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <CategoryBadge category={item.category} />
                      <StatusBadge status={item.status} />
                    </div>

                    <h3 className="font-semibold text-charcoal text-base mb-1 truncate">
                      {item.itemName}
                    </h3>

                    <p className="text-slateGray text-sm line-clamp-2 mb-3">
                      {item.description}
                    </p>

                    <div className="text-xs text-slateGray space-y-1 mb-3">
                      <p>📍 {item.lostLocation}</p>
                      <p>📅 Lost on: {item.lostDate}</p>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <Link
                    href={`/lost/${item.id}`}
                    className="block w-full text-center bg-electricBlue hover:bg-electricBlue-hover text-white text-sm font-medium py-2 rounded-lg transition shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-softSand border border-lightGray rounded-xl p-6 text-center text-sm text-slateGray">
            No active lost reports at the moment.{' '}
            <Link href="/lost/add" className="text-brightAzure font-semibold hover:underline">
              Submit a lost report →
            </Link>
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
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

      {/* LPU Campus Custody Desk & Active Zones */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-softSand rounded-2xl border border-lightGray p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-electricBlue bg-blue-100/70 border border-blue-200 px-2.5 py-1 rounded-md inline-block">
              Campus Security Helpdesk
            </span>
            <h2 className="text-xl font-bold text-charcoal">
              LPU Central Lost &amp; Found Office
            </h2>
            <p className="text-sm text-slateGray">
              Verified items are stored at the Campus Security Desk (Block 29). Approved claimants must carry their university ID card along with the 6-digit handover OTP.
            </p>
            <div className="text-xs text-charcoal space-y-1.5 pt-1">
              <p><span className="font-semibold">Location:</span> Campus Security Control Room, Block 29</p>
              <p><span className="font-semibold">Helpdesk Hours:</span> Monday – Sunday, 9:00 AM – 7:00 PM</p>
              <p><span className="font-semibold">Support Email:</span> info@lpu.co.in</p>
            </div>
          </div>

          <div className="bg-warmWhite border border-lightGray rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-charcoal">
              Monitored Campus Zones
            </h3>
            <div className="flex flex-wrap gap-2">
              {keyCampusZones.map((zone) => (
                <span
                  key={zone}
                  className="text-xs font-medium bg-white border border-lightGray text-slateGray px-2.5 py-1 rounded-full"
                >
                  📍 {zone}
                </span>
              ))}
            </div>
            <div className="pt-1 flex flex-wrap gap-3 text-xs font-semibold">
              <Link href="/lost/add" className="text-crimsonRed hover:underline">
                + Report a Lost Item
              </Link>
              <Link href="/found/add" className="text-electricBlue hover:underline">
                + Register a Found Item
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Project Modules — Bottom Section Right Above Footer */}
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
    </div>
  )
}
