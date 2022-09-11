import { ListSkeleton } from '../components/common/Skeleton'
import { MatchCard } from '../components/items/MatchCard'
import { useMyMatches } from '../services/matchesApi'

export function MatchesPage() {
  const { data: matches, isLoading } = useMyMatches()
  const prominent = matches?.filter((m) => m.tier !== 'WEAK')

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Potential matches</h1>
      {isLoading && <div className="mt-6"><ListSkeleton /></div>}
      {prominent && prominent.length === 0 && (
        <p className="mt-8 text-slate-500">No potential matches yet. Check back after reporting an item.</p>
      )}
      {!isLoading && (
        <div className="mt-6 space-y-3">
          {prominent?.map((match) => <MatchCard key={match.id} match={match} />)}
        </div>
      )}
    </div>
  )
}
