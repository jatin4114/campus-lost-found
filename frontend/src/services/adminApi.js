import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => (await apiClient.get('/admin/stats')).data.data,
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => (await apiClient.get('/admin/users')).data.data.users,
  })
}

export function useSetUserActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, active }) =>
      apiClient.post(`/admin/users/${id}/${active ? 'reactivate' : 'suspend'}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useAdminReports(status) {
  return useQuery({
    queryKey: ['admin', 'reports', status],
    queryFn: async () => (await apiClient.get('/admin/reports', { params: { status } })).data.data.reports,
  })
}

export function useReviewReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, action }) => apiClient.post(`/admin/reports/${id}/review`, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  })
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/audit-logs')
      return res.data.logs
    },
  })
}
