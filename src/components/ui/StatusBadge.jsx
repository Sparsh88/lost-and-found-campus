/**
 * components/ui/StatusBadge.jsx
 * Reusable status badge for found items.
 */

const STATUS_STYLES = {
  'Pending':     'bg-yellow-100 text-yellow-800 border border-yellow-200',
  'Claimed':     'bg-blue-100 text-blue-800 border border-blue-200',
  'Verified':    'bg-purple-100 text-purple-800 border border-purple-200',
  'Handed Over': 'bg-green-100 text-green-800 border border-green-200',
}

/**
 * @param {{ status: string }} props
 */
export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700 border border-gray-200'
  return (
    <span className={`badge text-xs font-semibold ${style}`}>
      {status}
    </span>
  )
}

