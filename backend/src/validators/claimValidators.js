import { z } from 'zod'

export const createClaimSchema = z.object({
  params: z.object({ itemId: z.string().min(1) }),
  body: z.object({
    message: z.string().trim().min(10).max(2000),
    evidence: z
      .array(
        z.object({
          type: z.enum(['DESCRIPTION', 'IMAGE', 'PURCHASE_INFO', 'IDENTIFYING_DETAIL']),
          content: z.string().trim().min(1).max(2000),
        }),
      )
      .min(1, 'Provide at least one piece of evidence.'),
  }),
})

export const claimIdParamSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
})
