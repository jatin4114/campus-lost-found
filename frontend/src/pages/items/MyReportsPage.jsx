import { ItemGridSkeleton } from '../../components/common/Skeleton'
import { ItemCard } from '../../components/items/ItemCard'
import { useResolveItem } from '../../services/claimsApi'
import { useMyItems } from '../../services/itemsApi'

export function MyReportsPage() {
  const { data: items, isLoading } = useMyItems()
  const resolveItem = useResolveItem()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">My reports</h1>
      {isLoading && <div className="mt-6"><ItemGridSkeleton /></div>}
      {items && items.length === 0 && (
        <p className="mt-8 text-slate-500">You haven't reported any items yet.</p>
      )}
      {!isLoading && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items?.map((item) => (
            <div key={item.id}>
              <ItemCard item={item} />
              {item.status === 'CLAIMED' && (
                <button
                  type="button"
                  onClick={() => resolveItem.mutate(item.id)}
                  disabled={resolveItem.isPending}
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Mark resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
