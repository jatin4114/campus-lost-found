import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useClaimRatings, useSubmitRating } from '../../services/claimsApi'

export function RatingPrompt({ claimId, otherName }) {
  const { user } = useAuth()
  const { data: ratings, isLoading } = useClaimRatings(claimId)
  const submitRating = useSubmitRating()
  const [score, setScore] = useState(5)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const alreadyRated = ratings?.some((r) => r.rater.id === user?.id)

  if (isLoading || alreadyRated || submitted) return null

  async function handleSubmit(e) {
    e.preventDefault()
    await submitRating.mutateAsync({ claimId, score, comment: comment.trim() || undefined })
    setSubmitted(true)
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-900">Rate your handover with {otherName ?? 'them'}</p>
      <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={score === value}
            onClick={() => setScore(value)}
            className={`h-8 w-8 rounded-md text-sm font-medium ${
              value <= score ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment"
        rows={2}
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={submitRating.isPending}
        className="mt-2 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        Submit rating
      </button>
    </form>
  )
}
