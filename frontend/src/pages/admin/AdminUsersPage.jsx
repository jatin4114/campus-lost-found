import { useAdminUsers, useSetUserActive } from '../../services/adminApi'

export function AdminUsersPage() {
  const { data: users, isLoading } = useAdminUsers()
  const setActive = useSetUserActive()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
      {isLoading && <p className="mt-6 text-slate-500">Loading…</p>}
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
            {users?.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 last:border-0">
                <td className="p-3">{user.name}</td>
                <td className="p-3 text-slate-500">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">
                  <span className={user.isActive ? 'text-emerald-600' : 'text-red-600'}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    type="button"
                    onClick={() => setActive.mutate({ id: user.id, active: !user.isActive })}
                    className="text-sm text-slate-600 underline"
                  >
                    {user.isActive ? 'Suspend' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
