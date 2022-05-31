import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { apiClient } from '../../lib/apiClient'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [state, setState] = useState('verifying') // verifying | success | error

  useEffect(() => {
    if (!token) {
      setState('error')
      return
    }
    apiClient
      .post('/auth/verify-email', { token })
      .then(() => setState('success'))
      .catch(() => setState('error'))
  }, [token])

  return (
    <div className="mx-auto max-w-sm text-center">
      {state === 'verifying' && <p className="text-slate-600">Verifying your email…</p>}
      {state === 'success' && (
        <>
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">Email verified</h1>
          <p className="text-sm text-slate-600">Your account is now active.</p>
        </>
      )}
      {state === 'error' && (
        <>
          <h1 className="mb-2 text-2xl font-semibold text-slate-900">Verification failed</h1>
          <p className="text-sm text-slate-600">This link is invalid or has expired.</p>
        </>
      )}
      <Link to="/login" className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
        Back to log in
      </Link>
    </div>
  )
}
