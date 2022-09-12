import { Link } from 'react-router-dom'
import { useNotifications } from '../../services/notificationsApi'

export function NotificationBell() {
  const { data } = useNotifications()
  const unreadCount = data?.unreadCount ?? 0

  return (
    <Link
      to="/notifications"
      className="relative rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 hover:text-slate-900"
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
    >
      <span aria-hidden="true">🔔</span>
      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-medium text-white"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}
