import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { apiClient } from '../../lib/apiClient'

const schema = z.object({
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Include an uppercase letter')
    .regex(/[0-9]/, 'Include a number'),
})

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)
  const [done, setDone] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(values) {
    setServerError(null)
    try {
      await apiClient.post('/auth/reset-password', { token, password: values.password })
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setServerError(err.response?.data?.error?.message ?? 'This reset link is invalid or has expired.')
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Invalid link</h1>
        <p className="text-sm text-slate-600">This password reset link is missing its token.</p>
        <Link to="/forgot-password" className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
          Request a new link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Password updated</h1>
        <p className="text-sm text-slate-600">Redirecting you to log in…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Reset your password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            New password
          </label>
          <input
            id="password"
            type="password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
