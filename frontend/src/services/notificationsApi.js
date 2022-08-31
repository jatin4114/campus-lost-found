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

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => apiClient.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => apiClient.post('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
