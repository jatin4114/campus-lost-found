import { Outlet } from 'react-router-dom'
import { usePushNotifications } from '../../hooks/usePushNotifications'
import { Navbar } from './Navbar'

export function AppLayout() {
  usePushNotifications()

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
