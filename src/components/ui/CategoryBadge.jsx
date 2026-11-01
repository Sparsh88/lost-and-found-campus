/**
 * components/ui/CategoryBadge.jsx
 * Coloured pill badge for item categories.
 */

const CATEGORY_COLORS = {
  'ID Card':    'bg-red-100 text-red-700',
  'Laptop':     'bg-indigo-100 text-indigo-700',
  'Mobile':     'bg-purple-100 text-purple-700',
  'Bottle':     'bg-cyan-100 text-cyan-700',
  'Documents':  'bg-orange-100 text-orange-700',
  'Bag':        'bg-amber-100 text-amber-700',
  'Wallet':     'bg-lime-100 text-lime-700',
  'Keys':       'bg-teal-100 text-teal-700',
  'Earphones':  'bg-pink-100 text-pink-700',
  'Charger':    'bg-blue-100 text-blue-700',
  'Umbrella':   'bg-sky-100 text-sky-700',
  'Other':      'bg-gray-100 text-gray-700',
}

/**
 * @param {{ category: string }} props
 */
export default function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-700'
  return (
    <span className={`badge text-xs font-semibold ${color}`}>
      {category}
    </span>
  )
}

