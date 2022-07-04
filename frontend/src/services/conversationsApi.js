import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await apiClient.get('/conversations')).data.data.conversations,
  })
}

export function useConversation(id) {
  return useQuery({
    queryKey: ['conversations', id],
    queryFn: async () => (await apiClient.get(`/conversations/${id}`)).data.data.conversation,
    enabled: Boolean(id),
  })
}

export function useMessages(id) {
  return useQuery({
    queryKey: ['conversations', id, 'messages'],
    queryFn: async () => (await apiClient.get(`/conversations/${id}/messages`)).data.data.messages,
    enabled: Boolean(id),
  })
}

export function useInvalidateConversations() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['conversations'] })
}
