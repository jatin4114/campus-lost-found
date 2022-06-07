import { z } from 'zod'

export const reportItemSchema = z.object({
  type: z.enum(['LOST', 'FOUND']),
  title: z.string().trim().min(2, 'Title is too short').max(150),
  categoryId: z.string().min(1, 'Select a category'),
  locationId: z.string().min(1, 'Select a location'),
  eventDate: z.string().min(1, 'Select a date'),
  description: z.string().trim().min(10, 'Add a bit more detail (min 10 characters)').max(2000),
})
