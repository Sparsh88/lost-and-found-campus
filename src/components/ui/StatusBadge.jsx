/**
 * components/ui/StatusBadge.jsx
 * Reusable status badge for found items.
 */

const STATUS_STYLES = {
  'Pending':     'bg-amber-50 text-amber-700 border border-amber-200',
  'Claimed':     'bg-slate-100 text-slate-700 border border-slate-200',
  'Verified':    'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'Handed Over': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

/**
 * @param {{ status: string }} props
 */
export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-700 border border-slate-200'
  return (
    <span className={`badge text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style}`}>
      {status}
    </span>
  )
}
