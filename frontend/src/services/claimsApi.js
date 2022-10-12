import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'

export function useMyClaims() {
  return useQuery({
    queryKey: ['claims', 'mine'],
    queryFn: async () => (await apiClient.get('/claims/mine')).data.data.claims,
  })
}

export function useClaimsOnMyItems() {
  return useQuery({
    queryKey: ['claims', 'on-my-items'],
    queryFn: async () => (await apiClient.get('/claims/on-my-items')).data.data.claims,
  })
}

export function useSubmitClaim() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId, message, evidence }) =>
      (await apiClient.post(`/items/${itemId}/claims`, { message, evidence })).data.data.claim,
    onSuccess: (claim) => {
      queryClient.invalidateQueries({ queryKey: ['items', claim.itemId] })
      queryClient.invalidateQueries({ queryKey: ['claims', 'mine'] })
    },
  })
}

export function useAcceptClaim() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (claimId) => (await apiClient.post(`/claims/${claimId}/accept`)).data.data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', 'on-my-items'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useRejectClaim() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (claimId) => (await apiClient.post(`/claims/${claimId}/reject`)).data.data.claim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims', 'on-my-items'] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

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
