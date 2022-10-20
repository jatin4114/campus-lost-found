import { Link } from 'react-router-dom'
import { getMediaUrl } from '../../lib/apiClient'
import { formatRelativeTime, isWithinLastDay } from '../../lib/dateUtils'

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
      {thumbnail ? (
        <img
          src={getMediaUrl(thumbnail.thumbnailUrl ?? thumbnail.url)}
          alt={`Photo of ${item.title}`}
          className="mb-3 h-32 w-full rounded-md object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="mb-3 flex h-32 w-full items-center justify-center rounded-md bg-slate-100 text-3xl text-slate-300"
        >
          📦
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-slate-900">{item.title}</h3>
        <div className="flex shrink-0 gap-1">
          {item.createdAt && isWithinLastDay(item.createdAt) && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              New
            </span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_STYLES[item.type]}`}>
            {item.type}
          </span>
        </div>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.description}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
        <span>{item.category?.name}</span>
        <span>·</span>
        <span>{item.location?.name}</span>
        <span>·</span>
        <span>{formatRelativeTime(item.eventDate)}</span>
      </div>
    </Link>
  )
}
