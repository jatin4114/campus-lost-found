import { ItemGridSkeleton } from '../../components/common/Skeleton'
import { ItemCard } from '../../components/items/ItemCard'
import { useMyItems } from '../../services/itemsApi'

export function MyReportsPage() {
  const { data: items, isLoading } = useMyItems()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">My reports</h1>
      {isLoading && <div className="mt-6"><ItemGridSkeleton /></div>}
      {items && items.length === 0 && (
        <p className="mt-8 text-slate-500">You haven't reported any items yet.</p>
      )}
      {!isLoading && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items?.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  )
}
