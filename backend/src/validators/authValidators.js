import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().toLowerCase().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
  }),
})

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
})

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1),
  }),
})
