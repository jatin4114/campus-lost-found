import { z } from 'zod'

export const createItemSchema = z.object({
  body: z.object({
    type: z.enum(['LOST', 'FOUND']),
    title: z.string().trim().min(2).max(150),
    description: z.string().trim().min(10).max(2000),
    categoryId: z.string().min(1),
    locationId: z.string().min(1),
    eventDate: z.coerce.date(),
  }),
})

export const updateItemSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    title: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().min(10).max(2000).optional(),
    categoryId: z.string().min(1).optional(),
    locationId: z.string().min(1).optional(),
    eventDate: z.coerce.date().optional(),
    status: z.enum(['ACTIVE', 'EXPIRED']).optional(),
  }),
})

export const listItemsQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().optional(),
    type: z.enum(['LOST', 'FOUND']).optional(),
    category: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    status: z.enum(['ACTIVE', 'CLAIM_PENDING', 'CLAIMED', 'RESOLVED', 'EXPIRED']).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    sort: z.enum(['newest', 'oldest', 'eventDate']).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  }),
})

export const itemIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
})
