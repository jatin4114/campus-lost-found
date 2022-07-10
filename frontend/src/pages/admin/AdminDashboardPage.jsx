import { useAdminStats } from '../../services/adminApi'

const TILES = [
  { key: 'totalUsers', label: 'Users' },
  { key: 'activeReports', label: 'Active Reports' },
  { key: 'resolvedReports', label: 'Resolved' },
  { key: 'pendingClaims', label: 'Pending Claims' },
  { key: 'reportedContent', label: 'Reported Content' },
]

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Admin dashboard</h1>
      {isLoading && <p className="mt-6 text-slate-500">Loading…</p>}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {TILES.map((tile) => (
          <div key={tile.key} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-2xl font-semibold text-slate-900">{stats?.[tile.key] ?? '—'}</p>
            <p className="text-sm text-slate-500">{tile.label}</p>
          </div>
        ))}
        {stats && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-2xl font-semibold text-slate-900">{stats.resolutionRate}%</p>
            <p className="text-sm text-slate-500">Resolution rate</p>
          </div>
        )}
      </div>
    </div>
  )
}
