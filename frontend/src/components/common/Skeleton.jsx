export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} />
}

export function ItemCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  )
}

export function ItemGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ListRowSkeleton() {
  return (
    <div className="p-4">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="mt-2 h-3 w-1/3" />
    </div>
  )
}

export function ListSkeleton({ count = 4 }) {
  return (
    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {Array.from({ length: count }, (_, i) => (
        <ListRowSkeleton key={i} />
      ))}
    </div>
  )
}

export function TableRowsSkeleton({ columns = 4, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="border-b border-slate-100 last:border-0">
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="p-3">
              <Skeleton className="h-4 w-full max-w-32" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
