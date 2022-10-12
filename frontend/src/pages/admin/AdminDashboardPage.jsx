import { Skeleton } from '../../components/common/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { downloadAdminExport, useAdminStats } from '../../services/adminApi'

const EXPORTS = [
  { resource: 'users', label: 'Users' },
  { resource: 'items', label: 'Items' },
  { resource: 'reports', label: 'Reports' },
]

const TILES = [
  { key: 'totalUsers', label: 'Users' },
  { key: 'activeReports', label: 'Active Items' },
  { key: 'resolvedReports', label: 'Resolved Items' },
  { key: 'pendingClaims', label: 'Pending Claims' },
  { key: 'reportedContent', label: 'Reported Content' },
]

export function AdminDashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useAdminStats()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Admin dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {TILES.map((tile) => (
          <div key={tile.key} className="rounded-lg border border-slate-200 bg-white p-4">
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <p className="text-2xl font-semibold text-slate-900">{stats?.[tile.key] ?? '—'}</p>
            )}
            <p className="mt-1 text-sm text-slate-500">{tile.label}</p>
          </div>
        ))}
        {isLoading && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <Skeleton className="h-8 w-12" />
            <p className="mt-1 text-sm text-slate-500">Resolution rate</p>
          </div>
        )}
        {stats && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-2xl font-semibold text-slate-900">{stats.resolutionRate}%</p>
            <p className="text-sm text-slate-500">Resolution rate</p>
          </div>
        )}
      </div>

      {user?.role === 'ADMIN' && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-slate-700">Export data</h2>
          <div className="mt-2 flex gap-2">
            {EXPORTS.map((item) => (
              <button
                key={item.resource}
                type="button"
                onClick={() => downloadAdminExport(item.resource)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                Export {item.label} CSV
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
