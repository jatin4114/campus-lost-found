import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'

export function useNotifications() {
  const { status } = useAuth()
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await apiClient.get('/notifications')).data.data,
    enabled: status === 'authenticated',
    refetchInterval: 15000,
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
