import Link from 'next/link'
import connectDB from '@/lib/mongodb'
import LostItem from '@/models/LostItem'
import FoundItem from '@/models/FoundItem'
import Handover from '@/models/Handover'
import CategoryBadge from '@/components/ui/CategoryBadge'
import StatusBadge from '@/components/ui/StatusBadge'
import FoundItemCard from '@/components/ui/FoundItemCard'
import { CAMPUS_LOCATIONS } from '@/lib/constants'
import { resolveItemImage } from '@/lib/itemImages'
import HomeHeroActions from '@/components/HomeHeroActions'
import HomeServicesSection from '@/components/HomeServicesSection'

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
      lostStats,
      foundStats,
      handoverCount,
      recentLostDocs,
      recentFoundDocs,
    ] = await Promise.all([
      LostItem.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      FoundItem.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Handover.countDocuments(),
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

    const lostCounts = {}
    let totalLost = 0
    for (const s of lostStats) {
      lostCounts[s._id] = s.count
      totalLost += s.count
    }

    const foundCounts = {}
    let totalFound = 0
    for (const s of foundStats) {
      foundCounts[s._id] = s.count
      totalFound += s.count
    }

    const activeLost = lostCounts['ACTIVE'] || 0
    const returnedLost = lostCounts['RETURNED'] || 0
    const availableFound = foundCounts['AVAILABLE'] || 0
    const returnedFound = foundCounts['RETURNED'] || 0
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
        imageUrl: resolveItemImage(item.itemName, item.category, item.imageUrl),
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
        imageUrl: resolveItemImage(item.itemName, item.category, item.imageUrl),
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
      <section className="relative overflow-hidden min-h-[420px] sm:min-h-[480px] lg:min-h-[520px] flex items-center justify-center py-14 sm:py-20 px-4 text-center border-b border-lightGray bg-midnightNavy">
        <img
          src="/images/lpu-campus.jpg"
          alt="Lovely Professional University 600-Acre Campus"
          className="absolute inset-0 w-full h-full object-cover object-[center_60%] brightness-[0.92] contrast-[1.05]"
          priority="true"
          loading="eager"
        />
        {/* Balanced overlay that shows the beautiful campus & university sign while giving crystal clear contrast for text */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/50 to-slate-950/75 backdrop-blur-[0.5px]"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto space-y-4 px-4 py-6 rounded-2xl bg-slate-900/40 backdrop-blur-sm border border-white/15 shadow-2xl">
          <span className="bg-white/95 text-charcoal text-xs sm:text-sm px-4 py-1.5 rounded-full font-semibold inline-block border border-white/80 shadow-md">
            Lovely Professional University · 600-Acre Campus System
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight [text-shadow:0_2px_14px_rgba(0,0,0,0.85)]">
            Campus Lost &amp; Found
          </h1>

          <p className="text-slate-100 text-base sm:text-lg max-w-2xl mx-auto font-medium [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
            Easily report lost items, register found belongings, and claim your missing items with campus security.
          </p>

          <HomeHeroActions />
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
            href="/found"
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
                    src={resolveItemImage(item.itemName, item.category, item.imageUrl)}
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

      {/* Campus Services — Clean section right above footer */}
      <HomeServicesSection />
    </div>
  )
}
