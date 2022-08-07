import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { apiClient } from '../../lib/apiClient'

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
})

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(values) {
    await apiClient.post('/auth/forgot-password', values)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <h1 className="mb-2 text-2xl font-semibold text-slate-900">Check your email</h1>
        <p className="text-sm text-slate-600">
          If an account exists for that address, we sent a password reset link.
        </p>
        <Link to="/login" className="mt-4 inline-block text-sm font-medium text-slate-900 underline">
          Back to log in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Forgot password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        <Link to="/login" className="font-medium text-slate-900 underline">
          Back to log in
        </Link>
      </p>
    </div>
  )
}
