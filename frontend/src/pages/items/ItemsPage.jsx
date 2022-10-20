import { useState } from 'react'
import { ItemGridSkeleton } from '../../components/common/Skeleton'
import { ItemCard } from '../../components/items/ItemCard'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useCategories, useItems, useLocations } from '../../services/itemsApi'

const DEFAULT_FILTERS = { page: 1, limit: 12 }

export function ItemsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput)
  const effectiveFilters = { ...filters, search: debouncedSearch || undefined }
  const { data, isLoading, isError } = useItems(effectiveFilters)
  const { data: categories } = useCategories()
  const { data: locations } = useLocations()

  const hasActiveFilters =
    Boolean(searchInput) || Boolean(filters.type) || Boolean(filters.category) ||
    Boolean(filters.location) || Boolean(filters.sort)

  function updateFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }))
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS)
    setSearchInput('')
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Browse items</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <input
            type="text"
            value={searchInput}
            placeholder="Search…"
            onChange={(e) => setSearchInput(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 pr-8 text-sm"
          />
          {searchInput && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-2 text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          )}
        </div>
        <select
          value={filters.type ?? ''}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => updateFilter('type', e.target.value)}
        >
          <option value="">All types</option>
          <option value="LOST">Lost</option>
          <option value="FOUND">Found</option>
        </select>
        <select
          value={filters.category ?? ''}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filters.location ?? ''}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => updateFilter('location', e.target.value)}
        >
          <option value="">All locations</option>
          {locations?.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <select
          value={filters.sort ?? ''}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          onChange={(e) => updateFilter('sort', e.target.value)}
        >
          <option value="">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="eventDate">Event date</option>
        </select>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="text-sm text-slate-600 underline">
            Clear filters
          </button>
        )}
      </div>

      {isLoading && <div className="mt-6"><ItemGridSkeleton /></div>}
      {isError && <p className="mt-8 text-red-600">Couldn't load items. Try again.</p>}

      {data && data.items.length === 0 && (
        <p className="mt-8 text-slate-500">No items match your filters.</p>
      )}

      {data && data.items.length > 0 && (
        <p className="mt-4 text-sm text-slate-500">
          Showing {data.items.length} of {data.pagination?.total ?? data.items.length} item
          {(data.pagination?.total ?? data.items.length) === 1 ? '' : 's'}
        </p>
      )}

      {!isLoading && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}

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
