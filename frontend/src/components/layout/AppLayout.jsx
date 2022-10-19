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
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-400 print:hidden">
        <p>
          CampusFind — a personal portfolio project ·{' '}
          <a
            href="https://github.com/jatin4114/campus-lost-found"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-slate-600"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
