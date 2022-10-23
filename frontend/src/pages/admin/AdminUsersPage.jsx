import { useState } from 'react'
import { TableRowsSkeleton } from '../../components/common/Skeleton'
import { useAdminUsers, useSetUserActive } from '../../services/adminApi'

export function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers()
  const setActive = useSetUserActive()
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const filteredUsers = users?.filter((u) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  async function handleCopyEmail(user) {
    await navigator.clipboard.writeText(user.email)
    setCopiedId(user.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  function handleSuspendToggle(user) {
    if (user.isActive && !window.confirm(`Suspend ${user.name}? They won't be able to log in until reactivated.`)) {
      return
    }
    setActive.mutate({ id: user.id, active: !user.isActive })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <TableRowsSkeleton columns={5} />}
            {filteredUsers?.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 last:border-0">
                <td className="p-3">{user.name}</td>
                <td className="p-3 text-slate-500">
                  {user.email}{' '}
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(user)}
                    className="text-xs text-slate-400 underline hover:text-slate-600"
                  >
                    {copiedId === user.id ? 'Copied!' : 'Copy'}
                  </button>
                </td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  <span className={user.isActive ? 'text-emerald-600' : 'text-red-600'}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleSuspendToggle(user)}
                    className="text-sm text-slate-600 underline"
                  >
                    {user.isActive ? 'Suspend' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && filteredUsers?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-slate-500">
                  No users match "{search}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
