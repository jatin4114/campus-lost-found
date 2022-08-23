import { z } from 'zod'

export const createSavedSearchSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    type: z.enum(['LOST', 'FOUND']).optional(),
    categoryId: z.string().min(1).optional(),
    locationId: z.string().min(1).optional(),
    search: z.string().trim().max(200).optional(),
  }),
})

export const savedSearchIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
})
