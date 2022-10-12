import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users', adminOnly: true },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/audit-logs', label: 'Audit Logs', adminOnly: true },
]

export function AdminLayout() {
  const { user } = useAuth()
  const links = LINKS.filter((link) => !link.adminOnly || user?.role === 'ADMIN')

  return (
    <div className="grid grid-cols-[160px_1fr] gap-6">
      <nav className="space-y-1 text-sm">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
