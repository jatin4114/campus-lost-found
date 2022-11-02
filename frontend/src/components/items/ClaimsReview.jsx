import { formatRelativeTime } from '../../lib/dateUtils'
import { useAcceptClaim, useClaimsOnMyItems, useRejectClaim } from '../../services/claimsApi'

const STATUS_STYLES = {
  PENDING: 'bg-amber-100 text-amber-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-600',
}

export function ClaimsReview({ itemId }) {
  const { data: claims, isLoading } = useClaimsOnMyItems()
  const acceptClaim = useAcceptClaim()
  const rejectClaim = useRejectClaim()

  const itemClaims = claims?.filter((c) => c.itemId === itemId)

  if (isLoading || !itemClaims || itemClaims.length === 0) return null

  return (
    <div className="mt-6 border-t border-slate-200 pt-6">
      <h2 className="text-lg font-semibold text-slate-900">Claims on this item</h2>
      <div className="mt-3 space-y-3">
        {itemClaims.map((claim) => (
          <div key={claim.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {claim.claimant?.name}{' '}
                  <span className="font-normal text-slate-400">· {formatRelativeTime(claim.createdAt)}</span>
                </p>
                <p className="mt-1 text-sm text-slate-700">{claim.message}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[claim.status]}`}>
                {claim.status}
              </span>
            </div>
            {claim.evidence?.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {claim.evidence.map((ev) => (
                  <li key={ev.id}>
                    <span className="font-medium text-slate-500">{ev.type.replaceAll('_', ' ')}:</span> {ev.content}
                  </li>
                ))}
              </ul>
            )}
            {claim.status === 'PENDING' && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => acceptClaim.mutate(claim.id)}
                  disabled={acceptClaim.isPending || rejectClaim.isPending}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => rejectClaim.mutate(claim.id)}
                  disabled={acceptClaim.isPending || rejectClaim.isPending}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
