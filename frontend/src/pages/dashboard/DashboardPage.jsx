import { useAuth } from '../../context/AuthContext'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
      <p className="mt-2 text-slate-600">
        Your reports, matches, and recent activity will show up here.
      </p>
    </div>
  )
}
