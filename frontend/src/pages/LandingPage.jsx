import { Link } from 'react-router-dom'

export function LandingPage() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <h1 className="text-4xl font-semibold text-slate-900">Lost something on campus?</h1>
      <p className="mt-4 text-lg text-slate-600">
        Report it, browse found items, and get matched automatically.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/register" className="rounded-md bg-slate-900 px-4 py-2 text-white">
          Get started
        </Link>
        <Link to="/login" className="rounded-md border border-slate-300 px-4 py-2 text-slate-900">
          Log in
        </Link>
      </div>
    </div>
  )
}
