export default function StatusBadge({ status }) {
  let color = 'bg-slate-100 text-slateGray border border-lightGray'

  if (status === 'Pending') {
    color = 'bg-amber-50 text-amberOrange border border-amber-200'
  } else if (status === 'Claimed') {
    color = 'bg-blue-50 text-brightAzure border border-blue-200'
  } else if (status === 'Verified') {
    color = 'bg-sky-50 text-skyBlue border border-sky-200'
  } else if (status === 'Handed Over') {
    color = 'bg-emerald-50 text-forestGreen border border-emerald-200'
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {status}
    </span>
  )
}
