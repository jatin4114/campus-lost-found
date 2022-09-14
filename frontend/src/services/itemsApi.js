import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await apiClient.get('/categories')).data.data.categories,
  })
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => (await apiClient.get('/locations')).data.data.locations,
  })
}

export function useItems(filters) {
  return useQuery({
    queryKey: ['items', filters],
    queryFn: async () => {
      const res = await apiClient.get('/items', { params: filters })
      return { items: res.data.data, pagination: res.data.pagination }
    },
    placeholderData: (previous) => previous,
  })
}

export function useItem(id) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: async () => (await apiClient.get(`/items/${id}`)).data.data.item,
    enabled: Boolean(id),
  })
}

export function useMyItems() {
  return useQuery({
    queryKey: ['items', 'mine'],
    queryFn: async () => (await apiClient.get('/items/mine')).data.data.items,
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => (await apiClient.post('/items', payload)).data.data.item,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useUploadItemImages() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId, files }) => {
      const formData = new FormData()
      for (const file of files) formData.append('images', file)
      return (await apiClient.post(`/items/${itemId}/images`, formData)).data.data.item
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['items', item.id] })
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
  })
}

export function useDeleteItemImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ itemId, imageId }) =>
      (await apiClient.delete(`/items/${itemId}/images/${imageId}`)).data.data.item,
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['items', item.id] })
    },
  })
}
