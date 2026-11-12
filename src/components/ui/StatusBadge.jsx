import { formatStatusLabel } from '@/lib/constants'

export default function StatusBadge({ status }) {
  let color = 'bg-slate-100 text-slateGray border border-lightGray'

  if (status === 'PENDING' || status === 'Pending' || status === 'NEW') {
    color = 'bg-amber-50 text-amberOrange border border-amber-200'
  } else if (status === 'ADDITIONAL_INFO_REQUESTED') {
    color = 'bg-amber-50 text-amberOrange border border-amber-300'
  } else if (status === 'AVAILABLE' || status === 'ACTIVE') {
    color = 'bg-blue-50 text-brightAzure border border-blue-200'
  } else if (status === 'RESERVED_FOR_HANDOVER' || status === 'Claimed' || status === 'Verified') {
    color = 'bg-sky-50 text-skyBlue border border-sky-200'
  } else if (
    status === 'APPROVED' ||
    status === 'Approved' ||
    status === 'RETURNED' ||
    status === 'COMPLETED' ||
    status === 'Handed Over' ||
    status === 'RESOLVED'
  ) {
    color = 'bg-emerald-50 text-forestGreen border border-emerald-200'
  } else if (status === 'REJECTED' || status === 'Rejected' || status === 'Lost') {
    color = 'bg-red-50 text-crimsonRed border border-red-200'
  } else if (status === 'CLOSED' || status === 'Closed' || status === 'VIEWED') {
    color = 'bg-slate-100 text-slateGray border border-lightGray'
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${color}`}>
      {formatStatusLabel(status)}
    </span>
  )
}
