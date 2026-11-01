/**
 * components/ui/CategoryBadge.jsx
 * Clean, subtle pill badge for item categories.
 */

const CATEGORY_COLORS = {
  'ID Card':    'bg-rose-50 text-rose-700 border border-rose-200/80',
  'Laptop':     'bg-slate-100 text-slate-800 border border-slate-200',
  'Mobile':     'bg-violet-50 text-violet-700 border border-violet-200/80',
  'Bottle':     'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
  'Documents':  'bg-amber-50 text-amber-700 border border-amber-200/80',
  'Bag':        'bg-orange-50 text-orange-700 border border-orange-200/80',
  'Wallet':     'bg-stone-100 text-stone-700 border border-stone-200',
  'Keys':       'bg-teal-50 text-teal-700 border border-teal-200/80',
  'Earphones':  'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/80',
  'Charger':    'bg-zinc-100 text-zinc-700 border border-zinc-200',
  'Umbrella':   'bg-sky-50 text-sky-700 border border-sky-200/80',
  'Other':      'bg-slate-100 text-slate-600 border border-slate-200',
}

/**
 * @param {{ category: string }} props
 */
export default function CategoryBadge({ category }) {
  const color = CATEGORY_COLORS[category] ?? 'bg-slate-100 text-slate-700 border border-slate-200'
  return (
    <span className={`badge text-[11px] font-medium ${color}`}>
      {category}
    </span>
  )
}
