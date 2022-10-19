import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useConversations } from '../../services/conversationsApi'
import { NotificationBell } from './NotificationBell'

const ROLE_LABELS = {
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  STUDENT: 'Student',
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => (isActive ? 'font-medium text-slate-900' : 'hover:text-slate-900')}
    >
      {children}
    </NavLink>
  )
}

export function Navbar() {
  const { user, status, logout } = useAuth()
  const navigate = useNavigate()
  const { data: conversations } = useConversations()
  const unreadMessages = conversations?.reduce((sum, c) => sum + (c.unreadCount > 0 ? 1 : 0), 0) ?? 0

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <header className="border-b border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          CampusFind
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-600">
          {status === 'authenticated' ? (
            <>
              <NavItem to="/dashboard">Dashboard</NavItem>
              <NavItem to="/items">Browse</NavItem>
              <NavItem to="/report">Report Item</NavItem>
              <NavItem to="/my-reports">My Reports</NavItem>
              <NavItem to="/matches">Matches</NavItem>
              <span className="relative">
                <NavItem to="/messages">Messages</NavItem>
                {unreadMessages > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white"
                  >
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </span>
              <NotificationBell />
              {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
                <NavItem to="/admin">Admin</NavItem>
              )}
              <span className="flex items-center gap-1.5 text-slate-400">
                {user?.name}
                {user?.role && user.role !== 'STUDENT' && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {ROLE_LABELS[user.role]}
                  </span>
                )}
              </span>
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
