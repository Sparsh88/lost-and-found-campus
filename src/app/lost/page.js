import Link from 'next/link'

export default function LostPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
          Module 1
        </span>
        <h1 className="text-2xl font-bold text-gray-900">Lost Item Service</h1>
        <p className="text-gray-600 text-sm">
          Students can report lost belongings and search through active lost-item reports across campus.
        </p>
        <div className="pt-2">
          <Link
            href="/found"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Go to Found Items
          </Link>
        </div>
      </div>
    </div>
  )
}
