import { z } from 'zod'

export const submitRatingSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    score: z.number().int().min(1).max(5),
    comment: z.string().trim().max(500).optional(),
  }),
})

export const claimIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
})

export const userIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
})
