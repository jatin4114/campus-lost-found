import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

export function useNotifications(page = 1) {
  const { status } = useAuth()
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => (await apiClient.get('/notifications', { params: { page, limit: 20 } })).data.data,
    enabled: status === 'authenticated',
    refetchInterval: 15000,
    placeholderData: (previous) => previous,
  })
}

// Marking read is a low-stakes, instantly-expected UI change — update every
// cached notifications page optimistically (the unread badge and the row's
// highlight) rather than waiting on a round-trip, and just refetch on
// settle to reconcile with the server either way.
function markPagesRead(queryClient, predicate) {
  queryClient.setQueriesData({ queryKey: ['notifications'] }, (data) => {
    if (!data) return data
    let changed = 0
    const notifications = data.notifications.map((n) => {
      if (!n.read && predicate(n)) {
        changed += 1
        return { ...n, read: true }
      }
      return n
    })
    if (changed === 0) return data
    return { ...data, notifications, unreadCount: Math.max(0, data.unreadCount - changed) }
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => apiClient.post(`/notifications/${id}/read`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      markPagesRead(queryClient, (n) => n.id === id)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => apiClient.post('/notifications/read-all'),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] })
      markPagesRead(queryClient, () => true)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
