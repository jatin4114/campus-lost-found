import { useParams } from 'react-router-dom'
import { useItem } from '../../services/itemsApi'

export function ItemDetailPage() {
  const { id } = useParams()
  const { data: item, isLoading, isError } = useItem(id)

  if (isLoading) return <p className="text-slate-500">Loading…</p>
  if (isError || !item) return <p className="text-red-600">This item could not be found.</p>

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">{item.title}</h1>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {item.type}
        </span>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-slate-700">{item.description}</p>
      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500">Category</dt>
          <dd className="text-slate-900">{item.category?.name}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Location</dt>
          <dd className="text-slate-900">{item.location?.name}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Date</dt>
          <dd className="text-slate-900">{new Date(item.eventDate).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Status</dt>
          <dd className="text-slate-900">{item.status}</dd>
        </div>
      </dl>
    </div>
  )
}
