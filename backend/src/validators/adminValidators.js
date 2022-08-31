import { z } from 'zod'

export { paginationQuerySchema } from './paginationSchema.js'

export const createCampusSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    domain: z.string().trim().toLowerCase().min(3).max(255).optional(),
  }),
})

export const createCategorySchema = z.object({
  body: z.object({ name: z.string().trim().min(2).max(60) }),
})

export const createLocationSchema = z.object({
  body: z.object({
    campusId: z.string().min(1),
    name: z.string().trim().min(2).max(120),
    building: z.string().trim().max(120).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
})

export const listReportsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'DISMISSED', 'ACTIONED']).optional(),
  }),
})

export const userIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
})

export const idParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
})

export const updateCategorySchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ name: z.string().trim().min(2).max(60) }),
})

export const updateLocationSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    building: z.string().trim().max(120).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  }),
})
