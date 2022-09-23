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

// A plain <a href> can't carry the Authorization header the export
// endpoints require — fetch as a blob and trigger the download via a
// throwaway object URL instead.
export async function downloadAdminExport(resource) {
  const res = await apiClient.get(`/admin/export/${resource}`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const link = document.createElement('a')
  link.href = url
  link.download = `${resource}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
