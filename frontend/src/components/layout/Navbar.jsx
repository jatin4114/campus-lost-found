import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { NotificationBell } from './NotificationBell'

export function Navbar() {
  const { user, status, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          CampusFind
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          {status === 'authenticated' ? (
            <>
              <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>
              <Link to="/items" className="hover:text-slate-900">Browse</Link>
              <Link to="/report" className="hover:text-slate-900">Report Item</Link>
              <Link to="/my-reports" className="hover:text-slate-900">My Reports</Link>
              <Link to="/matches" className="hover:text-slate-900">Matches</Link>
              <Link to="/messages" className="hover:text-slate-900">Messages</Link>
              <NotificationBell />
              {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
                <Link to="/admin" className="hover:text-slate-900">Admin</Link>
              )}
              <span className="text-slate-400">{user?.name}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-slate-900">Log in</Link>
              <Link
                to="/register"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
