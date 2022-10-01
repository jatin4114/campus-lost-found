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
    // Optimistic: dismissing is a one-way "not a match" action a user
    // expects to disappear instantly, not after a round-trip — roll back
    // to the snapshot if the request actually fails.
    onMutate: async (matchId) => {
      await queryClient.cancelQueries({ queryKey: ['matches', 'mine'] })
      const previous = queryClient.getQueryData(['matches', 'mine'])
      queryClient.setQueryData(['matches', 'mine'], (matches) =>
        matches?.filter((m) => m.id !== matchId),
      )
      return { previous }
    },
    onError: (err, matchId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['matches', 'mine'], context.previous)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['matches'] }),
  })
}
