import { z } from 'zod'

export const createReportSchema = z.object({
  body: z.object({
    itemId: z.string().min(1),
    reason: z.enum(['SPAM', 'FAKE_LISTING', 'INAPPROPRIATE_CONTENT', 'INCORRECT_INFORMATION', 'OTHER']),
    description: z.string().trim().max(2000).optional(),
  }),
})

export const reviewReportSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    action: z.enum(['DISMISS_REPORT', 'HIDE_ITEM', 'WARN_USER', 'SUSPEND_USER']),
  }),
})
