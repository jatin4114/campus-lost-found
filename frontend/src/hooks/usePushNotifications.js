import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getSocket } from '../lib/socket'

// Real-time delivery for any tab that's currently open, via the same
// authenticated socket the messaging feature uses. This does NOT reach a
// browser that's fully closed — that would need a service worker + Web
// Push (VAPID keys), a real follow-up rather than something faked here.
export function usePushNotifications() {
  const { status } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (status !== 'authenticated') return undefined

    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }

    const socket = getSocket()
    if (!socket.connected) socket.connect()

    function onNotification(notification) {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) {
        // Only when the tab isn't focused — an in-app toast (or the bell's
        // own badge) already covers the foreground/focused case, and
        // showing an OS notification on top of a visible UI update would
        // just be noisy.
        new Notification(notification.title, { body: notification.message })
      }
    }

    socket.on('notification:new', onNotification)
    return () => socket.off('notification:new', onNotification)
  }, [status, queryClient])
}
