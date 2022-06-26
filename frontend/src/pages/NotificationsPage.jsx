import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../services/notificationsApi'

export function NotificationsPage() {
  const { data, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
        {(data?.unreadCount ?? 0) > 0 && (
          <button
            type="button"
            onClick={() => markAllRead.mutate()}
            className="text-sm text-slate-600 underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {isLoading && <p className="mt-8 text-slate-500">Loading…</p>}
      {data && data.notifications.length === 0 && (
        <p className="mt-8 text-slate-500">You're all caught up.</p>
      )}

      <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {data?.notifications.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => !n.read && markRead.mutate(n.id)}
            className={`block w-full p-4 text-left ${n.read ? 'bg-white' : 'bg-slate-50'}`}
          >
            <p className="font-medium text-slate-900">{n.title}</p>
            <p className="mt-1 text-sm text-slate-600">{n.message}</p>
            <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
