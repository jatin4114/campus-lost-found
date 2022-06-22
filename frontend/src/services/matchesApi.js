import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'

export function useMyMatches() {
  return useQuery({
    queryKey: ['matches', 'mine'],
    queryFn: async () => (await apiClient.get('/matches/mine')).data.data.matches,
  })
}

export function useDismissMatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (matchId) => apiClient.post(`/matches/${matchId}/dismiss`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['matches'] }),
  })
}
