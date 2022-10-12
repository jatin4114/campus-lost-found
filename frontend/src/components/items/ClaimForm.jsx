import { useState } from 'react'
import { useSubmitClaim } from '../../services/claimsApi'

const EVIDENCE_TYPES = [
  { value: 'DESCRIPTION', label: 'Description' },
  { value: 'IDENTIFYING_DETAIL', label: 'Identifying detail' },
  { value: 'PURCHASE_INFO', label: 'Purchase info' },
  { value: 'IMAGE', label: 'Image reference' },
]

export function ClaimForm({ itemId, onSubmitted }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [evidence, setEvidence] = useState([{ type: 'DESCRIPTION', content: '' }])
  const [error, setError] = useState(null)
  const submitClaim = useSubmitClaim()

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
      >
        Claim this item
      </button>
    )
  }

  function updateEvidence(index, field, value) {
    setEvidence((prev) => prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)))
  }

  function addEvidence() {
    setEvidence((prev) => [...prev, { type: 'DESCRIPTION', content: '' }])
  }

  function removeEvidence(index) {
    setEvidence((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const trimmedEvidence = evidence.map((ev) => ({ ...ev, content: ev.content.trim() })).filter((ev) => ev.content)
    if (message.trim().length < 10) {
      setError('Please describe why this item is yours in at least 10 characters.')
      return
    }
    if (trimmedEvidence.length === 0) {
      setError('Add at least one piece of evidence.')
      return
    }
    try {
      await submitClaim.mutateAsync({ itemId, message: message.trim(), evidence: trimmedEvidence })
      onSubmitted?.()
    } catch (err) {
      setError(err.response?.data?.error?.message ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-900">Claim this item</p>
      <div>
        <label htmlFor="claim-message" className="block text-sm font-medium text-slate-700">
          Why is this yours?
        </label>
        <textarea
          id="claim-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Evidence</p>
        {evidence.map((ev, index) => (
          <div key={index} className="flex gap-2">
            <select
              value={ev.type}
              onChange={(e) => updateEvidence(index, 'type', e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-2 text-sm"
            >
              {EVIDENCE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <input
              value={ev.content}
              onChange={(e) => updateEvidence(index, 'content', e.target.value)}
              placeholder="Describe an identifying detail…"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            {evidence.length > 1 && (
              <button
                type="button"
                onClick={() => removeEvidence(index)}
                aria-label={`Remove evidence ${index + 1}`}
                className="rounded-md border border-slate-300 px-2 text-sm text-slate-500"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addEvidence} className="text-sm text-slate-600 underline">
          + Add evidence
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitClaim.isPending}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitClaim.isPending ? 'Submitting…' : 'Submit claim'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
