export default function CategoryBadge({ category }) {
  return (
    <span className="bg-white/80 text-brightAzure border border-lightGray px-2.5 py-0.5 rounded-full text-xs font-semibold">
      {category}
    </span>
  )
}
