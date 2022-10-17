import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { PasswordInput } from '../../components/common/PasswordInput'
import { useAuth } from '../../context/AuthContext'
import { apiClient } from '../../lib/apiClient'
import { loginSchema } from '../../schemas/authSchemas'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)
  const [serverErrorCode, setServerErrorCode] = useState(null)
  const [resendState, setResendState] = useState('idle') // idle | sending | sent
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values) {
    setServerError(null)
    setServerErrorCode(null)
    setResendState('idle')
    try {
      await login(values)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.error?.message ?? 'Something went wrong. Please try again.')
      setServerErrorCode(err.response?.data?.error?.code ?? null)
    }
  }

  async function handleResend() {
    setResendState('sending')
    try {
      await apiClient.post('/auth/resend-verification', { email: getValues('email') })
    } finally {
      setResendState('sent')
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        {serverError && (
          <p role="alert" className="text-sm text-red-600">
            {serverError}
            {serverErrorCode === 'EMAIL_NOT_VERIFIED' && resendState !== 'sent' && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendState === 'sending'}
                  className="underline disabled:opacity-50"
                >
                  Resend verification email
                </button>
              </>
            )}
            {serverErrorCode === 'EMAIL_NOT_VERIFIED' && resendState === 'sent' && (
              <span className="block text-slate-600">
                If that account needs verifying, we sent a new link.
              </span>
            )}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        No account?{' '}
        <Link to="/register" className="font-medium text-slate-900 underline">
          Sign up
        </Link>
      </p>
      <p className="mt-2 text-sm text-slate-600">
        <Link to="/forgot-password" className="font-medium text-slate-900 underline">
          Forgot password?
        </Link>
      </p>
    </div>
  )
}
