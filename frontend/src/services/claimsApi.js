import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'

export function useResolveItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (itemId) => (await apiClient.post(`/items/${itemId}/resolve`)).data.data.item,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useClaimRatings(claimId) {
  return useQuery({
    queryKey: ['claims', claimId, 'ratings'],
    queryFn: async () => (await apiClient.get(`/claims/${claimId}/ratings`)).data.data.ratings,
    enabled: Boolean(claimId),
  })
}

export function useSubmitRating() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ claimId, score, comment }) =>
      (await apiClient.post(`/claims/${claimId}/rating`, { score, comment })).data.data.rating,
    onSuccess: (_, { claimId }) => {
      queryClient.invalidateQueries({ queryKey: ['claims', claimId, 'ratings'] })
    },
  })
}
