import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDismissMatch } from '../../services/matchesApi'

const TIER_STYLES = {
  VERY_STRONG: 'bg-emerald-100 text-emerald-700',
  STRONG: 'bg-emerald-50 text-emerald-700',
  POSSIBLE: 'bg-amber-100 text-amber-700',
  WEAK: 'bg-slate-100 text-slate-600',
}

export function MatchCard({ match }) {
  const { user } = useAuth()
  const dismiss = useDismissMatch()

  const mineIsLost = match.lostItem.userId === user?.id
  const mine = mineIsLost ? match.lostItem : match.foundItem
  const other = mineIsLost ? match.foundItem : match.lostItem

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">
            {mine.title} ↔ {other.title}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Your {mineIsLost ? 'lost' : 'found'} report may match{' '}
            <Link to={`/items/${other.id}`} className="underline">
              this {mineIsLost ? 'found' : 'lost'} item
            </Link>
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${TIER_STYLES[match.tier]}`}>
          {match.score}% match
        </span>
      </div>
      <button
        type="button"
        onClick={() => dismiss.mutate(match.id)}
        className="mt-3 text-xs text-slate-500 underline hover:text-slate-700"
      >
        Not a match
      </button>
    </div>
  )
}
