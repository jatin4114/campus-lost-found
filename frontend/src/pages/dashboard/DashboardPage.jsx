import { Link } from 'react-router-dom'
import { MatchCard } from '../../components/items/MatchCard'
import { useAuth } from '../../context/AuthContext'
import { useMyMatches } from '../../services/matchesApi'
import { useMyItems } from '../../services/itemsApi'

export function DashboardPage() {
  const { user } = useAuth()
  const { data: items } = useMyItems()
  const { data: matches } = useMyMatches()

  const activeCount = items?.filter((i) => i.status === 'ACTIVE').length ?? 0
  const resolvedCount = items?.filter((i) => i.status === 'RESOLVED').length ?? 0
  const prominentMatches = matches?.filter((m) => m.tier !== 'WEAK').slice(0, 3)

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        Welcome back, {user?.name?.split(' ')[0]}
      </h1>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-2xl font-semibold text-slate-900">{items?.length ?? 0}</p>
          <p className="text-sm text-slate-500">Reports</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-2xl font-semibold text-slate-900">{activeCount}</p>
          <p className="text-sm text-slate-500">Active</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-2xl font-semibold text-slate-900">{resolvedCount}</p>
          <p className="text-sm text-slate-500">Resolved</p>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-slate-900">Potential matches</h2>
          <Link to="/matches" className="text-sm text-slate-600 underline">View all</Link>
        </div>
        {prominentMatches && prominentMatches.length === 0 && (
          <p className="mt-3 text-sm text-slate-500">No potential matches yet.</p>
        )}
        <div className="mt-3 space-y-3">
          {prominentMatches?.map((match) => <MatchCard key={match.id} match={match} />)}
        </div>
      </div>
    </div>
  )
}
