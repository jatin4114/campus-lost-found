import { useState } from 'react'
import { ItemCard } from '../../components/items/ItemCard'
import { useCategories, useItems, useLocations } from '../../services/itemsApi'

const DEFAULT_FILTERS = { page: 1, limit: 12 }

export function ItemsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const { data, isLoading, isError } = useItems(filters)
  const { data: categories } = useCategories()
  const { data: locations } = useLocations()

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }))
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Browse items</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search…"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        <select
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => updateFilter('type', e.target.value)}
        >
          <option value="">All types</option>
          <option value="LOST">Lost</option>
          <option value="FOUND">Found</option>
        </select>
        <select
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => updateFilter('location', e.target.value)}
        >
          <option value="">All locations</option>
          {locations?.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      {isLoading && <p className="mt-8 text-slate-500">Loading…</p>}
      {isError && <p className="mt-8 text-red-600">Couldn't load items. Try again.</p>}

      {data && data.items.length === 0 && (
        <p className="mt-8 text-slate-500">No items match your filters.</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((item) => <ItemCard key={item.id} item={item} />)}
      </div>

      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={filters.page >= data.pagination.totalPages}
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
