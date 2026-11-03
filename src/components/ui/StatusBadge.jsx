export default function StatusBadge({ status }) {
  let color = 'bg-gray-100 text-gray-700'

  if (status === 'Pending') {
    color = 'bg-yellow-100 text-yellow-800'
  } else if (status === 'Claimed') {
    color = 'bg-blue-100 text-blue-800'
  } else if (status === 'Verified') {
    color = 'bg-purple-100 text-purple-800'
  } else if (status === 'Handed Over') {
    color = 'bg-green-100 text-green-800'
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {status}
    </span>
  )
}
