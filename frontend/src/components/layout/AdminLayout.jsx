import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAdminStats } from '../../services/adminApi'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users', adminOnly: true },
  { to: '/admin/reports', label: 'Reports', badgeKey: 'reportedContent' },
  { to: '/admin/audit-logs', label: 'Audit Logs', adminOnly: true },
]

export function AdminLayout() {
  const { user } = useAuth()
  const { data: stats } = useAdminStats()
  const links = LINKS.filter((link) => !link.adminOnly || user?.role === 'ADMIN')

  return (
    <div className="grid grid-cols-[160px_1fr] gap-6">
      <nav className="space-y-1 text-sm">
        {links.map((link) => {
          const badgeCount = link.badgeKey ? stats?.[link.badgeKey] : 0
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-md px-3 py-2 ${isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`
              }
            >
              {link.label}
              {Boolean(badgeCount) && (
                <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
