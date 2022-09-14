import { Link } from 'react-router-dom'
import { getMediaUrl } from '../../lib/apiClient'

const TYPE_STYLES = {
  LOST: 'bg-red-100 text-red-700',
  FOUND: 'bg-emerald-100 text-emerald-700',
}

export function ItemCard({ item }) {
  const thumbnail = item.images?.[0]

  return (
    <Link
      to={`/items/${item.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-300 hover:shadow-sm"
    >
      {thumbnail && (
        <img
          src={getMediaUrl(thumbnail.thumbnailUrl ?? thumbnail.url)}
          alt={`Photo of ${item.title}`}
          className="mb-3 h-32 w-full rounded-md object-cover"
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-slate-900">{item.title}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[item.type]}`}>
          {item.type}
        </span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span>{item.category?.name}</span>
        <span>·</span>
        <span>{item.location?.name}</span>
        <span>·</span>
        <span>{new Date(item.eventDate).toLocaleDateString()}</span>
      </div>
    </Link>
  )
}
